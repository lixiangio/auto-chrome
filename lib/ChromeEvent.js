"use strict"

const debug = require('debug');
const Page = require('./Page');

const debugSend = debug('chrome:send');
const debugMessage = debug('chrome:message');
const debugMessageOther = debug('chrome:message:other');

const { logger, timechain } = require('./helper');

class Event {

   constructor() {

      this.id = 1 // 消息自增id
      this.callbacks = new Map() // WebSocket异步消息队列
      this.targets = new Map() // target信息列表
      this.pages = new Map() // page信息列表

   }
   /**
    * 发送消息，不包含session
    * @param {String} method 方法名
    * @param {Object} params 参数
    */
   send(method = '', params = {}) {

      let id = this.id++

      let message = { id, method, params };

      debugSend(id, method, message)

      // 发送消息
      this.ws.send(JSON.stringify(message))

      return new Promise((resolve, reject) => {
         this.callbacks.set(id, { resolve, reject, method })
         timechain.set(reject, `${method}消息等待超时`)
      }).catch(error => {
         logger.error(id, new Error(error.message))
      })

   }
   /**
    * 接收消息（异步）
    */
   listen(data) {

      const message = JSON.parse(data);

      // 带id为主动消息
      if (message.id) {

         let { id, result, error } = message

         debugMessage(id, message)

         const callback = this.callbacks.get(id)

         if (callback) {
            timechain.delete(callback.reject)
            this.callbacks.delete(id);
            if (error) {
               callback.reject(error)
            } else {
               callback.resolve(result);
            }
         }

      }

      // 不带id为被动消息
      else {

         let { method, params } = message

         // 带sessionId的Target子消息
         if (method === 'Target.receivedMessageFromTarget') {
            let { targetId, message } = params
            let page = this.pages.get(targetId)
            if (page) {
               page[method](message)
            } else {
               debugMessageOther(method, params)
            }
         } else {
            debugMessageOther(method, params)
            if (this[method]) {
               this[method](params)
            }
         }

      }

   }
   /**
    * targetCreated事件
    */
   async 'Target.targetCreated'({ targetInfo }) {

      let { type, targetId } = targetInfo

      // target为page类型
      if (type === 'page') {

         if (!this.page) {
            this.page = new Page(this, targetId)
         }

         let page = this.page

         this.pages.set(targetId, page)

         // 通过给定targetId获取sessionId
         let { sessionId } = await this.send('Target.attachToTarget', { targetId })

         page.sessionId = sessionId

         this.keyboard = page.keyboard

         this.mouse = page.mouse

         this.touch = page.touch

         await page.emulate(this.emulate)

         // 忽略https错误
         if (this.ignoreHTTPSErrors) {
            await page.send('Security.enable')
         }

         await page.send('Page.enable')

         await page.send('Runtime.enable')

      }

   }
   /**
    * Target分离，当删除标签时自动聚焦到最后一个标签
    * @param {*} param
    */
   'Target.detachedFromTarget'({ targetId }) {

      // 删除标签后将最后一个标签置于活跃状态
      if (this.pages.delete(targetId)) {

         let size = this.pages.size
         let page = [...this.pages][size - 1]
         page = page && page[1]
         if (page) {
            this.page = page
            if (this.isClose === false) {
               this.page.send('Page.bringToFront')
            }
         }

      }

   }
   /**
    * Target崩溃
    */
   'Target.targetCrashed'({ targetId }) {

      this.pages.delete(targetId)

   }
}

module.exports = Event
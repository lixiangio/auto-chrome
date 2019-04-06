"use strict"

const Page = require('./Page.js');
const helper = require('./helper.js');

const { logger, timechain, restartPromise, sleep } = helper;

class ChromeEvent {

   constructor(ws) {

      this.ws = ws
      this.id = 1 // 消息自增id
      this.callbacks = new Map() // WebSocket异步消息队列
      this.targets = new Map() // target信息列表
      this.pages = new Map() // page信息列表

      this.ws.on('message', this.message.bind(this))

      this.newPagePromise = new restartPromise(3000, error => {
         logger.warn('newPagePromise等待超时')
      })

   }
   /**
    * 发送消息，不包含session
    * @param {String} method 方法名
    * @param {Object} params 参数
    */
   send(method = '', params = {}) {

      let id = this.id++

      let message = { id, method, params }

      // 发送消息
      this.ws.send(JSON.stringify(message))

      return new Promise((resolve, reject) => {
         this.callbacks.set(id, { resolve, reject, method })
         timechain.set(reject, `${method}消息超时`)
      }).catch(error => {
         logger.error(error)
      })

   }
   /**
    * 接收消息（异步）
    */
   message(data) {

      const message = JSON.parse(data);

      // 带id为主动消息
      if (message.id) {

         let { id, result, error } = message

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
               page.message(message);
            }
         } else {
            if (this[method]) {
               this[method](params)
            }
         }

      }

   }
   /**
    * 等待页面装载
    */
   async loadPage() {

      if (this.newPagePromise.state !== 'pending') {
         this.newPagePromise = this.newPagePromise.restart()
      }

      await Promise.all([
         this.newPagePromise,
         this.page.waitCtx(),
         this.page.waitLoad()
      ])

   }
   /**
    * 自动导航（主动监测）
    * @param {Number} delay 等待导航最大毫秒数
    */
   async autoLoad(delay = 1200) {

      let { page } = this

      if (page) {

         if (page.sessionId) {

            let { contextId, ctxPromise, loadPromise, ctxTime } = page;

            if (contextId) {

               await ctxPromise

               await loadPromise

               // 循环监测
               for (let i = 1; i <= (delay / 100); i++) {

                  await sleep(100);

                  // 原标签
                  if (page === this.page) {

                     if (ctxTime !== page.ctxTime) {

                        // 为url重定向保留时间
                        await sleep(800)

                        await page.loadPromise

                        return

                     }

                  }

                  // 新标签
                  else {

                     await this.autoLoad()

                     return

                  }

               }

            } else {

               await Promise.all([
                  page.waitCtx(),
                  page.waitLoad()
               ])

            }

         } else {

            await this.loadPage()

         }

      } else {

         await this.loadPage()

      }

   }
   /**
    * 设置网络连接类型
    * @param {String} type 网络连接类型
    */
   async connectionType(connectionType) {

      await this.send('Network.enable')

      await this.send('Network.emulateNetworkConditions', { connectionType })

   }
   async getTargets() {

      return await this.send('Target.getTargets')

   }
   /**
    * targetCreated事件，仅在创建page或frame时触发
    */
   async 'Target.targetCreated'({ targetInfo }) {

      let { type } = targetInfo

      // target为page类型
      if (type === 'page') {

         logger.success(`创建新标签`)

         let { targetId } = targetInfo

         let page = new Page(this, targetId)

         this.page = page

         this.pages.set(targetId, page)

         // 通过给定targetId获取sessionId
         let { sessionId } = await this.send('Target.attachToTarget', { targetId })

         page.sessionId = sessionId;

         this.keyboard = page.keyboard

         this.mouse = page.mouse

         this.touch = page.touch

         let list = [
            page.send('Page.enable'),
            page.send('Runtime.enable'),
            page.emulate(this.emulate),
         ]

         // 忽略https错误
         if (this.ignoreHTTPSErrors) {
            list.push(page.send('Security.enable'))
         }

         await Promise.all(list)

         this.newPagePromise.resolve()

      }

   }
   async 'Target.targetInfoChanged'({ targetInfo }) {

      let { type, url, title } = targetInfo

      // target为page类型
      if (type === 'page') {

         this.page.url = url

         this.page.title = title

      }

   }
   /**
    * Target崩溃
    */
   'Target.targetCrashed'({ targetId }) {

      this.pages.delete(targetId)

      logger.warn(`目标${targetId}崩溃`)

   }
}

module.exports = ChromeEvent
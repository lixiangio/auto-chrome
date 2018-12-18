"use strict"

const Page = require('./Page');

const helper = require('./helper');

const { logger, timechain, timerPromise, sleep } = helper

class ChromeEvent {

   constructor(ws) {

      this.ws = ws
      this.mid = 1 // 消息自增id
      this.callbacks = new Map() // WebSocket异步消息队列
      this.targets = new Map() // target信息列表
      this.pages = new Map() // page信息列表

      this.ws.on('message', this.listen.bind(this))

      this.createPromise = new timerPromise(2000, error => {
         logger.warn('createPromise等待超时')
      })

   }
   /**
    * 发送消息，不包含session
    * @param {String} method 方法名
    * @param {Object} params 参数
    */
   send(method = '', params = {}) {

      let id = this.mid++

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
   listen(data) {

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
               page[method](message)
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

      this.createPromise = this.createPromise.restart()

      let list = [this.createPromise]

      if (!this.page.contextId) {
         list.push(this.page.waitCtx())
      }

      if (this.page.loadPromise.state !== 'pending') {
         list.push(this.page.waitLoad())
      }

      await Promise.all(list)

   }
   /**
    * 自动导航（主动监测）
    * @param {Number} delay 等待导航最大毫秒数
    */
   async autoLoad(delay = 1200) {

      if (!this.page) {

         await this.loadPage()

         return

      }

      let { page } = this

      if (!page.sessionId) {

         await this.loadPage()

         return

      }

      if (!page.contextId) {

         await Promise.all([
            page.waitCtx(),
            page.waitLoad()
         ])

         return

      }

      let { contextId } = page

      // 循环监测
      for (let i = 1; i <= (delay / 100); i++) {

         await sleep(100)

         // 原标签
         if (page === this.page) {

            if (contextId !== page.contextId) {

               await page.waitLoad()

               return

            }

         }

         // 新标签
         else {

            let list = []

            if (!this.page.contextId) {

               list.push(this.page.waitCtx())

            }

            list.push(this.page.waitLoad())

            await Promise.all(list)

            return

         }

      }

   }
   /**
    * 关闭标签后，等待标签自动切换
    */
   waitClose() {

      if (this.closePromise) {
         this.closePromise = this.closePromise.restart()
      } else {
         this.closePromise = new timerPromise(1200, error => {
            logger.warn('closePromise等待超时')
         })
      }

      return this.closePromise

   }
   /**
    * 设置网络连接类型
    * @param {String} type 网络连接类型
    */
   async connectionType(connectionType) {

      await this.send('Network.enable')

      await this.send('Network.emulateNetworkConditions', { connectionType })

   }
   /**
    * targetCreated事件，仅在创建page或frame时触发
    */
   async 'Target.targetCreated'({ targetInfo }) {

      let { type } = targetInfo

      // target为page类型
      if (type === 'page') {

         let { targetId } = targetInfo

         let page = new Page(this, targetId)

         this.page = page

         this.pages.set(targetId, page)

         // 通过给定targetId获取sessionId
         let { sessionId } = await this.send('Target.attachToTarget', { targetId })

         page.sessionId = sessionId

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

         this.createPromise.resolve()

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
    * Target分离，当删除标签时自动聚焦到最后一个标签
    * @param {*} param
    */
   async 'Target.detachedFromTarget'({ targetId }) {

      if (this.pages.delete(targetId)) {

         let prevPage = [...this.pages][this.pages.size - 1]

         if (prevPage) {

            let [, page] = prevPage

            this.page = page

            if (this.closePromise) {

               this.closePromise.resolve()

            }

            logger.log(`关闭标签，重新聚焦至上一个page`)

         }

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
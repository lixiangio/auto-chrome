const EventEmitter = require('events');
const debug = require('debug');
const Page = require('./Page');

const debugSend = debug('chrome:send');
const debugMessage = debug('chrome:message');
const debugMessageOther = debug('chrome:message:other');

const { signale, zPromise } = require('./helper');

class Event extends EventEmitter {
   constructor() {

      super()
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

      let message = JSON.stringify({ id, method, params });

      debugSend(id, method, message)

      this.ws.send(message);

      return new Promise((resolve, reject) => {
         this.callbacks.set(id, { resolve, reject, method });
      }).catch(error => {
         signale.error(id, new Error(error.message))
      })

   }
   /**
    * 接收消息（异步）
    */
   onMessage(data) {

      const object = JSON.parse(data);

      // 带id为主动消息
      if (object.id) {

         debugMessage(object.id, object.result)

         const callback = this.callbacks.get(object.id);
         if (callback) {
            this.callbacks.delete(object.id);
            if (object.error) {
               callback.reject(object.error)
            } else {
               callback.resolve(object.result);
            }
         }

      }

      // 不带id为被动消息
      else {

         // 带sessionId的Target子消息
         if (object.method === 'Target.receivedMessageFromTarget') {
            let { targetId, message } = object.params
            let page = this.pages.get(targetId)
            if (page) {
               page[object.method](message)
            } else {
               debugMessageOther(object.method, object.params)
            }
         } else {
            debugMessageOther(object.method, object.params)
            if (this[object.method]) {
               this[object.method](object.params)
            }
         }

      }

   }
   /**
    * 创建Target
    */
   async 'Target.targetCreated'({ targetInfo }) {

      let { type, targetId } = targetInfo

      // 限制target类型为page
      if (type === 'page') {

         // 创建实例，同步更新this.page
         this.page = new Page(this, targetInfo)

         // this.chrome.emit('createPage', this.page)

         // 通过给定targetId获取sessionId
         let { sessionId } = await this.send('Target.attachToTarget', { targetId })

         this.page.sessionId = sessionId

         let page = this.pages.get(targetId)

         if (page) {
            Object.assign(this.page, page)
            this.pages.set(targetId, this.page)
         } else {
            this.pages.set(targetId, this.page)
         }

         this.keyboard = this.page.keyboard

         this.mouse = this.page.mouse

         this.touch = this.page.touch

         // 默认仿真配置
         if (this.emulate) {
            await this.page.emulate(this.emulate)
         }

         if (this.ignoreHTTPSErrors) {
            await this.page.send('Security.enable')
         }

         await this.page.send('Page.enable')

         await this.page.send('Runtime.enable')

         this.awaitTargetCreated.resolve()

      }

   }
   // /**
   //  * Target发生变更后需要获取新的FrameTree
   //  */
   // async 'Target.targetInfoChanged'({ targetInfo }) {

   //    let { targetId } = targetInfo

   //    if (targetId === this.page.targetId) {

   //    }

   // }
   /**
    * Target分离，用于监听关闭标签事件
    * @param {*} param0 
    */
   'Target.detachedFromTarget'({ targetId }) {

      // 删除标签后将最后一个标签置于活跃状态
      if (this.pages.delete(targetId)) {
         let tid
         let keys = this.pages.keys()
         for (let id of keys) { tid = id }
         this.page = this.pages.get(tid)
         if (this.page) {
            if (this.isClose === false) {
               this.page.send('Page.bringToFront')
            }
         }
      }

   }
   /**
    * Target崩溃
    * @param {*} param0 
    */
   'Target.targetCrashed'({ targetId }) {
      this.pages.delete(targetId)
   }
}

module.exports = Event
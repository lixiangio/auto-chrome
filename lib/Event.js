const EventEmitter = require('events');
const debug = require('debug');
const Page = require('./Page');

const debugSend = debug('chrome:send');
const debugMessage = debug('chrome:message');
const debugMessageOther = debug('chrome:message:other');
const { signale, promise } = require('./helper');

class Event extends EventEmitter {
   constructor() {

      super()
      this.id = 1 // 消息自增id
      this.callbacks = new Map() // WebSocket异步消息队列
      this.sessionCallbacks = new Map() // 带session的异步消息队列
      this.targets = new Map() // target信息列表
      this.pages = new Map() // page信息列表
      
      // 首次加载时等待标签就绪
      this.waitTargetCreated = promise()

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
         this.callbacks.set(id, { resolve, reject, method, error: new Error() });
      }).catch(error => {
         signale.error(`mid：${id}，${error.message}`)
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

         if (object.method === 'Target.receivedMessageFromTarget') {
            this.page[object.method](object.params)
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
    * @param {*} param0 
    */
   async 'Target.targetCreated'({ targetInfo }) {

      let { type, targetId } = targetInfo

      // 限制target类型为page
      if (type === 'page') {

         // 通过给定targetId获取sessionId
         let { sessionId } = await this.send('Target.attachToTarget', { targetId })

         let callbacks = this.sessionCallbacks

         // 创建实例，同步更新this.page
         this.page = new Page(this, { ...targetInfo, callbacks, sessionId })

         let page = this.page

         // 默认仿真配置
         if (this.emulate) {
            await page.emulate(this.emulate)
         }

         // 通过chrome.newPage()创建的target需要触发Promise结束等待
         let newPage = this.pages.get(targetId)

         if (newPage) {
            newPage.resolve(page)
         }

         this.pages.set(targetId, page)

         this.keyboard = page.keyboard

         this.mouse = page.mouse

         this.touch = page.touch

         let { frameTree } = await page.send('Page.getFrameTree')

         page.mainFrame = frameTree.frame

         // page.send('Network.enable')

         if (this.ignoreHTTPSErrors) {
            page.send('Security.enable')
         }

         page.send('Page.enable')

         page.send('Runtime.enable')

         this.waitTargetCreated.resolve()

      }
   }
   /**
    * Target发生变更后需要获取新的FrameTree
    * @param {*} param0 
    */
   async 'Target.targetInfoChanged'({ targetInfo }) {

      if (targetInfo.type === 'page') {
         if (this.page) {
            let { frameTree } = await this.page.send('Page.getFrameTree')
            if (frameTree) {
               this.page.mainFrame = frameTree.frame
            }
         }
      }

   }
   /**
    * Target
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
            this.page.send('Page.bringToFront')
         }
      }
   }

   'Target.targetCrashed'({ targetId }) {
      this.pages.delete(targetId)
   }
}

module.exports = Event
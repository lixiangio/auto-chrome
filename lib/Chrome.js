const EventEmitter = require('events');
const debug = require('debug');
const Page = require('./Page');
const { Keyboard, Mouse, Touchscreen } = require('./Input');
const { sleep, signale } = require('./helper');

const debugSend = debug('chrome:send');
const debugMessage = debug('chrome:message');
const debugCallback = debug('chrome:callback');

class Chrome extends EventEmitter {
   /**
    * 
    * @param {*} param0 
    */
   constructor(ws) {

      super()
      this.ws = ws
      this.id = 1 // 消息自增id
      this.callbacks = new Map() // WebSocket异步消息队列
      this.sessionCallbacks = new Map() // 带session的异步消息队列
      this.targets = new Map() // target信息列表
      this.pages = new Map() // page信息列表
      this.page = undefined // 当前活跃状态的page

   }
   /**
    * 启动浏览器，创建连接
    */
   async run() {

      await new Promise((resolve, reject) => {
         this.ws.on('open', function () {
            resolve()
            signale.success('WebSocket连接成功');
         });
         this.ws.on('error', reject);
      })

      this.ws.on('message', this.onMessage.bind(this))

      if (this.ignoreHTTPSErrors) {
         await this.send('Security.disable', { override: true });
      }

      this.on('Target.targetCreated', async ({ targetInfo }) => {

         debugCallback('Target.targetCreated', targetInfo)

         let { type, targetId } = targetInfo

         if (type === 'page') {

            let { sessionId } = await this.send('Target.attachToTarget', { targetId })

            let callbacks = this.sessionCallbacks

            let page = new Page(this.send.bind(this), { callbacks, targetId, sessionId })

            let newPage = this.pages.get(targetId)

            if (newPage) {
               newPage.resolve(page)
            }

            let pageSend = page.send.bind(page)

            page.keyboard = new Keyboard(pageSend)

            page.mouse = new Mouse(pageSend)

            page.touchscreen = new Touchscreen(pageSend)

            // await page.send('Page.enable');
            // await page.send('Page.getFrameTree');
            // await this.send('Target.setAutoAttach', { autoAttach: true, waitForDebuggerOnStart: false })
            // await page.send('Page.setLifecycleEventsEnabled', { enabled: true }),
            // await page.send('Network.enable', {}),
            // await page.send('Runtime.enable', {}),
            // await page.send('Performance.enable', {})

            this.pages.set(targetId, page)

         }

      });

      this.on('Target.targetInfoChanged', function (data) {
         // debugCallback('Target.targetInfoChanged', data)
      });

      this.on('Target.targetDestroyed', function ({ targetId }) {
         this.pages.delete(targetId)
      });

      this.on('Target.attachedToTarget', function (data) {
         // debugCallback('Target.attachedToTarget', data)
      });

      // 来自session的嵌套消息
      this.on('Target.receivedMessageFromTarget', ({ message }) => {
         message = JSON.parse(message)
         if (message.id) {
            const callback = this.sessionCallbacks.get(message.id);
            if (callback) {
               this.sessionCallbacks.delete(message.id);
               if (message.error) {
                  callback.reject(message.error)
               } else {
                  callback.resolve(message.result);
               }
            }
         }
      });

      await this.send('Target.setDiscoverTargets', { discover: true });

   }
   /**
    * 发送消息，不包含session
    */
   send(method = '', params = {}) {

      let id = this.id++

      let message = JSON.stringify({ id, method, params });

      debugSend(id, method, message)

      this.ws.send(message);

      return new Promise((resolve, reject) => {
         this.callbacks.set(id, { resolve, reject, method, error: new Error() });
      }).catch(error => {
         error.suffix = error.code
         signale.error(error)
         return
      })

   }
   /**
    * 接收消息（异步）
    */
   onMessage(data) {

      const object = JSON.parse(data);

      // 带id为主动通知消息
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

      // 不带id为被动通知消息
      else {

         debugMessage(object.method, object.params)

         // if (object.method === 'Target.receivedMessageFromTarget') {
         // } else if (object.method === 'Target.detachedFromTarget') {
         // } else {
         //    this.emit(object.method, object.params)
         // }

         this.emit(object.method, object.params)

      }

   }
   /**
    * 获取Chrome版本信息
    */
   getVersion() {
      return this.send('Browser.getVersion')
   }
   /**
    * 创建新标签，如果返回空值表示创建失败
    * @param {*} url 新标签的初始url
    */
   async newPage(url = '') {

      let { targetId } = await this.send('Target.createTarget', { url })

      // await this.send('Target.activateTarget', { targetId });

      return await new Promise((resolve, reject) => {
         this.pages.set(targetId, { resolve, reject })
      })

   }
   /**
    * 通过targetId关闭指定的标签
    */
   async close(targetId) {

      return this.send('Target.closeTarget', { targetId })

   }
   /**
    * 关闭浏览器
    */
   close() {

      return this.send('Browser.close')

   }
}

module.exports = Chrome
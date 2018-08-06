const EventEmitter = require('events');
const debug = require('debug');
const Page = require('./Page');
const { Keyboard, Mouse, Touchscreen } = require('./Input');
const { sleep, signale } = require('./helper');

const debugSend = debug('chrome:send');
const debugMessage = debug('chrome:message');
const debugCallback = debug('chrome:callback');

class Listen extends EventEmitter {
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

      this.ws.on('message', this.message.bind(this))

      if (this.ignoreHTTPSErrors) {
         await this.send('Security.disable', { override: true });
      }

      this.onBinding('Target.targetCreated');

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
      this.onBinding('Target.receivedMessageFromTarget');

      await this.send('Target.setDiscoverTargets', { discover: true });

   }
   /**
    * 事件订阅包装函数
    * @param {*} name 事件名称
    */
   onBinding(name) {
      this.on(name, event => this[name](event));
   }
   /**
    * 接收消息（异步）
    */
   message(data) {

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
   async 'Target.targetCreated'({ targetInfo }) {

      debugCallback('Target.targetCreated', targetInfo)

      let { type, targetId } = targetInfo

      if (type === 'page') {

         let { sessionId } = await this.send('Target.attachToTarget', { targetId })

         let callbacks = this.sessionCallbacks

         let page = new Page(this.send.bind(this), { callbacks, targetId, sessionId })

         // await page.send('Security.setOverrideCertificateErrors', { override: true })

         let newPage = this.pages.get(targetId)

         if (newPage) {
            newPage.resolve(page)
         }

         let pageSend = page.send.bind(page)

         page.keyboard = new Keyboard(pageSend)

         page.mouse = new Mouse(pageSend)

         page.touchscreen = new Touchscreen(pageSend)

         this.keyboard = page.keyboard

         this.mouse = page.mouse

         this.touchscreen = page.touchscreen

         // await page.send('Page.enable')
         // await page.send('Network.enable')
         // await page.send('Runtime.enable')
         await page.send('Security.enable')

         this.page = page

         this.pages.set(targetId, page)

      }

   }
   async 'Target.receivedMessageFromTarget'({ message }) {
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
   }
}

module.exports = Chrome
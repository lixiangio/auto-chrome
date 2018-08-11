const EventEmitter = require('events');
const debug = require('debug');
const { Keyboard, Mouse, Touch } = require('./Input');
const { sleep, signale } = require('./helper');

const debugSend = debug('chrome:send:page');

class Page extends EventEmitter {

   constructor(send, { callbacks, targetId, sessionId }) {

      super()
      this.id = 1 // 消息自增id
      this.chromeSend = send
      this.callbacks = callbacks // WebSocket异步消息队列
      this.targetId = targetId
      this.sessionId = sessionId
      this.mainFrame = {} // 页面主框架信息
      this.contextId = 1 // 执行上下文id

      this.keyboard = new Keyboard(this.send.bind(this))
      this.mouse = new Mouse(this.send.bind(this))
      this.touch = new Touch(this.send.bind(this))

      // session嵌套消息
      this.on('Target.receivedMessageFromTarget', ({ message }) => {
         message = JSON.parse(message)
         if (message.id) {
            const callback = this.callbacks.get(message.id);
            if (callback) {
               this.callbacks.delete(message.id);
               if (message.error) {
                  callback.reject(message)
               } else {
                  callback.resolve(message.result);
               }
            }
         } else {
            this.emit(message.method, message.params)
         }
      });

      // 创建上下文时，获取contextId
      this.on('Runtime.executionContextCreated', ({ context }) => {
         if (context.auxData.frameId === this.mainFrame.id) {
            this.contextId = context.id
         }
      });

      // 安全证书错误
      // 由于没有返回关联id，导致线程阻塞，需要强制调用Promise解除阻塞
      this.on('Security.certificateError', async (data) => {
         for (let item of this.callbacks.values()) {
            item.reject(data)
         }
      });

      this.on('Page.javascriptDialogOpening', async data => {
         await this.send('Page.handleJavaScriptDialog', { accept: false });
         signale.success(`关闭${data.type}对话框`, data.message)
      });

      // this.on('Page.lifecycleEvent', event => {
      //    // console.log(event)
      // });

      // this.on('Runtime.executionContextDestroyed', ({ executionContextId }) => {
      //    console.log('Runtime.executionContextDestroyed', executionContextId)
      // });

      // this.on('Runtime.executionContextsCleared', () => {
      // });

   }
   /**
    * 设备仿真
    * @param {Object} options 选项
    */
   async emulate(options) {

      let { hasTouch, geolocation = {}, ...emulate } = options

      emulate = {
         mobile: false,
         deviceScaleFactor: 1,
         width: 0,
         height: 0,
         ...emulate
      }

      await this.send('Emulation.setDeviceMetricsOverride', emulate)

      if (hasTouch) {
         await this.send('Emulation.setTouchEmulationEnabled', { enabled: hasTouch })
      }

      if (geolocation) {
         await this.send('Emulation.setGeolocationOverride', geolocation)
      }

   }
   /**
    * 在当前标签中跳转
    */
   async goto(url = 'chrome://newtab/') {

      return await this.send('Page.navigate', { url });

   }
   /**
    * 发送带session的嵌套消息
    * @param {*} method 
    * @param {*} params 
    */
   async send(method = '', params = {}) {

      let id = this.id++

      debugSend(id, method, params)

      let message = JSON.stringify({ id, method, params });

      this.chromeSend("Target.sendMessageToTarget", { sessionId: this.sessionId, message })

      return new Promise((resolve, reject) => {
         this.callbacks.set(id, { resolve, reject, method, error: new Error() });
      }).catch(error => {
         error.suffix = error.code
         signale.error(error)
      })

   }
   /**
    * 注入包含参数的JS代码，并获取返回值
    * @param {Function} pageFunction 
    * @param {*} args 
    */
   async evaluate(pageFunction, ...args) {

      args = args.map(function (value) {
         return { value }
      })

      let { result } = await this.send('Runtime.callFunctionOn', {
         functionDeclaration: pageFunction.toString(),
         arguments: args,
         executionContextId: this.contextId,
         returnByValue: true,
         awaitPromise: true,
         userGesture: true
      })

      if (result.className === 'TypeError') {
         signale.error(result.description)
         return
      }

      return result.value || result.description

   }
   // /**
   //  * 查找并缓存元素
   //  * @param {String} selector CSS选择器
   //  */
   // async $(selector) {

   //    this.selector = selector

   // }
   /**
    * 聚焦input元素
    * @param {*} selector 
    */
   async focus(selector) {

      return await this.evaluate(function (selector) {
         let input = document.querySelector(selector)
         input.focus()
      }, selector)

   }
   /**
    * 通过选择器获取元素坐标
    * @param {String} selector CSS选择器
    */
   async getBoundingRect(selector) {

      return await this.evaluate(function (selector) {

         let element = document.querySelector(selector)
         if (element) {
            let bounding = element.getBoundingClientRect()
            let { x, y, width, height } = bounding
            return { x, y, width, height }
         }

      }, selector)

   }
   /**
    * 点击元素
    * @param {String} selector CSS选择器
    */
   async click(selector) {

      let bounding = await this.getBoundingRect(selector)

      if (bounding) {
         // 定位到元素中心
         let { x, y, width, height } = bounding
         x = x + width / 2
         y = y + height / 2
         this.mouse.click(x, y)
      }

      return bounding

   }
   /**
    * 表单输入
    * @param {String} text 
    */
   async type(selector, text, options) {

      await this.focus(selector)

      await sleep(600)

      return await this.keyboard.type(text, options)

   }
   /**
    * 滚动元素至指定元素
    * @param {String} selector
    */
   async scroll(selector) {

      let taget = await this.evaluate(async function (selector) {
         let element = document.querySelector(selector)
         if (element) {
            let { y, height } = element.getBoundingClientRect();
            let { innerHeight } = window
            return { innerHeight, y, height }
         }
      }, selector);

      if (taget) {

         let { innerHeight, y, height } = taget

         let centreY = (height + innerHeight) / 2

         y = y - centreY

         await this.mouse.scroll(0, y)

      }

   }
   /**
    * 通过选择器滑动至元素
    * @param {string} selector
    */
   async touchScroll(selector, options = {}) {

      let taget = await this.evaluate(async function (selector) {
         let element = document.querySelector(selector)
         if (element) {
            let { y, height } = element.getBoundingClientRect();
            let { innerHeight } = window
            return { innerHeight, y, height }
         }
      }, selector);

      if (taget) {

         let { innerHeight, y, height } = taget

         let centreY = (height + innerHeight) / 2

         y = y - centreY

         await this.touch.scroll(0, y)

      }

   }
   /**
    * 关闭标签
    */
   close() {

      return this.send('Target.closeTarget', { targetId: this.targetId })

   }
}

module.exports = Page
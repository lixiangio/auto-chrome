const EventEmitter = require('events');
const debug = require('debug');
const debugSend = debug('chrome:send:page');
const { sleep, signale } = require('./helper');

class Page extends EventEmitter {

   constructor(send, { callbacks, targetId, sessionId }) {

      super()
      this.id = 1 // 消息自增id
      this._send = send
      this.callbacks = callbacks // WebSocket异步消息队列
      this.targetId = targetId
      this.sessionId = sessionId
      this.mainFrame // 页面主框架信息
      this.contextId // 执行上下文id

      // 由于Security.certificateError不返回id导致线程阻塞，需要强制调用Promise解除阻塞
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

      // frame绑定时触发
      // this.on('Page.frameAttached', event => {
      //    console.log('Page.frameAttached', event)
      // });

      // frame完成导航时触发
      // this.on('Page.frameNavigated', event => {
      //    console.log('Page.frameNavigated', event)
      // });

      // 创建上下文
      this.on('Runtime.executionContextCreated', ({ context }) => {
         if (context.auxData.frameId === this.mainFrame.id) {
            this.contextId = context.id
         }
      });

      // this.on('Runtime.executionContextDestroyed', ({ executionContextId }) => {
      //    console.log('Runtime.executionContextDestroyed', executionContextId)
      //    // console.log('Runtime.executionContextCreated', executionContextId)
      // });

      // this.on('Runtime.executionContextsCleared', () => {

      // });
   }

   /**
    * 关闭自身标签
    */
   close() {

      return this.send('Target.closeTarget', { targetId: this.targetId })

   }

   /**
    * 注入js代码
    */
   addScript(func, name) {

      return this.send('Page.addScriptToEvaluateOnNewDocument', { source: func.toString(), identifier: name })

   }

   /**
    * 在当前标签中跳转
    */
   async goto(url = '') {

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

      this._send("Target.sendMessageToTarget", { sessionId: this.sessionId, message })

      return new Promise((resolve, reject) => {
         this.callbacks.set(id, { resolve, reject, method, error: new Error() });
      }).catch(error => {
         error.suffix = error.code
         signale.error(error)
      })

   }
   /**
    * 向页面注入js代码，并获取返回值
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
   /**
    * 查找元素
    * @param {String} selector CSS选择器
    */
   async $(selector) {

      if (!selector) return

      return await this.evaluate(function (selector) {
         return document.querySelector(selector).innerText
      }, selector)

   }
   /**
    * input元素聚焦
    * @param {*} selector 
    */
   async focus(selector) {

      await this.evaluate(function (selector) {
         let input = document.querySelector(selector)
         input.focus()
      }, selector)

   }
   /**
    * 点击元素
    * @param {String} selector CSS选择器
    */
   async click(selector) {

      let bounding = await this.evaluate(function (selector) {

         let element = document.querySelector(selector)
         if (element) {
            let Bounding = element.getBoundingClientRect()
            let { x, y, width, height } = Bounding
            return { x, y, width, height }
         }

      }, selector)

      if (bounding) {
         // 定位到元素中心
         let { x, y, width, height } = bounding
         x = x + width / 2
         y = y + height / 2
         this.mouse.click(x, y)
      }

   }
   /**
    * 表单输入
    * @param {String} text 
    */
   async type(text, options) {

      await this.keyboard.type(text, options)

   }
}

module.exports = Page
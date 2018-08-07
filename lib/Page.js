const EventEmitter = require('events');
const debug = require('debug');
const debugSend = debug('chrome:send:page');
const { sleep, signale } = require('./helper');

class Page extends EventEmitter {

   constructor(send, { callbacks, targetId, sessionId }) {

      super()
      this._send = send
      this.targetId = targetId
      this.sessionId = sessionId
      this.callbacks = callbacks // WebSocket异步消息队列
      this.id = 1

      // Security.certificateError不返回id导致线程阻塞，强制调用Promise解除阻塞
      this.on('Security.certificateError', async (data) => {
         for (let item of this.callbacks.values()) {
            item.reject(data)
         }
      });

      this.on('Page.javascriptDialogOpening', async data => {
         await this.send('Page.handleJavaScriptDialog', { accept: false });
         signale.success(`关闭${data.type}对话框`, data.message)
      });

      // 导航完成时触发
      this.on('Page.frameNavigated', event => {
         // console.log(event)
      });

      this.on('Page.lifecycleEvent', event => {

      });

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
         executionContextId: 1,
         arguments: args,
         returnByValue: false,
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
    * @param {String} selector 
    */
   async $(selector) {

      if (!selector) return

      return await this.evaluate(function (selector) {
         return document.querySelector(selector).innerText
      }, selector)

   }

   /**
    * 点击元素
    * @param {String} selector 
    */
   async click(selector) {

      // const handle = await this.$(selector);
      let x = await this.evaluate(function (selector) {
         return document.querySelector(selector)
      }, selector)

      this.mouse.click(0, 0)

   }

}

module.exports = Page
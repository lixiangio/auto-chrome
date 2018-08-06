const debug = require('debug');
const debugSend = debug('chrome:send:page');
const { sleep, signale } = require('./helper');

class Page {

   constructor(send, { callbacks, targetId, sessionId }) {
      this._send = send
      this.targetId = targetId
      this.sessionId = sessionId
      this.callbacks = callbacks // WebSocket异步消息队列
      this.id = 1
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

}

module.exports = Page
const debug = require('debug');
const { signale } = require('./helper');

const debugSendSession = debug('chrome:send:session');
const debugMessageSession = debug('chrome:message:session');

/**
 * 处理来自session的消息
 */
class Message {
   constructor() {
      this.sessionId = undefined
      this.callbacks = new Map() // 带session的异步消息队列
   }
   /**
    * 发送带session的嵌套消息
    * @param {String} method 消息名称
    * @param {Object} params 参数值
    */
   async send(method = '', params = {}) {

      let id = this.id++

      debugSendSession(id, method, params)

      let message = JSON.stringify({ id, method, params })

      this.chrome.send("Target.sendMessageToTarget", { sessionId: this.sessionId, message })

      return new Promise((resolve, reject) => {
         this.callbacks.set(id, { resolve, reject, method, error: new Error() });
      }).catch(error => {
         error.suffix = error.code
         signale.error(error)
      })

   }
   /**
    * session消息分发
    */
   'Target.receivedMessageFromTarget'(message) {
      message = JSON.parse(message)
      debugMessageSession(message.method, message)
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
      } else if (this[message.method]) {
         this[message.method](message.params)
      }
   }
   /**
    * 创建上下文时触发，捕获主框架的contextId
    */
   'Runtime.executionContextCreated'({ context }) {
      if (context.auxData.frameId === this.mainFrame.id) {
         this.contextId = context.id
      }
   }
   /**
    * 安全证书错误
    * 由于没有返回关联id，导致线程阻塞，需要强制调用Promise解除阻塞
    */
   'Security.certificateError'(data) {
      for (let item of this.callbacks.values()) {
         item.reject(data)
      }
   }
   /**
    * 取消Dialog
    */
   async 'Page.javascriptDialogOpening'(data) {
      await this.send('Page.handleJavaScriptDialog', { accept: false });
      signale.success(`关闭${data.type}对话框`, data.message)
   }
   /**
    * 框架导航事件，在创建新窗口时触发
    */
   // 'Page.frameNavigated'({ frame }) {
   //    // if (frame.id === this.mainFrame.id) {
   //    //    this.awaitLoading.resolve()
   //    // }
   // }
   /**
    * 框架开始加载时触发
    */
   // 'Page.frameStartedLoading'(frameId) {
   //    console.log('Page.frameStartedLoading', frameId)
   // }
   /**
    * 框架加载完毕时触发
    */
   'Page.frameStoppedLoading'({ frameId }) {
      if (frameId === this.mainFrame.id) {
         this.awaitLoading.resolve()
      }
   }
   /**
    * 打开新窗口
    * @param {*} param0 
    */
   'Page.windowOpen'() {
   }
   'DOM.getContentQuads'() {
      console.log('DOM.getContentQuads')
   }
}


module.exports = Message
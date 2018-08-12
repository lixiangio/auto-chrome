const debug = require('debug');
const debugMessageSession = debug('chrome:message:session');

class Message {
   constructor(){
   }
   /**
    * session嵌套消息
    * @param {*} param0 
    */
   'Target.receivedMessageFromTarget'({ message }) {
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
    * 创建上下文时，捕获主框架的contextId
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
    * 导航
    */
   'Page.frameNavigated'({ frame }) {
      console.log(frame.id, this.mainFrame.id)
      if (frame.id === this.mainFrame.id) {
         console.log(frame.id)
      }
   }
}


module.exports = Message
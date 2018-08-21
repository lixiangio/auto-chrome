const debug = require('debug');
const { signale, zPromise, timechain } = require('./helper');

const debugSendSession = debug('chrome:send:session');
const debugMessageSession = debug('chrome:message:session');

/**
 * 处理来自session的消息
 */
class Message {
   constructor() {
      this.sessionId = undefined
      this.callbacks = new Map() // 带session的异步消息队列
      this.contextId = 1 // 执行上下文id
   }
   /**
    * 发送带session的嵌套消息
    * @param {String} method 消息名称
    * @param {Object} params 参数值
    */
   send(method = '', params = {}, config = {}) {

      let id = this.id++

      debugSendSession(id, method, params)

      let message = JSON.stringify({ id, method, params })

      this.chrome.send("Target.sendMessageToTarget", { sessionId: this.sessionId, message })

      let promise = new Promise((resolve, reject) => {
         this.callbacks.set(id, { resolve, reject, method });
         timechain.set(reject, '等待返回消息超时')
      })

      // let { timeout } = config
      // if (timeout) {
      //    promise = new zPromise(config)
      //    let { resolve, reject } = promise
      //    this.callbacks.set(id, { resolve, reject, method });
      //    timechain.set(reject, '等待返回消息超时')
      // } else {
      //    promise = new Promise((resolve, reject) => {
      //       this.callbacks.set(id, { resolve, reject, method });
      //       timechain.set(reject, '等待返回消息超时')
      //    })
      // }

      promise.catch(error => {
         if (error instanceof Object) {
            signale.error(new Error(Object.values(error).toString()))
         } else {
            signale.error(new Error(error))
         }
      })

      return promise
   }
   /**
    * session消息分发
    */
   'Target.receivedMessageFromTarget'(message) {

      message = JSON.parse(message)
      if (message.id) {
         debugMessageSession(message.id, message)
         const callback = this.callbacks.get(message.id);
         if (callback) {
            this.callbacks.delete(message.id);
            if (message.error) {
               callback.reject(message.error)
            } else {
               callback.resolve(message.result);
            }
         }
      } else if (this[message.method]) {
         debugMessageSession(message.method, message)
         this[message.method](message.params)
      }

   }
   /**
    * 创建上下文时触发，捕获主框架的contextId
    */
   'Runtime.executionContextCreated'({ context }) {
      if (context.auxData.frameId === this.targetId) {
         this.contextId = context.id
         this.document.objectId = null
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
   'Page.frameNavigated'({ frame }) {

      if (frame.id === this.targetId) {

         // this.chrome.emit('navigation', this)
         this.restartPromis()

      }

   }
   /**
    * 重置Promise
    */
   restartPromis() {

      if (this.awaitLoading) {
         this.awaitLoading = this.awaitLoading.restart()
         this.awaitLoading.catch(error => { })
      } else {
         this.awaitLoading = new zPromise({ timeout: 10000, message: `网页加载超时` })
         this.awaitLoading.catch(error => { })
      }

   }
   /**
    * 框架开始加载时触发
    */
   // 'Page.frameStartedLoading'(frameId) {
   //    console.log('Page.frameStartedLoading', frameId)
   // }
   /**
    * 框架加载完毕时触发，子框架优先级高于主框架
    */
   'Page.frameStoppedLoading'({ frameId }) {

      if (frameId === this.targetId) {
         if (this.awaitLoading) {
            this.awaitLoading.resolve()
         }
      }

   }
   /**
    * 打开新窗口
    * @param {*} param0 
    */
   'Page.windowOpen'() {
   }
   'DOM.getContentQuads'() {
   }
}


module.exports = Message
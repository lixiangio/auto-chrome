"use strict"

const debug = require('debug');
const { logger, zPromise, timechain } = require('./helper');

const debugSendSession = debug('chrome:send:session');
const debugMessageSession = debug('chrome:message:session');

/**
 * 处理来自session的消息
 */
class PageEvent {
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
   send(method = '', params = {}) {

      let id = this.id++

      debugSendSession(id, method, params)

      let message = JSON.stringify({ id, method, params })

      this.chrome.send("Target.sendMessageToTarget", {
         sessionId: this.sessionId,
         message
      })

      return new Promise((resolve, reject) => {
         this.callbacks.set(id, { resolve, reject, method })
         timechain.set(reject, '等待session消息返回超时')
      }).catch(error => {
         if (error instanceof Object) {
            logger.error(`${method}工作异常`, params)
            logger.error(new Error(Object.values(error).toString()))
         } else {
            logger.error(new Error(error))
         }
      })

   }
   /**
    * 路由分发,session消息分发
    */
   'Target.receivedMessageFromTarget'(message) {

      message = JSON.parse(message)
      if (message.id) {
         debugMessageSession(message.id, message)
         const callback = this.callbacks.get(message.id);
         if (callback) {
            timechain.delete(callback.reject)
            this.callbacks.delete(message.id)
            if (message.error) {
               callback.reject(message.error)
            } else {
               callback.resolve(message.result)
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
         // console.log('Runtime.executionContextCreated', context.id)
         this.contextId = context.id
         this.element.objectId = null
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
    * 框架导航事件，在创建新窗口时触发
    */
   'Page.frameNavigated'({ frame }) {

      if (frame.id === this.targetId) {

         console.log('Page.frameNavigated', this.targetId)

         this.restartLode()

      }

   }
   /**
    * 框架加载完毕时触发，子框架优先级高于主框架
    */
   'Page.frameStoppedLoading'({ frameId }) {

      if (frameId === this.targetId) {
         this.loadPromise.resolve()
      }

   }
   /**
    * 取消Dialog
    */
   async 'Page.javascriptDialogOpening'(data) {

      await this.send('Page.handleJavaScriptDialog', { accept: false });
      logger.log(`关闭${data.type}对话框`, data.message)

   }
   /**
    * 重置Promise
    */
   restartLode() {

      if (this.loadPromise.state === 'pending') {
         this.loadPromise.resolve()
      }

      this.loadPromise = this.loadPromise.restart()

      this.loadPromise.catch(error => { })

   }
   /**
    * 打开新窗口
    * @param {*} param0 
    */
   'Page.windowOpen'() { }
   'DOM.getContentQuads'() { }
}


module.exports = PageEvent
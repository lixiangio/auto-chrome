"use strict"

const { logger, timechain, timerPromise } = require('./helper');

/**
 * 处理来自session的消息
 */
class PageEvent {

   constructor() {

      this.mid = 1 // 消息自增id
      this.sessionId = undefined
      this.callbacks = new Map() // 带session的异步消息队列
      this.contextId // 执行上下文id

      this.ctxPromise = new timerPromise(3000, error => {
         logger.warn('ctxPromise等待超时')
      })

      this.loadPromise = new timerPromise(10000, error => {
         logger.warn('loadPromise等待超时')
      })

   }
   /**
    * 重置ctx
    */
   waitCtx() {

      this.ctxPromise = this.ctxPromise.restart()

      return this.ctxPromise

   }
   /**
    * 重置lode，等待页面完成加载
    */
   waitLoad() {

      this.loadPromise = this.loadPromise.restart()

      return this.loadPromise

   }
   /**
    * 发送带session的嵌套消息
    * @param {String} method 消息名称
    * @param {Object} params 参数值
    */
   send(method = '', params = {}) {

      let id = this.mid++

      let message = JSON.stringify({ id, method, params })

      this.chrome.send("Target.sendMessageToTarget", {
         sessionId: this.sessionId,
         message
      })

      return new Promise((resolve, reject) => {
         this.callbacks.set(id, { resolve, reject, method })
         timechain.set(reject, `session消息“${method}”等待超时`)
      }).catch(error => {
         if (error instanceof Object) {
            logger.error(new Error(Object.values(error).toString()))
            logger.error(method, params)
         } else {
            logger.error(new Error(error))
         }
      })

   }
   /**
    * 路由分发，session消息分发
    */
   'Target.receivedMessageFromTarget'(message) {

      message = JSON.parse(message)

      if (message.id) {

         const callback = this.callbacks.get(message.id)

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

         this[message.method](message.params)

      }

   }
   /**
    * 创建上下文时触发，捕获主框架的contextId
    */
   'Runtime.executionContextCreated'({ context }) {

      // 在页面发生导航时切换contextId、清除根element.objectId
      if (context.auxData.frameId === this.targetId) {

         this.element.objectId = null

         this.contextId = context.id

         this.ctxPromise.resolve()

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
    * 框架加载完毕时触发，子框架优先级高于主框架
    */
   'Page.frameStoppedLoading'({ frameId }) {

      if (frameId === this.targetId) {
         this.loadPromise.resolve()
         logger.success("页面加载完毕")
      }

   }
   /**
    * 取消Dialog
    */
   async 'Page.javascriptDialogOpening'(data) {

      await this.send('Page.handleJavaScriptDialog', { accept: false })
      logger.log(`关闭${data.type}对话框`, data.message)

   }
   /**
    * 打开新窗口
    * @param {*} param0 
    */
   'Page.windowOpen'() { }
   'DOM.getContentQuads'() { }
}


module.exports = PageEvent
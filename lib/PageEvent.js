"use strict"

const logger = require('loggercc');
const EventEmitter = require('events');
const timerPromise = require('zpromise/timer.js');
const restartPromise = require('zpromise/restart.js');
const helper = require('./helper.js');

const { timechain } = helper;

/**
 * 处理来自session的消息
 */
class PageEvent extends EventEmitter {
   constructor() {

      super();

      this.id = 1 // 消息自增id
      this.sessionId = undefined // page消息会话id
      this.contextId = undefined // 执行上下文id
      this.callbacks = new Map() // 带session的异步消息队列

      this.loadPromise = new restartPromise(10000);

   }
   /**
    * 发送带session的嵌套消息
    * @param {String} method 消息名称
    * @param {Object} params 参数值
    */
   send(method = '', params = {}) {

      const id = this.id++;

      const subMessage = {
         id,
         method,
         params
      }

      const message = {
         'id': 0, // id值可指定任意数值，不会建立响应关联，因此没有实际用途，但又不可缺省
         'method': "Target.sendMessageToTarget",
         'params': {
            'sessionId': this.sessionId,
            'message': JSON.stringify(subMessage)
         }
      }

      this.connection.send(JSON.stringify(message)); // 发送消息

      return new Promise((resolve, reject) => {

         this.callbacks.set(id, { resolve, reject, method });
         timechain.set(reject, `“${method}”消息等待超时`);

      }).catch(error => {

         if (error instanceof Object) {
            const errorInfo = String(Object.values(error));
            logger.error(errorInfo);
            return { error: errorInfo };
         } else {
            logger.error(String(error));
            return { error };
         }

      })

   }
   /**
    * 消息分发
    */
   message(message) {

      message = JSON.parse(message);

      if (message.id) {

         const callback = this.callbacks.get(message.id);

         if (callback) {

            this.callbacks.delete(message.id);
            timechain.delete(callback.reject);

            if (message.error) {
               callback.reject(message.error);
            } else {
               callback.resolve(message.result);
            }

         }

      } else if (this[message.method]) {

         this[message.method](message.params);

      }

   }
   /**
    * 创建上下文时触发，捕获主框架的contextId
    */
   async 'Runtime.executionContextCreated'({ context }) {

      // 只处理主框架的context
      if (context.auxData.frameId === this.targetId) {

         if (context.origin !== '://') {

            const { origin, id } = context;

            const { objectId } = await this.frame.evaluate({ expression: "document" });

            this.document.objectId = objectId;

            this.contextId = id;

            logger.log(`上下文切换为:${id}`);

            this.loadPromise = this.loadPromise.restart();

            this.chrome.contextCreateTime = Date.now();

            this.emit(`CreatedContext`, origin);

         }

      }

   }
   /**
    * 框架加载完毕时触发，子框架优先级高于主框架
    */
   'Page.frameStoppedLoading'({ frameId }) {

      if (frameId === this.targetId) {

         this.loadPromise.resolve();

      }

   }
   /**
    * 取消Dialog
    */
   async 'Page.javascriptDialogOpening'(data) {

      await this.send('Page.handleJavaScriptDialog', { accept: false });

      logger.log(`关闭${data.type}对话框`, data.message);

   }
   /**
    * 安全证书错误
    * 由于没有返回关联id，导致线程阻塞，需要强制调用Promise解除阻塞
    */
   'Security.certificateError'(data) {

      for (const item of this.callbacks.values()) {
         item.reject(data);
      }

   }
   /**
    * 订阅事件并等待触发
    * @param {String} name 事件名称
    * @param {Function} callback 回调
    * @param {Number} timer 等待超时时间
    */
   oncePromise(name, callback, timer = 10000) {

      const promise = new timerPromise(timer);

      this.once(name,async function (value) {

         if (callback) {
            await callback(value);
         }

         promise.resolve();

      });

      return promise;

   }
}


module.exports = PageEvent;
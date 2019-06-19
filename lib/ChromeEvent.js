"use strict";

const logger = require('loggercc');
const EventEmitter = require('events');
const timerPromise = require('zpromise/timer.js');
const Page = require('./Page.js');
const helper = require('./helper.js');

const { timechain, sleep } = helper;

class ChromeEvent extends EventEmitter {
   constructor(connection) {

      super();
      this.connection = connection;
      this.id = 1; // 消息自增id
      this.callbacks = new Map(); // WebSocket异步消息队列
      this.targets = new Map(); // target信息列表
      this.pages = new Map(); // page信息列表

   }
   /**
    * 发送消息，不包含session
    * @param {String} method 方法名
    * @param {Object} params 参数
    */
   send(method = '', params = {}) {

      const id = this.id++;

      const message = JSON.stringify({ id, method, params });

      this.connection.send(message); // 发送消息

      return new Promise((resolve, reject) => {

         this.callbacks.set(id, {
            resolve,
            reject,
            method
         });

         timechain.set(reject, `${method}消息超时`);

      }).catch(error => {

         logger.error(error);

         return { error };

      });

   }
   /**
    * 接收消息（异步）
    */
   message(data) {

      const message = JSON.parse(data);

      const { id } = message;

      // 带id为主动消息
      if (id) {

         const { result, error } = message;

         const callback = this.callbacks.get(id);

         if (callback) {

            timechain.delete(callback.reject);
            this.callbacks.delete(id);

            if (error) {
               callback.reject(error);
            } else {
               callback.resolve(result);
            }

         }

      }

      // 不带id为被动消息
      else {

         const { method, params } = message;

         // 带sessionId的Target子消息
         if (method === 'Target.receivedMessageFromTarget') {

            const { targetId, message } = params;
            const page = this.pages.get(targetId);

            if (page) {
               page.message(message);
            }

         } else {

            if (this[method]) {
               this[method](params);
            }

         }

      }

   }
   /**
    * 自动导航（主动监测）
    */
   async autoNav(time = 3000) {

      const { contextCreateTime } = this;

      // 每间隔200ms检查一次context是否更新
      for (let i = 1; i <= (time / 200); i++) {

         await sleep(200);

         if (contextCreateTime !== this.contextCreateTime) break;

      }

      await this.page.loadPromise;

      await sleep(1000);

   }
   /**
    * 设置网络连接类型
    * @param {String} type 网络连接类型
    */
   async connectionType(connectionType) {

      await this.send('Network.enable');

      await this.send('Network.emulateNetworkConditions', { connectionType });

   }
   async getTargets() {

      return await this.send('Target.getTargets')

   }
   /**
    * targetCreated事件，仅在创建page或frame时触发
    */
   async 'Target.targetCreated'({ targetInfo }) {

      const { type } = targetInfo;

      // target为page类型
      if (type === 'page') {

         logger.success(`创建新标签`);

         const { targetId } = targetInfo;

         const page = new Page(this, targetId);

         this.page = page;

         this.pages.set(targetId, page);

         this.emit('CreatedPage', page);

         // 通过给定targetId获取sessionId
         const { sessionId } = await this.send('Target.attachToTarget', { targetId })

         page.sessionId = sessionId;

         this.clicker = page.clicker;

         this.keyboard = page.keyboard;

         const list = [
            page.send('Page.enable'),
            page.send('Runtime.enable'),
            page.emulate(this.emulate),
         ];

         // 忽略https错误
         if (this.ignoreHTTPSErrors === true) {
            list.push(
               page.send('Security.enable'),
               page.send('Security.setOverrideCertificateErrors', { override: true })
            );
         }

         if (this.disableDownload === true) {
            list.push(page.send('Page.setDownloadBehavior', { "behavior": "deny" }));
         }

         await Promise.all(list);

      }

   }
   async 'Target.targetInfoChanged'({ targetInfo }) {

      // target为page类型
      if (targetInfo.type === 'page') {

         this.page.url = targetInfo.url;

         this.page.title = targetInfo.title;

      }

   }
   /**
    * Target崩溃
    */
   'Target.targetCrashed'({ targetId }) {

      this.pages.delete(targetId);

      logger.warn(`目标${targetId}崩溃`);

   }
   /**
    * 订阅事件并等待触发
    * @param {String} name 事件名称
    * @param {Function} callback 回调
    * @param {Number} timer 等待超时时间
    */
   async oncePromise(name, callback, timer = 3000) {

      const promise = new timerPromise(timer);

      this.once(name, async function (value) {

         if (callback) {
            await callback(value);
         }

         promise.resolve(value);

      });

      return promise;

   }
}

module.exports = ChromeEvent;
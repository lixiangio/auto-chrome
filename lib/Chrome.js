"use strict";

const logger = require('loggercc');
const ChromeEvent = require('./ChromeEvent.js');
const childProcess = require('child_process');

class Chrome extends ChromeEvent {
   /**
    * @param {Object} args.ws WebSocket实例
    * @param {Boolean} args.process 子进程chrome实例
    * @param {Boolean} args.options.ignoreHTTPSErrors 是否忽略https错误
    * @param {Boolean} args.options.emulate 设备仿真配置
    */
   constructor(args) {

      const { ws, options, process } = args;

      super(ws);

      this.options = options;
      this.process = process;

      const { ignoreHTTPSErrors, emulate, disableDownload } = options;

      this.ignoreHTTPSErrors = ignoreHTTPSErrors;
      this.disableDownload = disableDownload;
      this.emulate = emulate;

   }
   /**
    * 获取Chrome版本信息
    */
   async getVersion() {

      return await this.send('Browser.getVersion');

   }
   /**
    * 初始化浏览器
    */
   async init() {

      await this.send('Target.setDiscoverTargets', { discover: true });

      // 如果浏览器默认标签未完成初始化，则等待标签初始标签准备就绪后再执行
      await this.autoLoad(2000);

   }
   /**
    * 初始化标签页
    */
   async initPage() {

      // 建立last副本，防止关闭所有标签时浏览器自动退出
      const [[, page], ...pages] = this.pages;

      this.page = page;

      const allPromise = [];

      for (const [targetId] of pages) {

         const promise = this.closePageById(targetId);
         allPromise.push(promise);
         this.pages.delete(targetId);

      }

      await Promise.all(allPromise);

   }
   /**
    * 在新创建的标签页中打开网页
    * @param {String} url 新标签的初始url
    */
   async newPage(url = 'about:newtab') {

      await Promise.all([
         this.send('Target.createTarget', { url }),
         this.autoLoad(2000)
      ]);

      return this.page;

   }
   /**
    * 创建新的浏览器上下文，仅支持隐身模式
    */
   async createBrowserContext() {

      return await this.send('Target.createBrowserContext');

   }
   /**
    * 通过targetId关闭指定的标签
    * @param {*} targetId 
    */
   async closePageById(targetId) {

      await this.send('Target.closeTarget', { targetId });

      if (this.pages.delete(targetId)) {

         const lastPage = [...this.pages][this.pages.size - 1];

         if (lastPage) {

            const [, page] = lastPage;

            this.page = page;

         }

      }

   }
   /**
    * 关闭浏览器
    */
   async close() {

      logger.log('关闭浏览器');

      // await this.send('Browser.close').then(data => {

      //    // 返回错误消息时，强制退出chrome进程
      //    if (data.error) {

      //       logger.warn('Browser.close消息响应超时，强制退出进程');

      //       const { pid } = this.process;

      //       // 强制杀死进程
      //       childProcess.execSync(`taskkill /pid ${pid} -f`);

      //       // this.process.kill();

      //    }

      // })

      const { pid } = this.process;

      // 强制杀死进程
      childProcess.execSync(`taskkill /pid ${pid} -f`);

   }
}

module.exports = Chrome;
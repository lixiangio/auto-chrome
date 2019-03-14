"use strict"

const ChromeEvent = require('./ChromeEvent');

const helper = require('./helper');

const { logger } = helper;

class Chrome extends ChromeEvent {
   /**
    * @param {Object} ws WebSocket实例
    * @param {Boolean} ignoreHTTPSErrors 是否忽略https错误
    */
   constructor(ws, ignoreHTTPSErrors = true, emulate = {}) {

      super(ws)
      this.ignoreHTTPSErrors = ignoreHTTPSErrors
      this.emulate = emulate

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
      let [[, page], ...pages] = this.pages

      this.page = page

      let list = []

      for (let [targetId] of pages) {
         this.pages.delete(targetId)
         list.push(this.closePage(targetId))
      }

      await Promise.all(list)

   }
   /**
    * 在新创建的标签页中打开网页
    * @param {String} url 新标签的初始url
    */
   async newPage(url = 'about:newtab') {

      await Promise.all([
         this.send('Target.createTarget', { url }),
         this.autoLoad(2000)
      ])

      return this.page

   }
   /**
    * 创建新的浏览器上下文，仅支持隐身模式
    */
   async createBrowserContext() {

      return await this.send('Target.createBrowserContext')

   }
   /**
    * 通过targetId关闭指定的标签
    * @param {*} targetId 
    */
   async closePage(targetId) {

      await this.send('Target.closeTarget', { targetId })

      if (this.pages.delete(targetId)) {

         let lastPage = [...this.pages][this.pages.size - 1]

         if (lastPage) {

            let [, page] = lastPage

            this.page = page

         }

      }

   }
   /**
    * 关闭浏览器
    */
   async close() {

      logger.log('关闭浏览器')

      for (let [, page] of this.pages) {
         await page.close()
      }

      // await this.send('Browser.close')

   }
}

module.exports = Chrome
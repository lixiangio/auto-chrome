"use strict"

const ChromeEvent = require('./ChromeEvent');

class Chrome extends ChromeEvent {
   /**
    * 
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

      return await this.send('Browser.getVersion')

   }
   /**
    * 初始化浏览器
    */
   async init() {

      await this.send('Target.setDiscoverTargets', { discover: true })

      // 如果浏览器默认标签未完成初始化，则等待标签初始标签准备就绪后再执行
      await this.autoLoad()

   }
   /**
    * 初始化标签页
    */
   async initPage() {

      // 建立last副本，防止关闭所有标签时浏览器自动退出
      let [...pages] = this.pages

      await this.newPage()

      let list = []

      for (let [tid, page] of pages) {
         list.push(page.close())
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
         this.autoLoad()
      ])

      return this.page

   }
   /**
    * 通过targetId关闭指定的标签
    * @param {*} targetId 
    */
   async closePage(targetId) {

      await Promise.all([
         this.send('Target.closeTarget', { targetId }),
         this.waitClose()
      ])

   }
   /**
    * 关闭浏览器
    */
   async close() {

      return await this.send('Browser.close')

   }
}

module.exports = Chrome
"use strict"

const ChromeEvent = require('./ChromeEvent');
const Page = require('./Page');

class Chrome extends ChromeEvent {
   /**
    * 
    * @param {Object} ws WebSocket实例
    * @param {Boolean} ignoreHTTPSErrors 是否忽略https错误
    */
   constructor(ws, ignoreHTTPSErrors = true, emulate = {}) {

      super()

      this.ws = ws
      this.isClose = false
      this.ignoreHTTPSErrors = ignoreHTTPSErrors
      this.emulate = emulate

      this.ws.on('message', this.listen.bind(this))

   }
   /**
    * 获取Chrome版本信息
    */
   getVersion() {

      return this.send('Browser.getVersion')

   }
   /**
    * 初始化浏览器
    */
   async init() {

      // 启用全局Target事件监听
      await this.send('Target.setDiscoverTargets', { discover: true })

      await this.initPage()

   }
   /**
    * 初始化标签页
    */
   async initPage() {

      // 建立last副本，防止关闭所有标签时浏览器自动退出
      let [...pages] = this.pages

      await this.newPage()

      let all = []

      for (let [id, page] of pages) {
         all.push(page.close())
      }

      await Promise.all(all)

   }
   /**
    * 在新创建的标签页中打开网页
    * @param {String} url 新标签的初始url
    */
   async newPage(url = 'about:newtab') {

      this.page = new Page(this)

      let { targetId } = await this.send('Target.createTarget', { url })

      this.page.targetId = targetId

      await this.page.navPromise.catch(() => {
         throw new Error(`打开网页${url}超时`)
      })

      return this.page

   }
   /**
    * 通过targetId关闭指定的标签
    * @param {*} targetId 
    */
   async closePage(targetId) {

      return await this.send('Target.closeTarget', { targetId })

   }
   /**
    * 关闭浏览器
    */
   async close() {

      this.isClose = true

      return await this.send('Browser.close')

   }
}

module.exports = Chrome
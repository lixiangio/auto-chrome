"use strict"

const Event = require('./Event');
const Page = require('./Page');
const { logger, sleep, zPromise } = require('./helper');

class Chrome extends Event {
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
      this.page

      this.ws.on('message', this.listen.bind(this))

   }
   /**
    * 获取Chrome版本信息
    */
   getVersion() {

      return this.send('Browser.getVersion')

   }
   async init() {

      // 启用全局Target事件监听
      await this.send('Target.setDiscoverTargets', { discover: true })

      await this.initPage()

   }
   /**
    * 在新创建的标签页中打开网页
    * @param {String} url 新标签的初始url
    */
   async newPage(url = 'about:newtab') {

      let { targetId } = await this.send('Target.createTarget', { url })

      await sleep(1000)

      this.page = this.pages.get(targetId)

      await this.page.loadPromise.catch(() => {
         logger.warn(`打开网页${url}超时`)
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
}

module.exports = Chrome
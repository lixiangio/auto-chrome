const Event = require('./Event');
const { signale, zPromise } = require('./helper');

class Chrome extends Event {
   /**
    * 
    * @param {Object} ws WebSocket实例
    * @param {Boolean} ignoreHTTPSErrors 是否忽略https错误
    */
   constructor(ws, ignoreHTTPSErrors = true, emulate) {

      super()
      this.ws = ws
      this.isClose = false
      this.ignoreHTTPSErrors = ignoreHTTPSErrors
      this.emulate = emulate
      this.page // 当前活跃状态的page

      // 等待初始标签准备就绪
      this.awaitTargetCreated = new zPromise()

   }
   async run() {

      this.ws.on('message', this.onMessage.bind(this))

      // 启用全局Target事件监听
      this.send('Target.setDiscoverTargets', { discover: true });

      // 等待this.page初始标签准备就绪
      await this.awaitTargetCreated

   }
   /**
    * 获取Chrome版本信息
    */
   getVersion() {

      return this.send('Browser.getVersion')

   }
   /**
    * 创建新标签，如果返回空值表示创建失败
    * @param {String} url 新标签的初始url
    */
   async newPage(url = 'about:newtab') {

      let { targetId } = await this.send('Target.createTarget', { url })

      let awaitLoading = new zPromise({ delay: 10000, message: `网页加载超时` })

      this.pages.set(targetId, { awaitLoading })

      await awaitLoading.catch(info => {
         signale.warn(info)
      })

      return this.pages.get(targetId)

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

      let [...pages] = await this.pages

      this.page = await this.newPage()

      for (let [id, page] of pages) {
         await page.close()
      }

   }
}

module.exports = Chrome
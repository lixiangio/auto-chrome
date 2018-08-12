const Event = require('./Event');
const { signale, promise } = require('./helper');

class Chrome extends Event {
   /**
    * 
    * @param {*} ws WebSocket实例
    * @param {*} ignoreHTTPSErrors 是否忽略https错误
    */
   constructor(ws, ignoreHTTPSErrors = true, emulate = {}) {

      super()
      this.ws = ws
      this.ignoreHTTPSErrors = ignoreHTTPSErrors
      this.emulate = emulate
      this.page = undefined // 当前活跃状态的page

   }
   async run() {

      this.ws.on('message', this.onMessage.bind(this))

      // 启用全局Target监听
      this.send('Target.setDiscoverTargets', { discover: true });

      // 等待this.page初始标签准备就绪
      await this.waitTargetCreated

   }
   /**
    * 获取Chrome版本信息
    */
   getVersion() {

      return this.send('Browser.getVersion')

   }
   /**
    * 创建新标签，如果返回空值表示创建失败
    * @param {*} url 新标签的初始url
    */
   async newPage(url = 'chrome://newtab/') {

      let { targetId } = await this.send('Target.createTarget', { url })

      // 通过Target.targetCreated事件解除Promise等待
      return await new Promise((resolve, reject) => {
         this.pages.set(targetId, { resolve, reject })
      })

   }
   /**
    * 通过targetId关闭指定的标签
    * @param {*} targetId 
    */
   async closePage(targetId) {

      return this.send('Target.closeTarget', { targetId })

   }
   /**
    * 关闭浏览器
    */
   close() {

      return this.send('Browser.close')

   }
}

module.exports = Chrome
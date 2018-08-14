const Message = require('./Message');
const { Keyboard, Mouse, Touch } = require('./Input');
const { sleep, signale } = require('./helper');

class Page extends Message {

   constructor(chrome, { targetId }) {

      super()
      this.id = 1 // 消息自增id
      this.chrome = chrome
      this.targetId = targetId

      this.keyboard = new Keyboard(this)
      this.mouse = new Mouse(this)
      this.touch = new Touch(this)

   }
   /**
    * 设备仿真
    * @param {Object} options 选项
    */
   async emulate(options) {

      let { hasTouch, geolocation = {}, ...emulate } = options

      emulate = {
         mobile: false,
         deviceScaleFactor: 1,
         width: 0,
         height: 0,
         ...emulate
      }

      await this.send('Emulation.setDeviceMetricsOverride', emulate)

      if (hasTouch) {
         await this.send('Emulation.setTouchEmulationEnabled', { enabled: hasTouch })
      }

      if (geolocation) {
         await this.send('Emulation.setGeolocationOverride', geolocation)
      }

   }
   /**
    * 在当前标签中跳转
    */
   async goto(url = 'about:blank') {

      return await this.send('Page.navigate', { url });

   }
   /**
    * 注入包含参数的JS代码，并获取返回值
    * @param {Function} func
    * @param {*} args
    */
   async evaluate(func, ...args) {

      func = func.toString()

      args = args.map(function (value) {
         return { value }
      })

      // 相比Runtime.evaluate，Runtime.callFunctionOn是转为函数而设计
      let { result } = await this.send('Runtime.callFunctionOn', {
         functionDeclaration: func,
         arguments: args,
         executionContextId: this.contextId,
         returnByValue: true,
         awaitPromise: true,
         userGesture: true
      })

      if (result.className === 'TypeError') {
         signale.error(result.description)
         return
      }

      return result.value || result.description

   }
   // /**
   //  * 查找并缓存元素
   //  * @param {String} selector CSS选择器
   //  */
   // async $(selector) {

   //    this.selector = selector

   // }
   /**
    * 聚焦input元素
    * @param {*} selector 
    */
   async focus(selector) {

      return await this.evaluate(function (selector) {
         let input = document.querySelector(selector)
         input.focus()
      }, selector)

   }
   /**
    * 通过选择器获取元素坐标
    * @param {String} selector CSS选择器
    */
   async getBoundingRect(selector) {

      return await this.evaluate(function (selector) {

         let element = document.querySelector(selector)
         if (element) {
            let bounding = element.getBoundingClientRect()
            let { x, y, width, height } = bounding
            return { x, y, width, height }
         }

      }, selector)

   }
   /**
    * 获取网页标题
    */
   async title() {

      return await this.evaluate(() => document.title)

   }
   /**
    * 点击元素
    * @param {String} selector CSS选择器
    */
   async click(selector) {

      let bounding = await this.getBoundingRect(selector)

      if (bounding) {
         // 定位到元素中心
         let { x, y, width, height } = bounding
         x = x + width / 2
         y = y + height / 2
         this.mouse.click(x, y)
      }

      return bounding

   }
   /**
    * 表单输入
    * @param {String} text 
    */
   async type(selector, text, options) {

      await this.focus(selector)

      await sleep(600)

      return await this.keyboard.type(text, options)

   }
   /**
    * 滚动元素至指定元素
    * @param {String} selector
    */
   async scroll(selector) {

      let taget = await this.evaluate(async function (selector) {
         let element = document.querySelector(selector)
         if (element) {
            let { y, height } = element.getBoundingClientRect();
            let { innerHeight } = window
            return { innerHeight, y, height }
         }
      }, selector);

      if (taget) {

         let { innerHeight, y, height } = taget

         let centreY = (height + innerHeight) / 2

         y = y - centreY

         await this.mouse.scroll(0, y)

      }

   }
   /**
    * 通过选择器滑动至元素
    * @param {string} selector
    */
   async touchScroll(selector, options = {}) {

      let taget = await this.evaluate(async function (selector) {
         let element = document.querySelector(selector)
         if (element) {
            let { y, height } = element.getBoundingClientRect();
            let { innerHeight } = window
            return { innerHeight, y, height }
         }
      }, selector);

      if (taget) {

         let { innerHeight, y, height } = taget

         let centreY = (height + innerHeight) / 2

         y = y - centreY

         await this.touch.scroll(0, y)

      }

   }
   /**
    * 关闭标签
    */
   close() {

      return this.send('Target.closeTarget', { targetId: this.targetId })

   }
}

module.exports = Page
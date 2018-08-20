const Message = require('./Message');
const Element = require('./Element');
const { Keyboard, Mouse, Touch } = require('./Input');
const { sleep, signale, zPromise } = require('./helper');

class Page extends Message {

   constructor(chrome, { targetId }) {

      super()
      this.id = 1 // 消息自增id
      this.chrome = chrome
      this.targetId = targetId

      this.document = new Element(this)
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
   async goto(url = 'about:newtab') {

      let result = await this.send('Page.navigate', { url });

      this.restartPromis()

      await this.awaitLoading.catch(info => {
         signale.warn(info)
      })

      return result

   }

   /**
    * 注入包含参数的JS函数，并获取返回值
    * @param {Function} func
    * @param {*} args
    */
   async evaluate(func, ...args) {

      func = func.toString()

      args = args.map(function (value) {
         return { value }
      })

      let result = await this.document.evaluate({
         func,
         args,
         returnByValue: true
      })

      if (result.className === 'TypeError') {
         signale.error(new Error(result.description))
         return
      }

      if (result.value) {
         return result.value
      }

   }
   /**
    * 查找并缓存元素
    * @param {String} selector CSS选择器
    */
   async $(selector) {

      let element = await this.document.$(selector)

      if (element) {
         return element
      }

   }
   /**
    * 查找并缓存元素
    * @param {String} selector CSS选择器
    */
   async $$(selector) {

      let element = await this.document.$$(selector)

      if (element) {
         return element
      }

   }
   /**
    * 通过选择器获取元素坐标
    * @param {String} selector CSS选择器
    */
   async getBoundingRect(selector) {

      let element = await this.document.$(selector)

      if (element) {
         return await element.getBoundingRect()
      }

   }
   /**
    * 获取网页标题
    */
   async title() {

      return await this.evaluate(document => document.title)

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
         await this.mouse.click(x, y)

         return bounding

      }

   }
   /**
    * 滚动元素至指定元素
    * @param {String} selector
    */
   async scroll(selector) {

      let bounding = await this.getBoundingRect(selector)

      if (bounding) {

         let { innerHeight, y, height } = bounding

         let centreY = (height + innerHeight) / 2

         y = y - centreY

         await this.mouse.scroll(0, y)

         return bounding

      }

   }
   /**
    * 通过选择器滑动至元素
    * @param {string} selector
    */
   async touchScroll(selector, options = {}) {

      let bounding = await this.getBoundingRect(selector)

      if (bounding) {

         let { innerHeight, y, height } = bounding

         let centreY = (height + innerHeight) / 2

         y = y - centreY

         await this.touch.scroll(0, y)

         return bounding

      }

   }
   /**
    * 聚焦input元素
    * @param {String} selector 
    */
   async focus(selector) {

      let element = await this.$(selector)

      if (element) {

         await element.focus()

         return element

      }

   }
   /**
    * 键盘入
    * @param {String} selector CSS选择器
    * @param {String} text 输入文本
    * @param {Object} options 附加选项
    */
   async type(selector, text, options) {

      let element = await this.$(selector)

      if (element) {

         await element.type(text, options)

         return element

      }

   }
   /**
    * 关闭标签
    */
   async close() {

      return await this.send('Target.closeTarget', { targetId: this.targetId })

   }
}

module.exports = Page
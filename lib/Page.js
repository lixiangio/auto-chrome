"use strict"

const Keyboard = require('./Keyboard');
const { Mouse, Touch } = require('./Clicker');

const Runtime = require('./Runtime');
const Element = require('./Element');
const PageEvent = require('./PageEvent');

const { logger } = require('./helper');

class Page extends PageEvent {

   constructor(chrome, targetId) {

      super()

      this.id = 1 // 消息自增id
      this.chrome = chrome
      this.targetId = targetId

      this.keyboard = new Keyboard(this)
      this.mouse = new Mouse(this)
      this.touch = new Touch(this)

      this.runtime = new Runtime(this)
      this.element = new Element(this)

   }
   /**
    * 设备仿真配置
    * @param {Object} options 选项
    */
   async emulate(options) {

      let { viewport, isTouch, geolocation } = options

      if (viewport) {
         await this.send('Emulation.setDeviceMetricsOverride', {
            deviceScaleFactor: 1,
            ...viewport
         })
      }

      if (isTouch) {
         await this.send('Emulation.setTouchEmulationEnabled', { enabled: true })
         this.clicker = this.touch
         this.chrome.clicker = this.touch
      } else {
         this.clicker = this.mouse
         this.chrome.clicker = this.mouse
      }

      if (geolocation) {
         await this.send('Emulation.setGeolocationOverride', geolocation)
      }

   }
   /**
    * 在当前标签中打开网页
    */
   async goto(url = 'about:newtab') {

      let result = await Promise.all([
         this.send('Page.navigate', { url }),
         this.waitNavigation()
      ]).catch(() => {
         logger.warn(`打开网页${url}超时`)
      })

      if (result) {
         return result[0]
      }

   }
   /**
    * 返回上一个历史页
    */
   async prev() {

      return await this.history({ relative: -1 });

   }
   /**
    * 返回下一个历史页
    */
   async next() {

      return await this.history({ relative: 1 })

   }
   /**
    * 定位到指定历史页面
    * @param {Object} options 配置项
    * @param {Number} options.absolute 绝对位移量
    * @param {Number} options.relative 相对位移量
    */
   async history(options) {

      const { entries, currentIndex } = await this.send('Page.getNavigationHistory')

      const { absolute, relative } = options

      if (absolute) {
         var entry = entries[absolute]
      } else if (relative) {
         var entry = entries[currentIndex + relative]
      }

      if (entry) {
         await this.send('Page.navigateToHistoryEntry', { entryId: entry.id })
      }

   }
   /**
    * 执行包含参数的远程JS函数，并获取返回值
    * @param {Function} func
    * @param {*} args
    */
   async run(functionDeclaration, ...args) {

      // 将参数格式化为对象
      args = args.map(function (value) {
         return { value }
      })

      return await this.runtime.callFunctionOn({
         functionDeclaration,
         arguments: args,
         // returnByValue: true
      })

   }
   /**
    * 查找并缓存元素
    * @param {String} selector CSS选择器
    */
   async $(selector) {

      return await this.element.$(selector)

   }
   /**
    * 查找并缓存元素
    * @param {String} selector CSS选择器
    */
   async $$(selector) {

      return await this.element.$$(selector)

   }
   /**
    * 通过选择器获取元素坐标
    * @param {String} selector CSS选择器
    */
   async getBoundingRect(selector) {

      let element = await this.element.$(selector)

      if (element) {
         return await element.getBoundingRect()
      }

   }
   /**
    * 点击元素
    * @param {String} selector CSS选择器
    */
   async click(selector) {

      let element = await this.$(selector)

      if (element) {

         await element.click()

         return element

      }

   }
   /**
    * 滚动网页至指定元素
    * @param {String} selector
    */
   async scroll(selector) {

      let bounding = await this.getBoundingRect(selector)

      if (bounding) {

         let { windowHeight, y, height } = bounding

         let centreY = (height + windowHeight) / 2

         y = y - centreY

         await this.clicker.scroll(0, y)

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

         await element.click()

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

      let { targetId } = this

      return await this.send('Target.closeTarget', { targetId })

   }
   /**
    * 获取网页标题
    */
   async title() {

      let { value } = await this.runtime.evaluate({
         expression: "document.title"
      })

      return value

   }
   /**
    * 获取url
    */
   async url() {

      let { value } = await this.runtime.evaluate({
         expression: "window.location.href"
      })

      return value

   }
}

module.exports = Page
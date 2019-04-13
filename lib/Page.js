"use strict"

const { logger } = require('./helper.js');
const { Mouse, Touch } = require('./Clicker.js');
const Keyboard = require('./Keyboard.js');
const Frame = require('./Frame.js');
const Element = require('./Element.js');
const PageEvent = require('./PageEvent.js');

class Page extends PageEvent {

   constructor(chrome, targetId) {

      super(chrome);

      this.chrome = chrome;
      this.ws = chrome.ws;
      this.targetId = targetId;

      this.keyboard = new Keyboard(this);
      this.mouse = new Mouse(this);
      this.touch = new Touch(this);

      this.frame = new Frame(this);
      this.document = new Element(this);

   }
   /**
    * 设备仿真配置
    * @param {Object} options 选项
    */
   async emulate(options) {

      let { viewport, geolocation } = options

      if (viewport) {

         await this.send('Emulation.setDeviceMetricsOverride', {
            deviceScaleFactor: 0,
            mobile: false,
            width: viewport.screenWidth,
            height: Math.floor(viewport.screenHeight * 0.87),
            ...viewport
         })

         if (viewport.mobile) {
            this.clicker = this.touch
         } else {
            this.clicker = this.mouse
         }

      } else {

         this.clicker = this.mouse

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
         this.chrome.autoLoad(2000)
      ]).catch(() => {
         logger.warn(`打开链接${url}超时`);
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
         await this.send('Page.navigateToHistoryEntry', {
            entryId: entry.id
         })
      }

   }
   /**
    * 远程执行JS函数，并获取返回值
    * @param {Function} func
    * @param {*} args
    */
   async run(functionDeclaration, ...args) {

      // 将参数格式化为对象
      args = args.map(function (value) {
         return { value }
      })

      return await this.frame.callFunctionOn({
         functionDeclaration,
         arguments: args
      })

   }
   /**
    * 查找并缓存元素
    * @param {String} selector CSS选择器
    */
   async $(selector) {

      return await this.document.$(selector)

   }
   /**
    * 查找并缓存元素
    * @param {String} selector CSS选择器
    */
   async $$(selector) {

      return await this.document.$$(selector)

   }
   /**
    * 通过remote对象创建新的Element实例
    * @param {Objecet} remote 由callFunctionOn()、evaluate()函数返回的远程对象
    */
   newElementByRemote(remote) {

      return this.document.create(remote)

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
    * 回车输入
    */
   async enter() {

      // 触发导航
      await Promise.all([
         this.keyboard.press("Enter"),
         this.chrome.autoLoad(2000)
      ])

   }
   /**
    * 滚动网页至指定元素
    * @param {String} selector
    */
   async scroll(selector) {

      let bounding = await this.getBoundingRect(selector)

      if (bounding) {

         let { innerHeight, y, height } = bounding

         let centreY = (height + innerHeight) / 2

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

      await this.chrome.closePageById(this.targetId)

   }
   /**
    * 获取网页标题
    */
   async title() {

      let { value } = await this.frame.evaluate({
         expression: "document.title"
      })

      return value

   }
   /**
    * 获取url
    */
   async url() {

      let { value } = await this.frame.evaluate({
         expression: "window.location.href"
      })

      return value

   }
}

module.exports = Page
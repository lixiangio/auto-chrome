"use strict";

const logger = require('loggercc');
const Mouse = require('./Mouse.js');
const Touch = require('./Touch.js');
const Keyboard = require('./Keyboard.js');
const Frame = require('./Frame.js');
const Element = require('./Element.js');
const PageEvent = require('./PageEvent.js');

class Page extends PageEvent {

   constructor(chrome, targetId) {

      super(chrome);

      this.chrome = chrome;
      this.connection = chrome.connection;
      this.targetId = targetId;
      
      this.frame = new Frame(this);
      this.document = new Element(this);
      this.keyboard = new Keyboard(this);
      
   }
   /**
    * 设备仿真配置
    * @param {Object} options 选项
    */
   async emulate(options = {}) {

      const { viewport, geolocation } = options;

      if (viewport) {

         if (viewport.mobile) {

            this.clicker = new Touch(this);

         } else {

            this.clicker = new Mouse(this);

         }

         await this.send('Emulation.setDeviceMetricsOverride', {
            deviceScaleFactor: 0,
            mobile: false,
            width: viewport.screenWidth,
            height: Math.floor(viewport.screenHeight * 0.87),
            ...viewport
         })
         
      } else {

         this.clicker = new Mouse(this);

      }

      if (geolocation) {

         await this.send('Emulation.setGeolocationOverride', geolocation);

      }

   }
   /**
    * 在当前标签中打开网页
    */
   async goto(url = 'about:newtab') {

      const result = await Promise.all([
         this.chrome.autoNav(),
         this.send('Page.navigate', { url })
      ]).catch(() => {
         logger.warn(`打开链接${url}超时`);
      })

      if (result) {
         return result[0];
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

      return await this.history({ relative: 1 });

   }
   /**
    * 定位到指定历史页面
    * @param {Object} options 配置项
    * @param {Number} options.absolute 绝对位移量
    * @param {Number} options.relative 相对位移量
    */
   async history(options) {

      const { entries, currentIndex } = await this.send('Page.getNavigationHistory')

      const { absolute, relative } = options;

      let entry;

      if (absolute) {
         entry = entries[absolute];
      } else if (relative) {
         entry = entries[currentIndex + relative];
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
    * @param {Array} args
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

      return await this.document.$(selector);

   }
   /**
    * 查找并缓存元素
    * @param {String} selector CSS选择器
    */
   async $$(selector) {

      return await this.document.$$(selector);

   }
   /**
    * 通过remote对象创建新的Element实例
    * @param {Objecet} remote 由callFunctionOn()、evaluate()函数返回的远程对象
    */
   newElementByRemote(remote) {

      return this.document.create(remote);

   }
   /**
    * 通过选择器获取元素坐标
    * @param {String} selector CSS选择器
    */
   async getBoundingRect(selector) {

      const element = await this.document.$(selector)

      if (element) {
         return await element.getBoundingRect()
      }

   }
   /**
    * 点击元素
    * @param {String} selector CSS选择器
    */
   async click(selector) {

      const element = await this.$(selector);

      if (element) {

         await element.click();

         return element;

      }

   }
   /**
    * 点击元素，内置导航
    * @param {String} selector CSS选择器
    */
   async clickNav(selector) {

      const element = await this.$(selector);

      if (element) {

         await element.clickNav();

         return element;

      }

   }
   /**
    * 输入回车
    */
   async enter() {

      // 触发导航
      await Promise.all([
         this.chrome.autoNav(3000),
         this.keyboard.press("Enter")
      ])

   }
   /**
    * 滚动网页至指定元素
    * @param {String} selector
    */
   async scroll(selector) {

      const element = await this.$(selector);

      if (element) {

         await element.scroll();

         return element;
         
      }

   }
   /**
    * 聚焦input元素
    * @param {String} selector 
    */
   async focus(selector) {

      const element = await this.$(selector);

      if (element) {

         await element.click();

         return element;

      }

   }
   /**
    * 键盘入
    * @param {String} selector CSS选择器
    * @param {String} text 输入文本
    * @param {Object} options 附加选项
    */
   async type(selector, text, options) {

      const element = await this.$(selector)

      if (element) {

         await element.type(text, options);

         return element;

      }

   }
   /**
    * 关闭标签
    */
   async close() {

      await this.chrome.closePageById(this.targetId);

   }
   /**
    * 获取网页标题
    */
   async title() {

      const { value } = await this.frame.evaluate({ expression: "document.title" })

      return value;

   }
   /**
    * 获取url
    */
   async url() {

      const { value } = await this.frame.evaluate({ expression: "window.location.href" })

      return value;

   }
}

module.exports = Page;
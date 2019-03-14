"use strict"

const { sleep, logger } = require('./helper');

/**
 * 用于实现可追溯的远程elment，实际上是devtools保存了注入函数的执行结果并生成查询id
 * 通过状态跟踪，可以在已有远程结果基于上做增量操作，避免了代码的重复提交和执行
 */
class Element {
   /**
    * @param {Function} page page实例
    * @param {Object} message 远程element对象描述信息
    */
   constructor(page, remote) {

      this.page = page

      this.frame = page.frame

      if (remote) {

         const { objectId, description, className } = remote

         this.objectId = objectId;
         this.description = description;
         this.className = className;

      }

   }
   /**
    * 创建新的Element实例
    * @param {Object} remote 远程资源对象
    */
   create(remote) {

      return new Element(this.page, remote)

   }
   /**
    * CSS单选迭代选择器
    * @param {String} selector 
    */
   async $(selector) {

      let { objectId } = this

      let remote = await this.frame.callFunctionOn({
         functionDeclaration: (element, selector) => {
            return element.querySelector(selector)
         },
         arguments: [{ objectId }, { value: selector }]
      })

      let { className, description } = remote

      if (className === 'TypeError') {

         logger.warn(new Error(description))

         return

      }

      if (remote.objectId) {

         // 创建新的远程子节点实例
         return this.create(remote);

      }

   }
   /**
    * CSS多选迭代选择器
    * @param {String} selector 
    */
   async $$(selector) {

      let { objectId } = this

      let remote = await this.frame.callFunctionOn({
         functionDeclaration: (element, selector) => {
            return element.querySelectorAll(selector)
         },
         arguments: [{ objectId }, { value: selector }]
      })

      let { className, description } = remote

      if (className === 'TypeError') {
         logger.warn(new Error(description))
         return
      }

      if (remote.objectId) {

         let { result } = await this.page.send('Runtime.getProperties', {
            objectId: remote.objectId,
            "ownProperties": true
         })

         let elements = []

         // 批量创建子节点实例
         for (let item of result) {
            let { enumerable, value } = item
            if (enumerable === true) {
               let element = this.create(value)
               elements.push(element)
            }
         }

         elements.objectId = remote.objectId

         return elements

      }

   }
   /**
    * 取值
    * @param {*} name 属性名称
    */
   async get(name) {

      let { objectId } = this

      let result = await this.frame.callFunctionOn({
         functionDeclaration: (element, name) => element[name],
         arguments: [{ objectId }, { value: name }]
      })

      return result.value

   }
   /**
    * 设置值
    * @param {String} name 属性名称
    * @param {*} value 属性值
    */
   async set(name, value) {

      let { objectId } = this

      let result = await this.frame.callFunctionOn({
         functionDeclaration: (element, name, value) => {
            return element[name] = value
         },
         arguments: [{ objectId }, { value: name }, { value }]
      })

      return result.value

   }
   /**
    * 获取或设置值，仅适用于input元素
    * @param {*} value 赋值
    */
   async value(value) {

      let { objectId } = this

      if (value) {
         var result = await this.frame.callFunctionOn({
            functionDeclaration: (element, value) => {
               return element.value = value
            },
            arguments: [{ objectId }, { value }]
         })
      } else {
         var result = await this.frame.callFunctionOn({
            functionDeclaration: element => element.value,
            arguments: [{ objectId }]
         })
      }

      return result.value

   }
   /**
    * 获取元素坐标信息
    */
   async getBoundingRect() {

      let { objectId } = this

      let result = await this.frame.callFunctionOn({
         functionDeclaration: element => {
            let { x, y, width, height } = element.getBoundingClientRect()
            let { innerHeight, innerWidth } = window
            let innerText = element.innerText
            return {
               x, y, width, height,
               innerHeight,
               innerWidth,
               innerText
            }
         },
         arguments: [{ objectId }],
         returnByValue: true
      })

      return result.value

   }

   /**
    * 滚动至元素
    */
   async scroll() {

      let { mouse, clicker } = this.page

      if (mouse === clicker) {

         let result = await this.getBoundingRect()

         let { x, y, height, innerHeight } = result

         let centreY = (innerHeight - height) / 2

         y = y - centreY

         await clicker.scroll(x, y)

      } else {

         await this.loopScroll()

      }

   }
   /**
    * 递归滚动至元素
    * 在每个单次滚动后重新计数坐标，防止DOM更新后原坐标失效
    * 当chrome不稳定导致事件未执行时，采用实时坐标提供了错误补救的机会
    */
   async loopScroll() {

      let result = await this.getBoundingRect()

      let { y, height, innerWidth, innerHeight } = result

      let centreY = (innerHeight - height) / 2

      y = y - centreY

      // 模拟随机坐标，让每次的滑动轨迹都不一样
      let startX = Math.round(innerWidth * (0.3 + Math.random() * 0.4))
      let startY = Math.round(innerHeight * (0.8 + Math.random() * 0.15))

      let endX = Math.round(startX + Math.random() * 0.1)
      let endY = Math.round(innerHeight * (0.1 + Math.random() * 0.15))

      let moveY = startY - endY

      // 末端补齐
      if (y > moveY) {
         y -= moveY
      } else {
         endY = startY - y
         y = 0
      }

      let start = {
         x: startX,
         y: startY
      }

      let end = {
         x: endX,
         y: endY
      }

      await this.page.touch.slide({ start, end })

      // 分多次发送滑动事件
      if (y > 0) {

         await this.loopScroll()

      }

   }
   /**
    * 点击元素
    */
   async click() {

      // await this.label()

      const result = await this.getBoundingRect()

      let { x, y, width, height } = result

      // 定位到元素中心
      x = x + width / 2
      y = y + height / 2

      await Promise.all([
         this.page.clicker.click(x, y),
         this.page.chrome.autoLoad(2000)
      ])

      return result

   }

   /**
    * 标亮元素
    */
   async label() {

      let { objectId } = this

      await this.frame.callFunctionOn({
         functionDeclaration: element => {
            element.style.border = "1px solid #ed0000"
         },
         arguments: [{ objectId }]
      })

      await sleep(500)

   }

   /**
    * 键盘输入
    * @param {*} text 输入文本
    * @param {*} options 附加选项
    */
   async type(text, options) {

      return await this.page.keyboard.type(text, options)

   }
}

module.exports = Element
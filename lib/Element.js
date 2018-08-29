"use strict"

const { sleep, logger } = require('./helper');

/**
 * 用于实现可追溯的远程elment，实际上是devtools保存了注入函数的执行结果并生成查询id
 * 通过状态跟踪，可以在已有远程结果基于上做增量操作，避免了代码的重复提交和执行
 */
class Element {
   /**
    * 
    * @param {Function} page page实例
    * @param {Object} message 匹配远程element对象描述信息
    */
   constructor(page, message) {

      this.page = page

      if (message) {
         Object.assign(this, message)
      }

   }
   /**
    * 注入包含参数的JS代码，并获取返回值
    * @param {Object} options evaluate选项
    */
   async evaluate(options = {}) {

      let { func, returnByValue = false, args = [] } = options

      let objectId = this.objectId

      if (objectId) {

         args.unshift({ objectId })

         let { result } = await this.page.send('Runtime.callFunctionOn', {
            executionContextId: this.page.contextId,
            functionDeclaration: func.toString(),
            arguments: args,
            returnByValue,
            awaitPromise: true,
            userGesture: true
         })

         if (result.className === 'TypeError') {
            logger.error(new Error(result.description))
            return
         }

         return result

      } else {

         // 获取初始document资源引用id
         let { result } = await this.page.send('Runtime.evaluate', {
            contextId: this.page.contextId,
            expression: `document`,
            returnByValue: false,
            awaitPromise: true,
            userGesture: true
         })

         let { className, description, objectId } = result

         if (className === 'TypeError') {
            logger.error(new Error(description))
            return
         }

         if (objectId) {

            Object.assign(this, { objectId })

            return await this.evaluate(options)

         }

      }

   }
   /**
    * CSS单选迭代选择器
    * @param {String} selector 
    */
   async $(selector) {

      // 子查询
      let { objectId, className, description } = await this.evaluate({
         func: (element, selector) => element.querySelector(selector),
         args: [{ value: selector }]
      })

      if (className === 'TypeError') {
         logger.error(new Error(description))
         return
      }

      if (objectId) {

         // 创建新的子节点实例
         return new Element(this.page, { objectId })

      }

   }
   /**
    * CSS多选迭代选择器
    * @param {String} selector 
    */
   async $$(selector) {

      let { objectId } = await this.evaluate({
         func: (element, selector) => element.querySelectorAll(selector),
         args: [{ value: selector }]
      })

      if (objectId) {

         let { result } = await this.page.send('Runtime.getProperties', {
            objectId,
            "ownProperties": true
         })

         let elements = []

         for (let item of result) {
            if (item.enumerable === true) {
               // 批量创建子节点实例
               let element = new Element(this.page, item.value)
               elements.push(element)
            }
         }

         Object.assign(elements, { objectId })

         return elements

      }

   }
   /**
    * 获取或设置值
    * @param {*} selector 
    */
   async value(value) {

      if (value) {
         return await this.evaluate({
            func: (element, value) => { element.value = value },
            args: [{ value }]
         })
      } else {
         return await this.evaluate({
            func: element => element.value
         })
      }

   }
   /**
    * 获取值
    * @param {*} name 属性名称
    */
   async get(name) {

      let { value } = await this.evaluate({
         func: (element, name) => element[name],
         args: [{ value: name }]
      })

      return value

   }
   /**
    * 设置值
    * @param {*} name 属性名称
    * @param {*} value 属性值
    */
   async set(name, value) {

      return await this.evaluate({
         func: (element, name, value) => { element[name] = value },
         args: [{ value: name }, { value }]
      })

   }
   /**
    * 通过选择器获取元素坐标
    * @param {String} selector CSS选择器
    */
   async getBoundingRect() {

      let { value } = await this.evaluate({
         func: element => {
            let { x, y, width, height } = element.getBoundingClientRect()
            let { innerHeight, innerWidth } = window
            return { x, y, width, height, innerHeight, innerWidth }
         },
         returnByValue: true
      })

      return value

   }

   /**
    * 点击元素
    */
   async click() {

      let { x, y, width, height } = await this.getBoundingRect()

      // 定位到元素中心
      x = x + width / 2
      y = y + height / 2
      await this.page.mouse.click(x, y)

   }

   /**
    * 滚动至元素
    */
   async scroll() {

      let { x, y, height, innerHeight } = await this.getBoundingRect()

      let centreY = (height + innerHeight) / 2

      y = y - centreY

      await this.page.mouse.scroll(x, y)

   }

   /**
    * 聚焦input元素
    * @param {*} selector 
    */
   async focus() {

      // 在focus前需要使用鼠标或键盘激活页面
      await this.page.mouse.move(300, 100)

      return await this.page.send('DOM.focus', { objectId: this.objectId })

   }

   /**
    * 键盘入
    * @param {*} text 输入文本
    * @param {*} options 附加选项
    */
   async type(text, options) {

      await sleep(600)

      return await this.page.keyboard.type(text, options)

   }
}

module.exports = Element
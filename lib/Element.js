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

      this.runtime = page.runtime

      if (!remote) return

      const { objectId, description, className } = remote

      this.objectId = objectId
      this.description = description
      this.className = className

   }
   /**
    * 如果objectId不存在则补齐
    */
   async supplementId() {

      // 当objectId作用域不存在时，默认使用document.body作为远程节点
      if (!this.objectId) {

         let remote = await this.runtime.callFunctionOn({
            functionDeclaration: () => document.body,
         })

         this.objectId = remote.objectId

      }

      return this.objectId

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

      let objectId = await this.supplementId()

      let remote = await this.runtime.callFunctionOn({
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

         // 创建新的子节点实例
         return this.create(remote)

      }

   }
   /**
    * CSS多选迭代选择器
    * @param {String} selector 
    */
   async $$(selector) {

      let objectId = await this.supplementId()

      let remote = await this.runtime.callFunctionOn({
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

      let objectId = await this.supplementId()

      let result = await this.runtime.callFunctionOn({
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

      let objectId = await this.supplementId()

      let result = await this.runtime.callFunctionOn({
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

      let objectId = await this.supplementId()

      if (value) {
         var result = await this.runtime.callFunctionOn({
            functionDeclaration: (element, value) => {
               return element.value = value
            },
            arguments: [{ objectId }, { value }]
         })
      } else {
         var result = await this.runtime.callFunctionOn({
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

      let objectId = await this.supplementId()

      let result = await this.runtime.callFunctionOn({
         functionDeclaration: element => {
            let { x, y, width, height } = element.getBoundingClientRect()
            let { innerHeight: windowHeight, innerWidth: windowWidth } = window
            let innerText = element.innerText
            return {
               x, y, width, height,
               windowHeight, windowWidth,
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

      let result = await this.getBoundingRect()

      let { x, y, height, windowHeight } = result

      let centreY = (windowHeight - height) / 2

      y = y - centreY

      await this.page.clicker.scroll(x, y)

      return result

   }

   /**
 * 点击元素
 */
   async click() {

      const result = await this.getBoundingRect()

      let { x, y, width, height } = result

      // 定位到元素中心
      x = x + width / 2
      y = y + height / 2

      let { objectId } = this

      await this.runtime.callFunctionOn({
         functionDeclaration: (element) => {
            element.style.border = "1px solid #ed0000"
         },
         arguments: [{ objectId }]
      })

      await sleep(600)

      await this.page.clicker.click(x, y)

      return result

   }

   /**
    * 键盘输入
    * @param {*} text 输入文本
    * @param {*} options 附加选项
    */
   async type(text, options) {

      await sleep(500)

      return await this.page.keyboard.type(text, options)

   }
}

module.exports = Element
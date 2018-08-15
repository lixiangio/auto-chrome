const { sleep, signale } = require('./helper');

/**
 * 用于实现可追溯的远程elment，实际上是devtools保存了注入函数的执行结果并生成查询id
 * 通过状态跟踪，可以在已有远程结果基于上做增量操作，避免了代码的重复提交和执行
 */
class Element {
   /**
    * 
    * @param {Function} send 
    * @param {Object} info 匹配远程element对象描述信息
    */
   constructor(page, info) {

      this.page = page

      if (info) {
         Object.assign(this, info)
      }

   }
   /**
    * 注入包含参数的JS代码，并获取返回值
    * @param {Function} func
    * @param {*} args
    */
   async evaluate(options = {}) {

      let { func, returnByValue = false, args = [] } = options

      let objectId = this.objectId
      if (objectId) {
         args.unshift({ objectId })
      }

      let { result } = await this.page.send('Runtime.callFunctionOn', {
         executionContextId: this.page.contextId,
         functionDeclaration: func.toString(),
         arguments: args,
         returnByValue,
         awaitPromise: true,
         userGesture: true
      })

      if (result.className === 'TypeError') {
         signale.error(result.description)
         return
      }

      return result

   }
   /**
    * CSS单选迭代选择器
    * @param {String} selector 
    */
   async $(selector) {

      if (this.objectId) {

         // 子查询
         let result = await this.evaluate({
            func: (element, selector) => element.querySelector(selector),
            args: [{ value: selector }]
         })

         if (result.objectId) {

            // 创建新的子节点实例
            return new Element(this.page, result)

         }

      } else {

         let result = await this.evaluate({
            func: selector => document.querySelector(selector),
            args: [{ value: selector }]
         })

         if (result.objectId) {

            Object.assign(this, result)

            return this

         }

      }

   }
   /**
    * 聚焦input元素
    * @param {*} selector 
    */
   async focus() {

      return await this.evaluate({
         func: element => element.focus()
      })

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

      return await this.evaluate({
         func: element => {
            let bounding = element.getBoundingClientRect()
            let { x, y, width, height } = bounding
            return { x, y, width, height }
         },
         returnByValue: true
      })

   }
}

module.exports = Element
const { sleep, signale } = require('./helper');

class Element {
   /**
    * 
    * @param {Function} send 
    * @param {String} objectId 远程element对象资源标识
    */
   constructor(page, objectId) {

      this.page = page
      this.objectId = objectId

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

         if (result) {

            // 创建新的子节点实例
            return new Element(this.page, result.objectId)

         }

      } else {

         let result = await this.evaluate({
            func: selector => document.querySelector(selector),
            args: [{ value: selector }]
         })

         if (result) {

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
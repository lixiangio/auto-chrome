"use strict"

const { logger } = require('./helper');

/**
 * 用于实现可追溯的远程elment，实际上是devtools保存了注入函数的执行结果并生成查询id
 * 通过状态跟踪，可以在已有远程结果基于上做增量操作，避免了代码的重复提交和执行
 */
class Runtime {
   /**
    * 
    * @param {Function} page page实例
    */
   constructor(page) {

      this.page = page

   }
   /**
    * 执行带参数的远程JS函数，获取返回值
    * @param {Object} options 选项
    */
   async callFunctionOn(options = {}) {

      let { functionDeclaration } = options

      options.functionDeclaration = functionDeclaration.toString()

      let { result } = await this.page.send('Runtime.callFunctionOn', {
         executionContextId: this.page.contextId,
         awaitPromise: true,
         userGesture: true,
         ...options
      })

      const { className, subtype, description } = result

      if (className === 'TypeError' || subtype === 'error') {
         logger.error(new Error(description))
      }

      return result

   }
   /**
    * 执行远程JS代码，获取返回值
    * 返回值类型可分为值类型和远程引用型两种
    * @param {Object} options 选项
    */
   async evaluate(options = {}) {

      let { result } = await this.page.send('Runtime.evaluate', {
         contextId: this.page.contextId,
         returnByValue: false,
         awaitPromise: true,
         userGesture: true,
         ...options
      })

      let { className, subtype, description } = result

      if (className === 'TypeError' || subtype === 'error') {
         logger.error(new Error(description))
      }

      return result

   }
}

module.exports = Runtime
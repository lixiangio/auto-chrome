"use strict";

const logger = require('loggercc');

class Frame {
   constructor(page) {

      this.page = page;

   }
   /**
    * 执行带参数的远程JS函数，获取返回值
    * @param {Object} options 选项
    */
   async callFunctionOn(options = {}) {

      const { functionDeclaration } = options;

      options.functionDeclaration = String(functionDeclaration);

      const { objectId } = this.page.document;

      if (objectId === undefined) {
         throw new Error(`缺少objectId参数！`);
      }

      const { result, error } = await this.page.send('Runtime.callFunctionOn', {
         objectId,
         awaitPromise: true,
         userGesture: true,
         ...options
      });

      if (error) {
         throw logger.error(new Error(error));
      }

      const { className, subtype, description } = result;

      if (className === 'TypeError' || subtype === 'error') {
         logger.error(new Error(description));
      }

      return result;

   }
   /**
    * 执行远程JS代码，获取返回值
    * 返回值类型可分为值类型和远程引用型两种
    * @param {Object} options 选项
    */
   async evaluate(options = {}) {

      try {

         const { result } = await this.page.send('Runtime.evaluate', {
            returnByValue: false,
            awaitPromise: true,
            userGesture: true,
            ...options
         })

         const { className, subtype, description } = result;

         if (className === 'TypeError' || subtype === 'error') {
            logger.error(new Error(description));
         }

         return result;

      } catch (error) {

         logger.error(error);

      }

   }
}

module.exports = Frame;
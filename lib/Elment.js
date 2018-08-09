class Element {

   constructor(send) {

      this.bounding
      this.selector

   }
   /**
    * 聚焦input元素
    * @param {*} selector 
    */
   async focus() {

      return await this.evaluate(function (selector) {
         let input = document.querySelector(selector)
         input.focus()
      }, this.selector)

   }
   /**
    * 通过选择器获取元素坐标
    * @param {String} selector CSS选择器
    */
   async getBoundingRect() {

      return await this.evaluate(function (selector) {

         let element = document.querySelector(selector)
         if (element) {
            let bounding = element.getBoundingClientRect()
            let { x, y, width, height } = bounding
            return { x, y, width, height }
         }

      }, this.selector)

   }
   /**
    * 点击元素
    * @param {String} selector CSS选择器
    */
   async click() {

      if (!this.bounding) {
         this.bounding = await this.getBoundingRect(this.selector)
      }

      if (this.bounding) {
         // 定位到元素中心
         let { x, y, width, height } = bounding
         x = x + width / 2
         y = y + height / 2
         this.mouse.click(x, y)
      }

      return this

   }
   /**
    * 表单输入
    * @param {String} text 
    */
   async type(text, options) {

      await this.keyboard.type(text, options)

      return this

   }
   /**
    * 显示被隐藏的元素
    * @param {String} text 
    */
   async display() {
      return this
   }
}

module.exports = Page
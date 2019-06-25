"use strict"

const { sleep } = require('./helper.js');

class Mouse {
   /**
    * @param {Function} send
    */
   constructor(page) {

      this.page = page;
      this.send = page.send.bind(page);
      this.x = 0;
      this.y = 0;
      this.button = 'none';

   }
   /**
    * 
    * @param {number} x
    * @param {number} y
    * @param {!Object=} options
    */
   async click(x, y, options = {}) {

      const { delay = 10 } = options;

      await this.move(x, y, options);

      await this.down(options);

      if (delay) {
         await new Promise(f => setTimeout(f, delay));
      }

      await this.up(options);

   }
   /**
    * @param {!Object=} options
    */
   async down(options = {}) {

      this.button = (options.button || 'left');

      await this.send('Input.dispatchMouseEvent', {
         type: 'mousePressed',
         button: this.button,
         x: this.x,
         y: this.y,
         clickCount: (options.clickCount || 1)
      });

   }
   /**
    * 移动鼠标（不兼容Touch）
    * @param {number} x
    * @param {number} y
    * @param {Object=} options
    * @return {!Promise}
    */
   async move(x, y, options = {}) {

      const fromX = this.x;
      const fromY = this.y;

      this.x = x;
      this.y = y;

      const { steps = 20 } = options;

      for (let i = 1; i <= steps; i++) {
         await this.send('Input.dispatchMouseEvent', {
            type: 'mouseMoved',
            button: this.button,
            x: fromX + (this.x - fromX) * (i / steps),
            y: fromY + (this.y - fromY) * (i / steps)
         });
      }

   }
   
   /**
    * @param {!Object=} options
    */
   async up(options = {}) {
      this.button = 'none';
      await this.send('Input.dispatchMouseEvent', {
         type: 'mouseReleased',
         button: (options.button || 'left'),
         x: this.x,
         y: this.y,
         clickCount: (options.clickCount || 1)
      });
   }

   /**
    * 相对于当前窗口可视区滚动至指定坐标，仅支持垂直滚动
    * @param {number} x 相对于窗口的横向偏移量
    * @param {number} y 相对于窗口的纵向偏移量
    */
   async scroll(x = 0, y = 0, step = 20) {

      if (y < 0) {
         step = -step;
      }

      const count = y / step;

      for (let i = 0; i <= count; i++) {

         await this.send('Input.dispatchMouseEvent', {
            type: 'mouseWheel',
            x: this.x,
            y: this.y, // 鼠标在屏幕上的坐标
            deltaX: 0,
            deltaY: step // 滚动距离
         })

         await sleep(20);

      }

      // 滚动后需要短暂停留，以消除惯性
      await sleep(800);

   }

   /**
    * 根据bounding滚动至元素坐标
    * @param {Object} bounding 
    */
   async scrollBounding(bounding) {

      const { y, height, innerHeight } = bounding;

      const scrollY = Math.round(innerHeight * (0.5 + Math.random() * 0.30));

      const centreY = (innerHeight - height) / 2;

      const targetY = y - centreY;

      if (targetY > scrollY) {
         await this.scroll(0, scrollY);
         return true;
      } else {
         await this.scroll(0, targetY);
      }

   }
}

module.exports = Mouse;

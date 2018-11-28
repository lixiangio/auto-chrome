"use strict"

const { sleep } = require('./helper');

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

      let { delay = 10 } = options

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
      const fromX = this.x, fromY = this.y;
      this.x = x;
      this.y = y;
      let { steps = 20 } = options
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
    * 相对于窗口可视区滚动至指定坐标，目前仅支持纵向滚动
    * @param {number} x 相对于窗口的横向偏移量
    * @param {number} y 相对于窗口的纵向偏移量
    */
   async scroll(x = 0, y = 0, step = 20) {

      if (y < 0) step = -step
      let count = y / step
      for (let i = 0; i <= count; i++) {
         await this.send('Input.dispatchMouseEvent', {
            type: 'mouseWheel',
            x: this.x,
            y: this.y, // 鼠标在屏幕上的坐标
            deltaX: 0,
            deltaY: step // 滚动距离
         });
         await sleep(20);
      }

      // 滚动后需要短暂停留，以消除惯性
      await sleep(1000)

   }
}

class Touch {
   /**
    * @param {Function} send 发送消息
    */
   constructor(page) {
      this.page = page;
      this.send = page.send.bind(page);
   }

   /**
    * @param {number} x
    * @param {number} y
    */
   async click(x, y) {
      // Touches appear to be lost during the first frame after navigation.
      // This waits a frame before sending the tap.
      // @see https://crbug.com/613219
      await this.send('Runtime.evaluate', {
         expression: 'new Promise(x => requestAnimationFrame(() => requestAnimationFrame(x)))',
         awaitPromise: true
      });

      const touchPoints = [{ x: Math.round(x), y: Math.round(y) }];
      await this.send('Input.dispatchTouchEvent', {
         type: 'touchStart',
         touchPoints
      });

      await this.send('Input.dispatchTouchEvent', {
         type: 'touchEnd',
         touchPoints: []
      });
   }

   /**
    * 单点滑动手势
    * @param {Object} options
    * @param {Object.start} 滑动起始坐标 
    * @param {Object.end} 滑动结束坐标 
    * @param {Object.steps} 步长 
    * @param {Object.delay} 发送move事件的间隔时间 
    */
   async slide({ start, end, steps = 50, delay = 150 }) {

      let { x: startX, y: startY } = start
      let { x: endX, y: endY } = end

      await this.send('Runtime.evaluate', {
         expression: 'new Promise(x => requestAnimationFrame(() => requestAnimationFrame(x)))',
         awaitPromise: true
      });

      await this.send('Input.dispatchTouchEvent', {
         type: 'touchStart',
         touchPoints: [{ x: Math.round(startX), y: Math.round(startY) }]
      });

      let stepX = (endX - startX) / steps
      let stepY = (endY - startY) / steps

      for (let i = 1; i <= steps; i++) {
         await this.send('Input.dispatchTouchEvent', {
            type: 'touchMove',
            touchPoints: [{ x: startX += stepX, y: startY += stepY }]
         });
         await sleep(8);
      }

      // 触点释放前的停留时间
      await sleep(delay);

      await this.send('Input.dispatchTouchEvent', {
         type: 'touchEnd',
         touchPoints: []
      });

      // 滑动后需要短暂停留，以消除惯性
      await sleep(1000)

   }
   /**
    * 获取浏览器窗口和屏幕信息
    */
   static async windowInfo() {

      let func = (function () {
         let { scrollX, scrollY, innerWidth, innerHeight, screen: { width, height } } = window
         return { scrollX, scrollY, innerWidth, innerHeight, width, height }
      }).toString()

      let { result } = await this.send('Runtime.evaluate', {
         expression: `(${func})()`,
         returnByValue: true,
         awaitPromise: true,
         userGesture: true,
         // contextId: this.contextId,
      })

      return result.value

   }
   /**
    * 通过touch滚动至页面指定坐标
    * @param {Number} x 横坐标
    * @param {Number} y 纵坐标
    * @param {Object} options 选项
    */
   async scroll(x, y, options = {}) {

      let { interval = 2000 } = options

      // 获取当前浏览器滚动条位置
      let { scrollX, scrollY, innerWidth, innerHeight } = await this.windowInfo();

      let totalX = x - scrollX
      let totalY = y - scrollY

      let centerX = Math.round(innerWidth / 2)
      let centerY = Math.round(innerHeight / 2)

      if (totalY > centerY) {
         totalY -= centerY
      } else {
         return
      }

      let plusX = 0
      let plusY = 0

      // 分多次发送滑动事件
      while (totalY > plusY) {

         // 模拟随机坐标，让每次的滑动轨迹都不一样
         let startX = Math.round(innerWidth * (0.3 + Math.random() * 0.4))
         let startY = Math.round(innerHeight * (0.6 + Math.random() * 0.2))
         let endX = Math.round(startX + Math.random() * 0.1)
         let endY = Math.round(innerHeight * (0.2 + Math.random() * 0.2))

         plusX += startX - endX
         plusY += startY - endY

         // 末端补齐
         if (totalY < plusY) {
            endY = startX + (plusY - totalY)
         }

         let start = { x: startX, y: startY }
         let end = { x: endX, y: endY }

         await this.slide({ start, end });

         await sleep(interval)

      }

   }

}

module.exports = {
   Mouse,
   Touch
};

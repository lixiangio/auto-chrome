"use strict"

const { sleep } = require('./helper.js');

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

      x = Math.round(x);
      y = Math.round(y);

      const touchPoints = [{
         x: Math.round(x),
         y: Math.round(y)
      }];

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
   async slide({ start, end, steps = 30, delay = 150 }) {

      let { x: startX, y: startY } = start;
      let { x: endX, y: endY } = end;

      await this.send('Input.dispatchTouchEvent', {
         type: 'touchStart',
         touchPoints: [{ x: Math.round(startX), y: Math.round(startY) }]
      });

      let stepX = (endX - startX) / steps;
      let stepY = (endY - startY) / steps;

      for (let i = 1; i <= steps; i++) {
         await this.send('Input.dispatchTouchEvent', {
            type: 'touchMove',
            touchPoints: [{ x: startX += stepX, y: startY += stepY }]
         });
         await sleep(8);
      }

      // 触点释放前的停留时间，控制惯性
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
   async windowInfo() {

      const func = String(function () {
         const { scrollX, scrollY, innerWidth, innerHeight, screen: { width, height } } = window;
         return {
            scrollX,
            scrollY,
            innerWidth,
            innerHeight,
            width,
            height
         }
      })

      const { result } = await this.send('Runtime.evaluate', {
         expression: `(${func})()`,
         returnByValue: true,
         awaitPromise: true,
         userGesture: true,
      })

      return result.value

   }
   /**
    * 通过touch滚动指定像素
    * @param {Number} x 横坐滑动距离
    * @param {Number} y 纵坐滑动距离
    * @param {Object} options 选项
    */
   async scroll(x, y) {

      // 获取当前浏览器滚动条位置
      const result = await this.windowInfo()

      const { innerWidth, innerHeight } = result;

      // 分多次发送滑动事件
      while (y > 0) {

         // 模拟随机坐标，让每次的滑动轨迹都不一样
         const startX = Math.round(innerWidth * (0.3 + Math.random() * 0.4))
         const startY = Math.round(innerHeight * (0.8 + Math.random() * 0.15))

         let endX = Math.round(startX + Math.random() * 0.1)
         let endY = Math.round(innerHeight * (0.1 + Math.random() * 0.15))

         const moveY = startY - endY;

         // 末端补齐
         if (y > moveY) {
            y -= moveY
         } else {
            endY = startY - y
            y = 0
         }

         const start = {
            x: startX,
            y: startY
         }

         const end = {
            x: endX,
            y: endY
         }

         await this.slide({ start, end })

         await sleep(600)

      }

   }

}

module.exports = Touch;

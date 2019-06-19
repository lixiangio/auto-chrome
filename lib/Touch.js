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
    * 通过touch滚动指定像素，适用于已知固定坐标
    * @param {Number} x 横坐滑动距离
    * @param {Number} y 纵坐滑动距离
    * @param {Object} options 选项
    */
   async scroll(x, y) {

      // 获取当前浏览器滚动条位置
      const result = await this.windowInfo();

      const { innerWidth, innerHeight } = result;

      // 分多次发送滑动事件
      while (true) {

         // 模拟随机坐标，让每次的滑动轨迹都不一样
         const startX = Math.round(innerWidth * (0.3 + Math.random() * 0.4));
         const startY = Math.round(innerHeight * (0.8 + Math.random() * 0.15));

         const endX = Math.round(startX + Math.random() * 0.1);
         const endY = Math.round(innerHeight * (0.1 + Math.random() * 0.15));

         const scrollY = startY - endY;

         const options = {
            start: {
               x: startX,
               y: startY
            },
            end: {
               x: endX,
               y: endY
            }
         }
         
         if (y > scrollY) {
            y -= scrollY;
            await this.slide(options);
         } else {
            options.end.y = startY - y;
            await this.slide(options);
            break;
         }

      }

   }

   /**
    * 根据bounding滚动至元素坐标
    * @param {Object} bounding 
    */
   async scrollBounding(bounding) {

      const { y, height, innerWidth, innerHeight } = bounding;

      const centreY = (innerHeight - height) / 2;

      const targetY = y - centreY;

      // 模拟随机坐标，让每次的滑动轨迹都不一样
      const startX = Math.round(innerWidth * (0.3 + Math.random() * 0.4));
      const startY = Math.round(innerHeight * (0.8 + Math.random() * 0.15));

      const endX = Math.round(startX + Math.random() * 0.1);
      const endY = Math.round(innerHeight * (0.1 + Math.random() * 0.15));

      const scrollY = startY - endY;

      const options = {
         start: {
            x: startX,
            y: startY
         },
         end: {
            x: endX,
            y: endY
         }
      }

      if (targetY > scrollY) {
         await this.slide(options);
         return true;
      } else {
         options.end.y = startY - targetY;
         await this.slide(options);
      }

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

      const stepX = (endX - startX) / steps;
      const stepY = (endY - startY) / steps;

      for (let i = 1; i <= steps; i++) {

         await this.send('Input.dispatchTouchEvent', {
            type: 'touchMove',
            touchPoints: [{
               x: startX += stepX,
               y: startY += stepY
            }]
         });

         await sleep(8);

      }

      await sleep(delay); // 触点释放前的停留时间，控制惯性

      await this.send('Input.dispatchTouchEvent', {
         type: 'touchEnd',
         touchPoints: []
      });

      // 滑动后需要短暂停留，以消除惯性
      await sleep(800);

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

      return result.value;

   }

}

module.exports = Touch;

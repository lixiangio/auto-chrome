# auto-chrome

### Install

```
npm install auto-chrome
```

使用Node.js自动化控制Chrome或Chromium，基于[chrome devtools](https://chromedevtools.github.io/devtools-protocol/)协议的高仿真用户行为模拟器。

借鉴于puppeteer，选择重写是因为在实际应用中puppeteer存在各种奇怪的bug，导致线程阻塞且难以被修复。另外，puppeteer并没有完整的支持chrome devtools协议，又缺乏可扩展性、灵活性和易用性，一些实现细节也并不符合预期。

### 特性

* 自动切换标签，根据当前活跃标签自动聚焦，通过chrome.page获取当前处于激活状态的标签。这在实际应用中避免了多标签切换带来的苦恼，同时减少错误率。

* 隐藏了taget的概念，只需要直观的面对浏览器和标签和网页即可。

* 简化了错误处理机制，尽可能确保线程不出现持久性阻塞，即使任务出现异常依然会继续运行。

### chrome devtools中的作用域

* `Chrome` 表示单个浏览器实例

* `Page` 表示浏览器标签，单个Chrome中允许包含多个Page，同一个时间点上始终只有一个Page处于激活状态。

* `Target` 表示标签中的网页，单个Page中允许包含多个Target，同一个时间点上始终只有一个Target处于激活状态。Target区分page、iframe及其它类型

* `Frame` 表示网页中的框架，单个Target中允许包含多个Frame，Frame中可以包含子Frame

* `Runtime` 用于向网页注入脚本

* `sessionId` Target会话id


## API

### class: Page

#### page.touchScroll(x, y, options) 新增

通过touch滚动页面至指定的可视坐标

* x `Number` 目标x坐标

* y `Number` 目标y坐标

* options `Object`
   * interval `Number` 连续滑动的时间间隔，默认2000，单位ms

#### page.$touchScroll(selector, options) 新增

通过touch方式，滚动页面至指定元素可视区

* selector `String` CSS选择器字符串

* options `Object`
   * steps `Number` touchmove的触发次数，默认50
   * interval `Number` 连续滑动的时间间隔，默认2000，单位ms


#### page.scroll(x, y) 新增

滚动页面，使指定元素位于可视区

* x `Number` 相对于浏览器窗口x坐标

* y `Number` 相对于浏览器窗口y坐标


#### page.$scroll(selector) 新增

滚动页面，使指定元素位于可视区

* selector `String` CSS选择器字符串



### class: Mouse

#### mouse.click(x, y, options) 增强，兼容原版

新增模拟鼠标移动轨迹，原click可能出于效率考虑，只会触发一次mousemoved

click操作中已经包含了move，多数情况下不再需要单独模拟move操作，除非只移动鼠标而不需要点击

* options `Object`
   * steps `Number` mousemoved事件的触发次数，默认20


#### mouse.move(x, y, options) 增强，兼容原版

将steps默认值改为20，原值为1，即只触发一次。移动距离相同时，触发次数越少，对应的移动速度越快

* options `Object`
   * steps `Number` 触发mousemoved事件的次数，默认值20



#### mouse.scroll(x, y, step) 新增

滚动至指定坐标，目前仅支持纵向滚动

* x `Number` 横向坐标，0

* y `Number` 纵向坐标

* step `Number` 步长




### class: Touchscreen

#### touchscreen.slide({start, end, steps}) 新增

模拟touch单点滑动手势

* start `Object`
   * x `Number touchstart` x坐标
   * y `Number touchstart` y坐标
* end `Object`
   * x `Number touchend` x坐标
   * y `Number touchend` y坐标
* steps `Number` touchmove的触发次数
* delay `Number` 触点释放前的停留时间，用于滑动惯性控制
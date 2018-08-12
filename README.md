# auto-chrome

使用Node.js自动化控制Chrome或Chromium，基于[chrome devtools](https://chromedevtools.github.io/devtools-protocol/)协议的高仿真用户行为模拟器。

借鉴于puppeteer，选择重写是因为在实际应用中puppeteer存在各种奇怪的bug，导致线程阻塞且难以被修复。另外，puppeteer不会支持所有chrome devtools协议，同时又缺乏可扩展性和易用性，一些实现细节也不符合预期。

chrome devtools协议api过于原始，对开发者而言并不友好。puppeteer api在设计上大量延用了chrome devtools协议的原始风格，虽然功能丰富，但是易用性却很糟糕。

auto-chrome以简洁和易用为设计原则，重点简化常见应用场景，只提供常用功能，通过扩展的方式满足定制化需求。

项目中部分引用了puppeteer源码，目前依然处于初级阶段，很多功能并不完善。


## 特性

* 自动切换标签，根据当前活跃标签自动聚焦，通过chrome.page获取当前处于激活状态的标签。这在实际应用中避免了多标签切换带来的苦恼，同时减少手动切换标签导致的混乱。

* 解除鼠标、键盘、触控输入设备与页面的绑定，避免频繁在多个页面间切换设备。

* 支持高仿真输入，模拟鼠标移动轨迹和Touch手势。

* 简化的错误处理机制，即使任务出现异常依然能继续运行，尽可能保障线程不出现持久性阻塞。

* 隐藏了taget的概念，只需要直观的面对浏览器和标签和网页即可。


## Install

```
npm install auto-chrome
```


## chromium安装

由于网络环境因素，auto-chrome并没有像puppeteer那样直接将chromium作为npm依赖进行安装。因此你需要手动下载chromium，并在launch.executablePath配置项中指定安装路径。

推荐源：https://npm.taobao.org/mirrors/chromium-browser-snapshots/



## chrome devtools术语

* `Target` 表示浏览器中的不同对象，包含browser、page、iframe、other资源类型。devtools为每个target生成targetId，用于区分不同的目标。

* `Session` session机制用于创建多个会话，可以为每个Target绑定独立的session，也可以让多个Target共享同一个session。

* `Page` 浏览器标签，Chrome中允许打开多个Page，但始终只有一个Page处于激活状态。

* `Runtime` JavaScript运行时，用于向网页注入JS代码实现对DOM的操作。

* `Frame` 网页中的框架，主Frame中允许包含多个子Frame。

* `Context` JavaScript运行时所处的的上下文，由于页面内可能包含Frame，每个Frame拥有独立的运行时，因此需要生成唯一contextId来区分它们。



## API

### class: autoChrome(options)

* `options` *Object* 全局实例配置选项，优先级低于page

    * `executablePath` *String* Chrome程序执行路径

    * `args[ars, ...]` *Array* Chrome启动参数数组

        * `ars` *String* Chrome启动参数

    * `userDataDir` *String* 用户配置文件路径

    * `emulate` *Object* 设备仿真，该配置对于初始标签不太凑效，可能由于初始targetCreated事件并没有被捕获。

        * `mobile` *Boolean* 移动设备，默认false

        * `hasTouch` *Boolean* 启用触控，默认false

        * `width` *Number* 屏幕宽度，默认自适应屏幕宽度

        * `width` *Number* 屏幕高度，默认自适应屏幕高度

        * `geolocation` *Object* 地理位置，使用Google地图坐标

            * `longitude` *Number* 经度

            * `latitude` *Number* 纬度

            * `accuracy` *Number* 精准度

     * `headless` *Boolean* 隐藏执行模式，默认false

     * `devtools` *Boolean* 为每个page自动打开devtools，默认false

     * `ignoreHTTPSErrors` *Boolean* 忽略https错误，默认true

#### chrome.mouse

鼠标操作，page.mouse的快捷引用

#### chrome.keyboard

鼠标操作，page.keyboard的快捷引用

#### chrome.touch

触控设备操作，page.touch的快捷引用

#### chrome.pages

包含所有打开page的Map对象

#### chrome.page

当前激活状态的page

#### chrome.newPage(url)

* `url` *String* 打开网页地址，缺省时打开空白网页

#### chrome.closePage(pageId)

* `pageId` *String* 要删除page的id

#### chrome.send(method, params)

发送原始的chrome devtools协议消息

* `method` *String* 方法名

* `params` *Object* 参数

#### chrome.close()

关闭浏览器



### class: Page

#### page.mouse

鼠标实例

#### page.keyboard

键盘实例

#### page.touch

触控设备实例

#### page.emulate(options)

设备仿真，直接调用该方法可能导致混乱，正常应该由事件驱动在创建标签执行page.emulate()，手动调用会存在延时覆盖问题。

* `options` *Object* 选项

    * `mobile` *Boolean* 移动设备

    * `hasTouch` *Boolean* 启用触控

    * `width` *Number* 屏幕宽度

    * `width` *Number* 屏幕高度

    * `geolocation` *Object* 地理位置

        * `longitude` *Number* 经度

        * `latitude` *Number* 纬度

        * `accuracy` *Number* 精准度

#### page.goto(url)

在标签内打开新网页

### page.evaluate(pageFunction, arg, arg, ...)

向页面注入js函数，获取执行后的返回值

* `pageFunction` *Function* 注入函数

* `arg` *\** 可序列化参数，不支持函数

### page.focus(selector)

通过CSS选择器聚焦元素

* `selector` *String* CSS选择器

### page.getBoundingRect(selector)

通过CSS选择器获取元素坐标，值由getBoundingClientRect()函数获取

* `selector` *String* CSS选择器

### page.click(selector)

通过CSS选择器点击元素

* `selector` *String* CSS选择器

### page.type(selector, text, options)

通过CSS选择器聚焦input，输入文本

* `selector` *String* CSS选择器

* `text` *String* 输入文本

* `options` *Object* 配置信息

* `options.delay` *Number* 输入间隔时间，ms

### page.scroll(selector)

滚动至指定元素可视区域，会尽量沿Y轴居中

* `selector` *String* CSS选择器

#### page.send(method, params)

发送包含session的原始chrome devtools协议消息

* `method` *String* 方法名

* `params` *Object* 参数


#### page.touchScroll(selector, options)

通过touch方式，滚动页面至指定元素可视区

* `selector` *String* CSS选择器字符串

* `options` *Object* 选项

   * `steps` *Number* touchmove的触发次数，默认50

   * `interval` *Number* 连续滑动的时间间隔，默认2000，单位ms

#### page.close()

关闭标签




### class: Mouse

#### mouse.click(x, y, options)

新增模拟鼠标移动轨迹，原click可能出于效率考虑，只会触发一次mousemoved

click操作中已经包含了move，多数情况下不再需要单独模拟move操作，除非只移动鼠标而不需要点击

* `options` *Object*

   * `steps` *Number* mousemoved事件的触发次数，默认20


#### mouse.move(x, y, options)

将steps默认值改为20，原值为1，即只触发一次。移动距离相同时，触发次数越少，对应的移动速度越快

* `options` *Object* 选项

   * `steps` *Number* 触发mousemoved事件的次数，默认值20


#### mouse.scroll(x, y, step)

滚动至指定坐标，目前仅支持纵向滚动

* `x` *Number* 横向坐标，0

* `y` *Number* 纵向坐标

* `step` *Number* 步长



### class: Touch

#### touch.slide({start, end, steps})

模拟touch单点滑动手势

* `start` *Object* 起始坐标

   * `x` *Number* touchstart x坐标

   * `y` *Number* touchstart y坐标

* `end` *Object* 结束坐标

   * `x` *Number* touchend x坐标

   * `y` *Number* touchend y坐标

* `steps` *Number* touchmove的触发次数

* `delay` *Number* 触点释放前的停留时间，用于滑动惯性控制


#### touch.scroll(x, y, options)

通过touch滚动页面至指定的可视坐标

* `x` *Number* 目标x坐标

* `y` *Number* 目标y坐标

* `options` *Object*

   * `interval` *Number* 连续滑动的时间间隔，默认2000，单位ms
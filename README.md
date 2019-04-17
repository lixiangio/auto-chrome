# auto-chrome

使用Node.js自动化控制Chrome或Chromium，基于[chrome devtools](https://chromedevtools.github.io/devtools-protocol/)协议的高仿真用户行为模拟器。

借鉴于puppeteer，选择重写是因为在实际应用中puppeteer存在各种奇怪的bug，导致线程持续阻塞且难以被修复，一些实现细节也不符合预期。

chrome devtools协议api过于原始，对开发者而言并不友好。puppeteer api虽然功能丰富，但是操作依然过于繁琐，且存在一些难以规避的Bug。

auto-chrome以简洁和易用为设计原则，重点简化常见应用场景，通过扩展的方式满足定制化需求。


## 特性

* 支持自动聚焦，根据当前活跃标签自动切换标签，通过chrome.page获取当前处于激活状态的标签。这在实际应用中避免了多标签切换带来的苦恼，同时减少手动切换标签导致的混乱

* 支持主动导航监测，避免用户由于疏忽没有明确定义导航行为，导命操作错乱。

* 支持消息队列等待超时自动解除，由于各种难以预料的情况，devtools并不保证100%对所有发送的消息做出回应，在没有超时机制的状态下消息将处于持续等待状态，导致任务无法继续执行

* 解除鼠标、键盘、触控输入设备与页面的绑定，避免频繁在多个页面间切换设备

* 支持高仿真输入，模拟鼠标移动轨迹和Touch手势

* 简化的错误处理机制，即使任务出现异常依然能继续运行，尽可能保障线程不出现持久性阻塞

* 支持GPS定位

## Install

```
npm install auto-chrome
```


## chromium安装

由于网络环境因素，auto-chrome并没有像puppeteer那样直接将chromium作为npm依赖进行安装。因此你需要手动下载chromium，并在launch.executablePath配置项中指定安装路径。

推荐源：https://npm.taobao.org/mirrors/chromium-browser-snapshots/



## chrome devtools术语

* `Target` 表示浏览器中的某个目标对象，可以是browser、page、iframe、other类型之一。当type为page类型时，targetId对应于主框架的frame id。

* `Session` session机制用于创建多个会话，可以为每个Target绑定独立的session，也可以让多个Target共享同一个session。

* `Page` 浏览器标签，Chrome中允许打开多个Page，但始终只有一个Page处于激活状态。

* `Runtime` JavaScript运行时，用于向网页注入JS代码实现对DOM的操作。

* `Frame` 网页中的框架，主Frame中允许包含多个子Frame。

* `Context` JavaScript运行时所处的的上下文，由于页面内可能包含Frame，每个Frame拥有独立的运行时，因此需要生成唯一contextId来区分它们。


## 注意事项

### 页面导航

浏览器导航事件可分为可预测和不可预测两种，由于触发导航的方式非常多，通过鼠标、键盘、JS脚本等方式均可能触发未知的导航事件。如果导航切换时序不正确，会产生上下文消息错乱的bug。

另外一种情况是由于url重定向，频繁的触发上下文切换，导致上下文错位。这种场景难以被察觉，也很难做预判。

#### 可预测导航

对于chrome.newPage()、page.goto()这类明确包含导航行为的显性操作，autoChrome进行内部封装，在使用时不需要做额外的处理。

#### 不可预测导航

对于不可预测导航，如按下Enter键、鼠标点击绑定了跳转事件的非链接元素触发导航行为。

autoChrome无法预判一个操作是否会触发导航，只能由用户来指定某个步骤是否需要等待导航结束后再继续执行。

有时候会出现连用户自己也无法确定某个操作是否会触发导航，比如当点击一个动态元素时就会存在不确定性。

```js
// 等待导航键盘示例代码
await Promise.all([
    page.keyboard.press("Enter"),
    page.waitLoad()
])

// 鼠标示例
await Promise.all([
    page.click("#input"),
    page.waitLoad()
])
```

### 高分屏分辨率

如果你的chrome运行在高分屏设备中，可能会出现touch事件错位的严重bug，这种情况可以尝试使用“--force-device-scale-factor=”来调整缩放比例。

## autoChrome(options)

* `options` *Object* 全局实例配置选项，优先级低于page

    * `args[ars, ...]` *Array* Chrome启动参数数组

        * `ars` *String* Chrome启动参数

    * `executablePath` *String* Chrome程序执行路径

    * `userDataDir` *String* 用户配置文件路径，定义独立的Chrome实例，支持cluster模式下并行

    * `port` *Number* ws远程连接端口号

    * `emulate` *Object* 设备仿真，该配置对于初始标签不太凑效，可能由于初始targetCreated事件并没有被捕获。

        * `viewport` *Object* 

            * `mobile` *Boolean* 移动设备，默认false

            * `width` *Number* 屏幕宽度，默认自适应屏幕宽度

            * `height` *Number* 屏幕高度，默认自适应屏幕高度

        * `geolocation` *Object* 地理位置，使用Google地图坐标

            * `longitude` *Number* 经度

            * `latitude` *Number* 纬度

            * `accuracy` *Number* 精准度

     * `headless` *Boolean* 隐藏执行模式，默认false

     * `devtools` *Boolean* 为每个page自动打开devtools，默认false

     * `ignoreHTTPSErrors` *Boolean* 忽略https错误，默认true

     * `loadTimeout` *Number* 自动导航等待页面加载的最大停留时间，单位ms

* `return` *Chrome* Chrome类实例

## class: Chrome

### chrome.keyboard

鼠标操作，page.keyboard的快捷引用

### chrome.mouse

鼠标操作，page.mouse的快捷引用

### chrome.touch

触控设备操作，page.touch的快捷引用

### chrome.pages

包含所有打开page的Map对象

### chrome.page

当前激活状态的page

### chrome.newPage(url)

* `url` *String* 打开网页地址，缺省时打开空白网页

### chrome.closePageById(pageId)

通过pageId关闭指定的标签

* `pageId` *String* 要删除page的id

### chrome.createBrowserContext()

创建独立的浏览器环境，只能在隐身模式下运行。

### chrome.send(method, params)

发送原始的chrome devtools协议消息

* `method` *String* 方法名

* `params` *Object* 参数

### chrome.close()

关闭浏览器


## class: Page

### page.mouse

鼠标实例

### page.keyboard

键盘实例

### page.touch

触控设备实例

### page.emulate(options)

设备仿真，直接调用该方法可能导致混乱，正常应该由事件驱动在创建标签执行page.emulate()，手动调用会存在延时覆盖问题。

* `options` *Object* 选项

    * `mobile` *Boolean* 移动设备

    * `width` *Number* 屏幕宽度

    * `width` *Number* 屏幕高度

    * `geolocation` *Object* 地理位置

        * `longitude` *Number* 经度

        * `latitude` *Number* 纬度

        * `accuracy` *Number* 精准度

### page.goto(url)

在标签内打开新网页

### page.run(pageFunction, ...arg)

向页面注入js函数，获取执行后的返回值

* `pageFunction` *Function* 注入函数

* `arg` * 可序列化参数，不支持函数

* `return` *Object* 远程资源相关信息，[RemoteObject](https://chromedevtools.github.io/devtools-protocol/tot/Runtime#type-RemoteObject)

### page.$(selector)

选择单个元素

* `selector` *String* CSS选择器

* `return` *Object* 单个Elment实例

### page.$$(selector)

选择多个元素

* `selector` *String* CSS选择器

* `return` *Array* 多个Elment实例数组

### page.click(selector)

通过CSS选择器点击元素

* `selector` *String* CSS选择器

### page.type(selector, text, options)

通过CSS选择器聚焦input，输入文本

* `selector` *String* CSS选择器

* `text` *String* 输入文本

* `options` *Object* 配置信息

    * `delay` *Number* 输入间隔时间，ms

### page.send(method, params)

发送包含session的原始chrome devtools协议消息

* `method` *String* 方法名

* `params` *Object* 参数


### page.scroll(selector)

滚动至指定元素可视区域，会尽量沿Y轴居中

* `selector` *String* CSS选择器

### page.focus(selector)

通过CSS选择器聚焦元素

* `selector` *String* CSS选择器

### page.getBoundingRect(selector)

通过CSS选择器获取元素坐标，值由getBoundingClientRect()函数获取

* `selector` *String* CSS选择器

### page.close()

关闭标签

### page.goBack()

导航到上一个历史标签页

### page.goForward()

导航到下一个历史标签页


### class: Element

用于实现可追溯的远程elment，避免代码重复提交和重复执行。

对于大的对象或DOM对象，直接返回它们并不现实，因此需要一种远程操作的增量机制。devtools通过保存注入函数的执行结果并返回引用id，实现状态追踪，这样就可以在已有远程结果基于上做增量操作。

### elment.$(selector)

* `selector` *String* 

* `return` *Object* Elment实例

选择单个元素，并生成远程引用对象

### elment.$$(selector)

* `selector` *String* 

* `return` *Array* 多个Elment实例数组

选择多个元素，并生成远程引用对象

### elment.get(name)

* `name` *String* 

获取elment中指定的属性值

### elment.set(name, value)

* `name` *String* 属性名称

* `value` * 属性值

设置elment中指定的属性值

### elment.value(value)

* `value` *String* 赋值

获取或设置值，仅适用于表单元素

### elment.focus()

聚焦元素

### elment.getBoundingRect()

通过getBoundingClientRect函数获取元素大小、坐标信息




## class: Mouse

### mouse.click(x, y, options)

新增模拟鼠标移动轨迹，原click可能出于效率考虑，只会触发一次mousemoved

click操作中已经包含了move，多数情况下不再需要单独模拟move操作，除非只移动鼠标而不需要点击

* `options` *Object*

   * `steps` *Number* mousemoved事件的触发次数，默认20


### mouse.move(x, y, options)

将steps默认值改为20，原值为1，即只触发一次。移动距离相同时，触发次数越少，对应的移动速度越快

* `options` *Object* 选项

   * `steps` *Number* 触发mousemoved事件的次数，默认值20


### mouse.scroll(x, y, step)

滚动至指定坐标，目前仅支持纵向滚动

* `x` *Number* 横向坐标，0

* `y` *Number* 纵向坐标

* `step` *Number* 步长



## class: Touch

### touch.slide({start, end, steps})

模拟touch单点滑动手势

* `start` *Object* 起始坐标

   * `x` *Number* touchstart x坐标

   * `y` *Number* touchstart y坐标

* `end` *Object* 结束坐标

   * `x` *Number* touchend x坐标

   * `y` *Number* touchend y坐标

* `steps` *Number* touchmove的触发次数

* `delay` *Number* 触点释放前的停留时间，用于滑动惯性控制


### touch.scroll(x, y, options)

通过touch滚动页面至指定的可视坐标

* `x` *Number* 目标x坐标

* `y` *Number* 目标y坐标

* `options` *Object*

   * `interval` *Number* 连续滑动的时间间隔，默认2000，单位ms
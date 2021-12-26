# auto-chrome

使用 Node.js 自动化控制 Chrome 或 Chromium，基于 [chrome devtools](https://chromedevtools.github.io/devtools-protocol/) 协议的高仿真用户行为模拟器。

借鉴于 puppeteer，选择重写是因为在实际应用中 puppeteer 存在各种奇怪的 bug，导致线程持续阻塞且难以被修复，一些实现细节也不符合预期。

chrome devtools 协议 api 过于原始，对开发者而言并不友好。puppeteer api 虽然功能丰富，但是操作依然过于繁琐，且存在一些难以规避的 Bug。

auto-chrome 以简洁和易用为设计原则，重点简化常见应用场景，通过扩展的方式满足定制化需求。

## 特性

- 支持自动聚焦，根据当前活跃标签自动切换标签，通过 chrome.page 获取当前处于激活状态的标签。这在实际应用中避免了多标签切换带来的苦恼，同时减少手动切换标签导致的混乱

- 支持主动导航监测，避免用户由于疏忽没有明确定义导航行为，导致操作错乱。

- 支持消息队列等待超时自动解除，由于各种不可控因素，devtools 并不保证 100%对所有发送的消息做出回应，在没有超时机制的状态下消息将处于持续等待状态，导致任务无法继续执行

- 解除鼠标、键盘、触控输入设备与页面的绑定，避免频繁在多个页面间切换设备

- 支持高仿真输入，模拟鼠标移动轨迹和 Touch 手势

- 简化的错误处理机制，即使任务出现异常依然能继续运行，尽可能保障线程不出现持久性阻塞

- 支持 GPS 定位

## Install

```
npm install auto-chrome
```

## chromium 安装

由于网络环境因素，auto-chrome 并没有像 puppeteer 那样直接将 chromium 作为 npm 依赖进行安装。因此你需要手动下载 chromium，并在 launch.executablePath 配置项中指定安装路径。

推荐源：https://npm.taobao.org/mirrors/chromium-browser-snapshots/

## chrome devtools 术语

- `Target` 表示浏览器中的某个目标对象，可以是 browser、page、iframe、other 类型之一。当 type 为 page 类型时，targetId 对应于主框架的 frame id。

- `Session` session 机制用于创建多个会话，可以为每个 Target 绑定独立的 session，也可以让多个 Target 共享同一个 session。

- `Page` 浏览器标签，Chrome 中允许打开多个 Page，但始终只有一个 Page 处于激活状态。

- `Runtime` JavaScript 运行时，用于向网页注入 JS 代码实现对 DOM 的操作。

- `Frame` 网页中的框架，主 Frame 中允许包含多个子 Frame。

- `Context` JavaScript 运行时所处的的上下文，由于页面内可能包含 Frame，每个 Frame 拥有独立的运行时，因此需要生成唯一 contextId 来区分它们。

## 注意事项

由于 301 重定向到新的 url，连续多次触发上下文切换，导致上下文错位。301 难以被察觉，且很难做预判，在调试时应该格外注意。

## 页面导航

浏览器导航事件可分为可预测和不可预测两种，由于触发导航的方式非常多，通过鼠标、键盘、JS 脚本方式均可能触发未知的导航事件。如果导航切换时序不正确，会产生上下文消息错乱的 bug。

### 可预测导航

对于 chrome.newPage()、page.goto()这类明确包含导航行为的显性操作，autoChrome 进行内部封装，在使用时不需要做额外的处理。

### 不可预测导航

- 导航可能刷新当前标签，也可能创建新标签

- 通过 JS 触发跳转链接的不可预测导航行为

- 点击链接后出现一次或多次 301 重定向

- 由于浏览器 301 缓存导致重定向的不确定性

针对以上情况，无法准确预判一个操作是否会触发导航事件。autoChrome 中通过循环探测的方式来实现自动导航，该方案的缺点是时效不高，应用场景有限。

```js
// 等待导航键盘示例代码
await Promise.all([chrome.keyboard.press("Enter"), chrome.autoNav()]);

// 鼠标示例
await Promise.all([page.click("#input"), chrome.autoNav()]);
```

### 高分屏分辨率

如果你的 chrome 运行在高分屏设备中，可能会出现 touch 事件错位的严重 bug，这种情况可以尝试使用“--force-device-scale-factor=”来调整缩放比例。

## autoChrome(options)

- `options` _Object_ 全局实例配置选项，优先级低于 page

  - `args[ars, ...]` _Array_ Chrome 启动参数数组

    - `ars` _String_ Chrome 启动参数

  - `executablePath` _String_ Chrome 程序执行路径

  - `userDataDir` _String_ 用户配置文件路径，定义独立的 Chrome 实例，支持 cluster 模式下并行

  - `emulate` _Object_ 设备仿真，该配置对于初始标签不太凑效，可能由于初始 targetCreated 事件并没有被捕获。

    - `viewport` _Object_

      - `mobile` _Boolean_ 移动设备，默认 false

      - `width` _Number_ 屏幕宽度，默认自适应屏幕宽度

      - `height` _Number_ 屏幕高度，默认自适应屏幕高度

    - `geolocation` _Object_ 地理位置，使用 Google 地图坐标

      - `longitude` _Number_ 经度

      - `latitude` _Number_ 纬度

      - `accuracy` _Number_ 精准度

  - `headless` _Boolean_ 隐藏执行模式，默认 false

  - `devtools` _Boolean_ 为每个 page 自动打开 devtools，默认 false

  - `timeOut` _Number_ 消息响应超时时间，默认 150000

  - `ignoreHTTPSErrors` _Boolean_ 忽略 https 错误，默认 false

  - `disableDownload` _Boolean_ 禁止下载文件，默认 false

  - `loadTimeout` _Number_ 自动导航等待页面加载的最大停留时间，单位 ms

- `return` _Chrome_ Chrome 类实例

## class: Chrome

### chrome.clicker

mouse、touch 事件实例，引用自当前活动状态 page.clicker

### chrome.keyboard

键盘事件实例，引用自当前活动状态 page.keyboard

### chrome.pages

包含所有打开 page 的 Map 对象

### chrome.page

当前激活状态的 page

### chrome.newPage(url)

- `url` _String_ 打开网页地址，缺省时打开空白网页

### chrome.closePageById(pageId)

通过 pageId 关闭指定的标签

- `pageId` _String_ 要删除 page 的 id

### chrome.createBrowserContext()

创建独立的浏览器环境，只能在隐身模式下运行。

### chrome.send(method, params)

发送原始的 chrome devtools 协议消息

- `method` _String_ 方法名

- `params` _Object_ 参数

### chrome.autoNav(time)

- `time` _Number_ 等待超时时间

循环监测，自动导航

### chrome.close()

关闭浏览器

## class: Page

### page.clicker

mouse、touch 事件实例，当 autoChrome(options)配置项 emulate.viewport.mobile 值为 true 时，使用 touch 实例，否则使用 mouse 实例

### page.keyboard

键盘实例

### page.emulate(options)

设备仿真，直接调用该方法可能导致混乱，正常应该由事件驱动在创建标签执行 page.emulate()，手动调用会存在延时覆盖问题。

- `options` _Object_ 选项

  - `mobile` _Boolean_ 移动设备

  - `width` _Number_ 屏幕宽度

  - `width` _Number_ 屏幕高度

  - `geolocation` _Object_ 地理位置

    - `longitude` _Number_ 经度

    - `latitude` _Number_ 纬度

    - `accuracy` _Number_ 精准度

### page.goto(url)

在标签内打开新网页

### page.run(pageFunction, ...arg)

向页面注入 js 函数，获取执行后的返回值

- `pageFunction` _Function_ 注入函数

- `arg` \* 可序列化参数，不支持函数

- `return` _Object_ 远程资源相关信息，[RemoteObject](https://chromedevtools.github.io/devtools-protocol/tot/Runtime#type-RemoteObject)

### page.$(selector)

选择单个元素

- `selector` _String_ CSS 选择器

- `return` _Object_ 单个 Elment 实例

### page.$$(selector)

选择多个元素

- `selector` _String_ CSS 选择器

- `return` _Array_ 多个 Elment 实例数组

### page.click(selector)

通过 CSS 选择器点击元素

### page.clickNav(selector)

通过 CSS 选择器点击元素，内置导航

- `selector` _String_ CSS 选择器

### page.type(selector, text, options)

通过 CSS 选择器聚焦 input，输入文本

- `selector` _String_ CSS 选择器

- `text` _String_ 输入文本

- `options` _Object_ 配置信息

  - `delay` _Number_ 输入间隔时间，ms

### page.send(method, params)

发送包含 session 的原始 chrome devtools 协议消息

- `method` _String_ 方法名

- `params` _Object_ 参数

### page.scroll(selector)

滚动至指定元素可视区域，会尽量沿 Y 轴居中

- `selector` _String_ CSS 选择器

### page.focus(selector)

通过 CSS 选择器聚焦元素

- `selector` _String_ CSS 选择器

### page.getBoundingRect(selector)

通过 CSS 选择器获取元素坐标，值由 getBoundingClientRect()函数获取

- `selector` _String_ CSS 选择器

### page.close()

关闭标签

### page.prev()

导航到上一个历史标签页

### page.next()

导航到下一个历史标签页

### class: Element

用于实现可追溯的远程 elment，避免代码重复提交和重复执行。

对于大的对象或 DOM 对象，直接返回它们并不现实，因此需要一种远程操作的增量机制。devtools 通过保存注入函数的执行结果并返回引用 id，实现状态追踪，这样就可以在已有远程结果基于上做增量操作。

### elment.$(selector)

- `selector` _String_

- `return` _Object_ Elment 实例

选择单个元素，并生成远程引用对象

### elment.$$(selector)

- `selector` _String_

- `return` _Array_ 多个 Elment 实例数组

选择多个元素，并生成远程引用对象

### elment.get(name)

- `name` _String_

获取 elment 中指定的属性值

### elment.set(name, value)

- `name` _String_ 属性名称

- `value` \* 属性值

设置 elment 中指定的属性值

### elment.value(value)

- `value` _String_ 赋值

获取或设置值，仅适用于表单元素

### elment.focus()

聚焦元素

### elment.getBoundingRect()

通过 getBoundingClientRect 函数获取元素大小、坐标信息

### elment.scrollIntoView()

于将指定元素快速切换至可视区域

## class: Mouse

### mouse.click(x, y, options)

新增模拟鼠标移动轨迹，原 click 可能出于效率考虑，只会触发一次 mousemoved

click 操作中已经包含了 move，多数情况下不再需要单独模拟 move 操作，除非只移动鼠标而不需要点击

- `options` _Object_

  - `steps` _Number_ mousemoved 事件的触发次数，默认 20

### mouse.move(x, y, options)

将 steps 默认值改为 20，原值为 1，即只触发一次。移动距离相同时，触发次数越少，对应的移动速度越快

- `options` _Object_ 选项

  - `steps` _Number_ 触发 mousemoved 事件的次数，默认值 20

### mouse.scroll(x, y, step)

滚动至指定坐标，目前仅支持纵向滚动

- `x` _Number_ 横向坐标，0

- `y` _Number_ 纵向坐标

- `step` _Number_ 步长

## class: Touch

### touch.slide({start, end, steps})

模拟 touch 单点滑动手势

- `start` _Object_ 起始坐标

  - `x` _Number_ touchstart x 坐标

  - `y` _Number_ touchstart y 坐标

- `end` _Object_ 结束坐标

  - `x` _Number_ touchend x 坐标

  - `y` _Number_ touchend y 坐标

- `steps` _Number_ touchmove 的触发次数

- `delay` _Number_ 触点释放前的停留时间，用于滑动惯性控制

### touch.scroll(x, y, options)

通过 touch 滚动页面至指定的可视坐标

- `x` _Number_ 目标 x 坐标

- `y` _Number_ 目标 y 坐标

- `options` _Object_

  - `interval` _Number_ 连续滑动的时间间隔，默认 2000，单位 ms

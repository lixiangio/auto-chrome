## 版本更新

### 0.4.10

* 默认时间微调

### 0.5.0

* 增加page.goBack()、page.goForward()


### 0.5.1

* 捕获由ws模块抛出的未知bug，退出浏览器

### 0.6.0

* 调整autoChrome()配置参数

### 0.7.0

* 修复node.js 11下消息定时器失效的bug

* 修复导航时生命周期控制不稳定的bug

### 0.9.2

* 优化双工消息队列，将无上下级依赖的同级消息由异步发送改为同步发送

### 0.10.0

* 增加viewport.screenWidth、viewport.screenHeight参数，用于定义屏幕分辨率

* viewport.width、viewport.height在缺省状态下会用screenWidth、screenHeight进行填充

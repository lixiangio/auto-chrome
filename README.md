# auto-chrome

Automated control of Chrome or Chromium using Node.js, a highly emulated user behavior simulator based on the [chrome devtools](https://chromedevtools.github.io/devtools-protocol/) protocol.

Borrowed from puppeteer, the rewrite was chosen because puppeteer has various strange bugs in practice, causing threads to constantly block and be difficult to fix, and some implementation details are not as expected.

The chrome devtools protocol api is too primitive and not developer-friendly. puppeteer api is feature-rich, but still too cumbersome and has some bugs that are hard to avoid.

auto-chrome is designed with simplicity and ease of use in mind, focusing on simplifying common application scenarios and meeting customization needs through extensions.

## Features

- Auto-chrome supports auto-focus, which automatically switches tabs based on the currently active tabs, and gets the currently active tabs via chrome.page. This avoids the pain of switching between multiple tabs in practice and reduces the confusion caused by manual tab switching.

- Support active navigation monitoring, avoiding the user's negligent failure to clearly define the navigation behavior, resulting in confusing operations.

- Supports automatic release of message queue waiting timeout. Due to various uncontrollable factors, devtools does not guarantee 100% response to all messages sent, and messages will be in a continuous waiting state without a timeout mechanism, making it impossible for tasks to continue to be executed

- Unbind mouse, keyboard and touch input devices from the page, avoiding frequent switching between multiple pages

- Support high simulation input, simulating mouse trajectory and Touch gestures

- Simplified error handling mechanism, even if the task is abnormal, it can still continue to run, so as far as possible to ensure that threads do not persistently block

- Support GPS location

## Install

npm install auto-chrome
npm install auto-chrome
```

## chromium installation

Due to the network environment, auto-chrome does not install chromium directly as an npm dependency like puppeteer does. So you need to download chromium manually and specify the installation path in the launch.executablePath configuration item.

Recommended source: https://npm.taobao.org/mirrors/chromium-browser-snapshots/

## chrome devtools terminology

- `Target` represents a target object in the browser, which can be one of the browser, page, iframe, or other types. When type is page, targetId corresponds to the frame id of the main frame.

- `Session` session mechanism is used to create multiple sessions, you can bind a separate session for each Target, or you can let multiple Targets share the same session.

- `Page` browser tab, Chrome allows multiple Pages to be opened, but only one Page is always active.

- ` Runtime` JavaScript runtime, used to inject JS code into a web page to manipulate the DOM.

- `Frame` The frame in a web page, the main Frame is allowed to contain multiple child frames.

- `Context` The context in which the JavaScript runs. Since a page may contain Frames, each Frame has a separate runtime, so a unique contextId needs to be generated to distinguish between them.

## Caution

The 301 redirects to a new url and triggers multiple context switches in a row, resulting in a context mismatch. 301 is hard to detect and difficult to predict, so extra care should be taken when debugging.

## Page navigation

Browser navigation events can be divided into two kinds of predictable and unpredictable, because the navigation is triggered in many ways, through the mouse, keyboard, JS script method may trigger unknown navigation events. If the navigation switch is not timed correctly, it can create a bug of misplaced contextual messages.

### Predictable navigation

For explicit operations like chrome.newPage() and page.goto(), which explicitly include navigation behavior, autoChrome wraps them internally and requires no additional processing when using them.

### Unpredictable navigation

- Navigation may refresh the current tab or create a new tab

- Unpredictable navigation behavior of jump links triggered by JS

- One or more 301 redirects after clicking a link

- Uncertainty of redirects due to browser 301 caching

In the above case, it is impossible to accurately predict whether an action will trigger a navigation event. autoChrome implements automatic navigation by means of round-robin detection, which has the disadvantage of not being very time-efficient and has limited application scenarios.

```js
// await navigation keyboard sample code
await Promise.all([chrome.keyboard.press("Enter"), chrome.autoNav()]);

// Mouse example
await Promise.all([page.click("#input"), chrome.autoNav()]);
```

### High split screen resolution

If your chrome is running on a high split-screen device, you may get a serious bug with touch events being misaligned, in which case try using "--force-device-scale-factor=" to adjust the scaling.

## autoChrome(options)

- `options` _Object_ Global instance configuration options, with lower priority than page

  - ` args[ars, ...] ` _Array_ Array of Chrome startup parameters

    - `ars` _String_ Chrome startup parameters

  - `executablePath` _String_ Chrome program execution path

  - `userDataDir` _String_ Path to user profile, defines separate Chrome instances, supports parallelism in cluster mode

  - `emulate` _Object_ Device emulation, this configuration is less effective for initial tags, probably because the initial targetCreated event is not caught.

    - `viewport` _Object_

      - `mobile` _Boolean_ Mobile device, default false

      - `width` _Number_ Screen width, default adaptive screen width

      - `height` _Number_ Screen height, default adaptive screen height

    - `geolocation` _Object_ geolocation, use Google Maps coordinates

      - `longitude` _Number_ Longitude

      - `latitude` _Number_ Latitude

      - `accuracy` _Number_ Accuracy

  - `headless` _Boolean_ Hide execution mode, default false

  - `devtools` _Boolean_ Automatically turn on devtools for each page, default false

  - `timeOut` _Number_ Message response timeout, default 150000

  - `ignoreHTTPSErrors` _Boolean_ Ignore https errors, default false

  - `disableDownload` _Boolean_ Disable downloading of files, default false

  - `loadTimeout` _Number_ Maximum dwell time for auto-navigation to wait for a page to load, in ms

- `return` _Chrome_ Chrome class instance

## class: Chrome

### chrome.clicker

mouse, touch event instance, referenced from the currently active state page.clicker

### chrome.keyboard

Keyboard event instance, referenced from the currently active state page.keyboard

### chrome.pages

Map object containing all open pages

### chrome.page

The page that is currently active

### chrome.newPage(url)

- `url` _String_ opens the page address, by default it opens a blank page

### chrome.closePageById(pageId)

Closes the specified tab by pageId

- `pageId` _String_ The id of the page to delete

### chrome.createBrowserContext()

Creates a standalone browser environment that can only be run in incognito mode.

### chrome.send(method, params)

Sends the original chrome devtools protocol message

- `method` _String_ method name

- `params` _Object_ parameters

### chrome.autoNav(time)

- `time` _Number_ Wait timeout time

Cyclic monitoring, automatic navigation

### chrome.close()

Close the browser

## class: Page

### page.clicker

mouse, touch event instances, use touch instance when autoChrome(options) configuration item emulate.viewport.mobile is true, otherwise use mouse instance

### page.keyboard

Keyboard instance

### page.emulate(options)

Device emulation, direct calls to this method may cause confusion, the normal event-driven execution of page.emulate() should be done at the creation of the label, manual calls will have a delayed override problem.

- `options` _Object_ options

  - `mobile` _Boolean_ Mobile device

  - `width` _Number_ screen width

  - `width` _Number_ screen height

  - `geolocation` _Object_ geolocation

    - `longitude` _Number_ Longitude

    - `latitude` _Number_ Latitude

    - `accuracy` _Number_ precision

### page.goto(url)

Open a new page inside a tab

### page.run(pageFunction, ... .arg)

Inject a js function into the page and get the return value after execution

- `pageFunction` _Function_ injects the function

- `arg` \* serializable arguments, no function support

- `return` _Object_ Information about the remote resource, [RemoteObject](https://chromedevtools.github.io/devtools-protocol/tot/Runtime#type-RemoteObject)

### page.$(selector)

Select a single element

- `selector` _String_ CSS selector

- `return` _Object_ Single Elment Instance

### page.$$(selector)

Selects multiple elements

- `selector` _String_ CSS selector

- `return` _Array_ Array of multiple Elment instances

### page.click(selector)

Click on an element with a CSS selector

### page.clickNav(selector)

Clicking on an element via CSS selector, built-in navigation

- `selector` _String_ CSS selector

### page.type(selector, text, options)

Focus input with CSS selector, input text

- `selector` _String_ CSS selector

- `text` _String_ input text

- `options` _Object_ configuration information

  - `delay` _Number_ input interval, ms

### page.send(method, params)

Send the original chrome devtools protocol message containing the session

- `method` _String_ method name

- `params` _Object_ parameters

### page.scroll(selector)

Scrolls to the viewable area of the specified element, trying to center it along the Y-axis

- `selector` _String_ CSS selector

### page.focus(selector)

Focuses the element with a CSS selector

- `selector` _String_ CSS selector

### page.getBoundingRect(selector)

Get the element coordinates by CSS selector, the value is obtained by the getBoundingClientRect() function

- `selector` _String_ CSS selector

### page.close()

Close the tag

### page.prev()

Navigate to the previous history tab

### page.next()

Navigate to the next history tab

### class: Element

Used to implement traceable remote elment to avoid duplicate code commits and repeated executions.

For large objects or DOM objects, it is not practical to return them directly, so an incremental mechanism for remote operations is needed. devtools implements state tracking by saving the execution results of injected functions and returning the reference id, so that incremental operations can be done on top of existing remote results.

### elment.$(selector)

- `selector` _String_

- `return` _Object_ Elment Instance

Selects a single element and generates a remote reference object

### elment.$$(selector)

- `selector` _String_

- `return` _Array_ Array of multiple Elment instances

Selects multiple elements and generates a remote reference object

### elment.get(name)

- `name` _String_

Get the value of the property specified in elment

### elment.set(name, value)

- `name` _String_ Attribute name

- `value` \* property value

Set the value of the attribute specified in the elment

### elment.value(value)

- `value` _String_ Assignment

Gets or sets the value, only for form elements

### elment.focus()

Focus the element

### elment.getBoundingRect()

Get the element size and coordinates with the getBoundingClientRect function

### elment.scrollIntoView()

Quickly switch the specified element to the viewable area

## class: Mouse

### mouse.click(x, y, options)

Add a new mousemoved track simulation, the original click may only trigger once for efficiency reasons

The click operation already includes move, so in most cases it is no longer necessary to simulate a separate move operation, unless you only move the mouse and do not need to click

- `options` _Object_

  - `steps` _Number_ The number of times the mousemoved event is triggered, default 20

### mouse.move(x, y, options)

Change the default value of steps to 20, the original value is 1, i.e. only triggered once. If the move distance is the same, the lower the number of triggers, the faster the corresponding move speed

- `options` _Object_ options

  - `steps` _Number_ The number of times the mousemoved event is triggered, the default value is 20

### mouse.scroll(x, y, step)

Scroll to specified coordinates, currently only supports vertical scrolling

- `x` _Number_ horizontal coordinate, 0

- `y` _Number_ vertical coordinate

- `step` _Number_ step length

## class: Touch

### touch.slide({start, end, steps})

Simulate touch single swipe gesture

- `start` _Object_ Start coordinates

  - `x` _Number_ touchstart x-coordinate

  - `y` _Number_ touchstart y coordinate

- `end` _Object_ end coordinates

  - `x` _Number_ touchend x coordinate

  - `y` _Number_ touchend y coordinate

- `steps` _Number_ number of touchmove triggers

- `delay` _Number_ dwell time before touch release, used for slide inertia control

### touch.scroll(x, y, options)

Scrolls the page to the specified visual coordinates by touch

- `x` _Number_ Target x coordinate

- `y` _Number_ target y-coordinate

- `options` _Object_

  - `interval` _Number_ The interval between successive swipes, default 2000, in ms

Translated with www.DeepL.com/Translator (free version)


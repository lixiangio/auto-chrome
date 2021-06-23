# auto-chrome

A highly emulated user behaviour simulator using Node.js to automate control of Chrome or Chromium, based on the [chrome devtools](https://chromedevtools.github.io/devtools-protocol/) protocol.

Borrowed from puppeteer, the rewrite was chosen because in practice puppeteer has various strange bugs that cause threads to constantly block and are difficult to fix, and some implementation details are not as expected.

The chrome devtools protocol api is too primitive and not developer friendly. the puppeteer api is feature rich but still too cumbersome to use and has a few bugs that are hard to get around.

auto-chrome is designed for simplicity and ease of use, with a focus on simplifying common application scenarios and customisation through extensions.


## Features

* Supports autofocus, which automatically switches between tabs based on the currently active tabs, using chrome.page to get the currently active tabs. This avoids the hassle of switching between multiple tabs in practice, and reduces the confusion caused by manual tab switching.

* Supports active navigation monitoring to prevent users from inadvertently failing to clearly define navigation actions that could lead to confusing operations.

* Support for automatic release of message queue wait timeout. Due to various uncontrollable factors, devtools does not guarantee 100% response to all messages sent, and without a timeout mechanism messages will be in a constant wait state, resulting in tasks not being able to continue.

* Unbind mouse, keyboard and touch input devices to pages to avoid frequent switching of devices between pages

* Highly emulated input, simulating mouse trajectory and Touch gestures

* Simplified error handling mechanism that allows tasks to continue running even if there is an exception, ensuring that threads do not persistently block as much as possible

* Support for GPS positioning

## Install

```
npm install auto-chrome
```


## chromium installation

Due to network environment factors, auto-chrome does not install chromium directly as an npm dependency like puppeteer does. Therefore you need to download chromium manually and specify the installation path in the launch.executablePath configuration item.

Recommended source: https://npm.taobao.org/mirrors/chromium-browser-snapshots/



## chrome devtools terminology

* `Target` represents a target object in the browser, which can be one of types browser, page, iframe, or other. When the type is page, the targetId corresponds to the frame id of the main frame.

* ` Session` The session mechanism is used to create multiple sessions, either by binding a separate session for each Target or by having multiple Targets share the same session.

* `Page` browser tab, Chrome allows multiple Pages to be open, but only one Page is always active.

* `Runtime` JavaScript runtime, used to inject JS code into a web page to enable manipulation of the DOM.

* `Frame` The frame in a web page, the main Frame is allowed to contain multiple sub-Frames.

* `Context` The context in which the JavaScript is run. As a page may contain Frames, each Frame has a separate runtime, so a unique contextId needs to be generated to distinguish between them.


## Caution

The 301 redirects to a new url, triggering multiple context switches in succession, resulting in contextual misalignment. 301 is difficult to detect and difficult to pre-determine, and extra care should be taken when debugging.

## Page Navigation

Browser navigation events can be classified as either predictable or unpredictable, and as there are so many ways to trigger navigation, unknown navigation events can be triggered by mouse, keyboard, or JS scripting methods. If navigation toggles are not timed correctly, this can result in a buggy contextual message.

### Predictable navigation

For explicit operations such as chrome.newPage() and page.goto(), which explicitly include navigation behaviour, autoChrome wraps them internally and does not require additional processing when using them.

### Unpredictable navigation

* Navigation may refresh the current tab and may create new tabs

* Unpredictable navigation behaviour via JS triggered jump links

* One or more 301 redirects after clicking on a link

* Uncertainty of redirects due to browser 301 caching

In the above case, it is not possible to predict exactly whether an action will trigger a navigation event. autoChrome implements automatic navigation by means of cyclic detection, which has the disadvantage of not being very time-efficient and has limited application scenarios.

```js
// Waiting for the navigation keyboard example code
await Promise.all([
    chrome.keyboard.press("Enter"),
    chrome.autoNav()
])

// Mouse example
await Promise.all([
    page.click("#input"),
    chrome.autoNav()
])
```

### High split screen resolution

If your chrome is running in a high split screen device, there may be a serious bug with touch events being misaligned, in which case try using "--force-device-scale-factor=" to adjust the scaling.

## autoChrome(options)

* `options` *Object* Global instance configuration option with lower priority than page

    * `args[ars, ...]` *Array* Chrome Launch Parameters Array

        * `ars` *String* Chrome Launch Parameters

    * `executablePath` *String* Chrome program execution path

    * `userDataDir` *String* User profile paths, definition of separate Chrome instances, support for parallelism in cluster mode

    * `emulate` *Object* device emulation, this configuration does not work well for the initial tag, probably because the initial targetCreated event is not captured.

        * `viewport` *Object* 

            * `mobile` *Boolean* Mobile device, default false

            * `width` *Number* the width of the screen, the default adaptive screen width

            * `height` *Number* the height of the screen, adapts to the screen height by default

        * `geolocation` *Object* geolocation, uses Google Maps coordinates

            * `longitude` *Number* longitude

            * `latitude` *Number* latitude

            * `accuracy` *Number* precision

     * `headless` *Boolean* Hide execution mode, default false

     * `devtools` *Boolean* Automatically opens devtools for each page, default false

     * `timeOut` *Number* message response timeout, default 150000

     * `ignoreHTTPSErrors` *Boolean* Ignore https errors, default false

    * `disableDownload` *Boolean* disables downloading of files, default false

     * `loadTimeout` *Number* Maximum time to wait for a page to load for auto-navigation, in ms

* `return` *Chrome* Chrome Class Example

## class: Chrome

### chrome.clicker
mouse, touch event example, referenced from the currently active state page.clicker

### chrome.keyboard

Keyboard event instance, referenced from the currently active page.keyboard

### chrome.pages

Map object containing all open pages

### chrome.pages

The page in the currently active state

### chrome.newPage(url)

* `url` *String* the address of the page to open, by default it opens a blank page

### chrome.closePageById(pageId)

Closes the specified tab by pageId

* `pageId` *String* the id of the page to delete

### chrome.createBrowserContext()

Creates a standalone browser environment that can only be run in incognito mode.

### chrome.send(method, params)

Sends the original chrome devtools protocol message

* `method` *String* method name

* `params` *Object* parameters

### chrome.autoNav(time)

* `time` *Number* wait timeout time

Loop monitoring, autoNav


### chrome.close()

Closes the browser


### class: Page

### page.clicker

mouse, touch event instances, use touch instance when autoChrome(options) config item emulate.viewport.mobile is true, otherwise use mouse instance

### page.keyboard

Keyboard instance

### page.emulate(options)

Device emulation, calling this method directly may lead to confusion, it should normally be executed by the event driver at the creation of the label page.emulate(), calling it manually will suffer from delayed overwriting.

* `options` *Object* options

    * `mobile` *Boolean* mobile device

    * `width` *Number* screen width

    * `width` *Number* screen height

    * `geolocation` *Object* geolocation

        * `longitude` *Number* longitude

        * `latitude` *Number* latitude

        * `accuracy` *Number* precision

### page.goto(url)

Open a new page inside a tab

### page.run(pageFunction, ... .arg)

Injects a js function into the page and gets the return value after execution

* `pageFunction` *Function* injects a function

* `arg` * serializable arguments, no function support

* `return` *Object* information about the remote resource, [RemoteObject](https://chromedevtools.github.io/devtools-protocol/tot/Runtime#type-RemoteObject)

### page.$(selector)

Selects a single element

* `selector` *String* CSS selector

* `return` *Object* single Elment instance

### page.$$(selector)

Selects multiple elements

* `selector` *String* CSS selector

* `return` *Array* array of multiple Elment instances

### page.click(selector)

Click on an element via CSS selector

### page.clickNav(selector)

Clicking on elements via CSS selectors, built-in navigation

* `selector` *String* CSS selector

### page.type(selector, text, options)

Focus input with CSS selector, input text

* `selector` *String* CSS selector

* `text` *String* input text

* `options` *Object* configuration information

    * `delay` *Number* input interval, ms

### page.send(method, params)

Sends the original chrome devtools protocol message containing the session

* `method` *String* method name

* `params` *Object* parameters


### page.scroll(selector)

Scrolls to the visible area of the specified element, trying to centre it along the y-axis

* `selector` *String* CSS selector

### page.focus(selector)

Focuses the element with a CSS selector

* `selector` *String* CSS selector

### page.getBoundingRect(selector)

Get the coordinates of the element by CSS selector, the value is obtained by the getBoundingClientRect() function

* `selector` *String* CSS selector

### page.close()

Closes the tag

### page.prev()

Navigate to the previous history tab

### page.next()

Navigate to the next history tab


### class: Element

Used to implement traceable remote elment and avoid duplicate code commits and repeated executions.

For large objects or DOM objects, it is not practical to return them directly, so an incremental mechanism for remote operations is needed. devtools implements state tracking by saving the execution results of the injected function and returning the reference id, so that incremental operations can be done on top of the existing remote results.

### elment.$(selector)

* `selector` *String* 

* `return` *Object* Elment instance

Selects a single element and generates a remote reference object

### elment.$$(selector)

* `selector` *String* 

* `return` *Array* Array of multiple Elment instances

Selects multiple elements and generates a remote reference object

### elment.get(name)

* `name` *String* 

Gets the value of the property specified in the elment

### elment.set(name, value)

* `name` *String* The name of the attribute

* `value` * Attribute value

Set the value of the attribute specified in elment

### elment.value(value)

* `value` *String* Assign a value

Gets or sets a value, applies to form elements only

### elment.focus()

Focuses the element

### elment.getBoundingRect()

Get the size and coordinates of the element with the getBoundingClientRect function

### elment.scrollIntoView()

Quickly switch the specified element to the viewable area

## class: Mouse

### mouse.click(x, y, options)

Adds simulated mouse trajectory, the original click may only trigger a mousemoved once for efficiency reasons

The click action already includes the move action, so in most cases there is no need to simulate the move action separately, unless you only move the mouse and don't need to click

* `options` *Object*

   * `steps` *Number* number of times the mousemoved event is triggered, default 20


### mouse.move(x, y, options)

Change the default value of steps to 20, the original value is 1, i.e. it is only triggered once. If the distance travelled is the same, the lower the number of triggers, the faster the corresponding movement

* `options` *Object* options

   * `steps` *Number* The number of times the mousemoved event is triggered, default value is 20


### mouse.scroll(x, y, step)

Scroll to specified coordinates, currently only supports vertical scrolling

* `x` *Number* horizontal coordinates, 0

* `y` *Number* vertical coordinate

* `step` *Number* step length



## class: Touch

### touch.slide({start, end, steps})

Simulates the touch single swipe gesture

* `start` *Object* Start coordinate

   * `x` *Number* touchstart x coordinate

   * `y` *Number* touchstart y coordinate

* `end` *Object* end coordinate

   * `x` *Number* touchend x coordinate

   * `y` *Number* touchend y coordinate

* `steps` *Number* the number of times touchmove has been triggered

* `delay` *Number* dwell time before touch release, used for slide inertia control


### touch.scroll(x, y, options)

Scrolls the page by touch to the specified visual coordinates

* `x` *Number* target x coordinate

* `y` *Number* target y coordinate

* `options` *Object*

   * `interval` *Number* the interval between successive swipes, default 2000, in ms
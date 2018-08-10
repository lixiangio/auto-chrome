const autoChrome = require('../../')
const devices = require('../../DeviceDescriptors');
const iPhone6 = devices['iPhone 6'];

const { sleep, signale } = autoChrome.helper

/**
 * 
 * @param {*} device 用户配置目录名称
 */
async function run() {

   let chrome = await autoChrome({
      executablePath: "D:/Project/clicker/client/chrome-win32/chrome.exe",
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/",
      args: ['--start-maximized'],
      devtools: false,
      // slowMo: 20, // 减速
   })

   let page = await chrome.page

   await page.emulate(iPhone6)

   await page.goto('D:/Nodejs/git-project/auto-chrome/test/touch/index.html')

   await page.evaluate(async function () {

      window.addEventListener('touchstart', function (ev) {
         let { localName, style } = ev.target
         style.backgroundColor = "#ea3c3c"
         console.log(ev.type)
      })

      window.addEventListener('touchmove', function (ev) {
         let { localName, style } = ev.target
         style.backgroundColor = "#f79c9c"
         console.log(ev.type)
      })

      window.addEventListener('touchend', function (ev) {
         let { localName, style } = ev.target
         style.backgroundColor = "#ea3c3c"
         console.log(ev.type)
      })

   })

   await sleep(2000)

   // 横向
   // await page.touch.slide({ start: { x: 700, y: 100 }, end: { x: 50, y: 100 }, steps: 20 })

   // 纵向
   // await page.touch.slide({ start: { x: 250, y: 500 }, end: { x: 250, y: 100 }, steps: 50 })

   // await page.$touchScroll('#taget', { steps: 50 })

   let { left, top } = await page.evaluate(async element => {
      let taget = document.getElementById('taget')
      let { top, left } = taget.getBoundingClientRect()
      return { left, top }
   });

   await page.touchScroll(left, top)

}

run()
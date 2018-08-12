const autoChrome = require('../../')
const devices = require('../../device')
const { sleep, signale } = autoChrome.helper

let { userAgent, viewport } = devices['iPhone 6'];

const { width, height } = viewport


/**
 * 
 * @param {*} device 用户配置目录名称
 */
async function run() {

   let chrome = await autoChrome({
      executablePath: "D:/Project/clicker/client/chrome-win32/chrome.exe",
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/",
      args: [
         // `--profile-directory=Default`, 
         `--user-agent=${userAgent}`,
         '--start-maximized',
         // `--window-position=0,0`,
         // `--window-size=${width}, ${height}`
      ],
      emulate: viewport,
      // devtools: true,
      // slowMo: 20, // 减速
   })

   await chrome.newPage('D:/Nodejs/git-project/auto-chrome/test/touch/index.html')

   await sleep(2000)

   await chrome.page.evaluate(async function () {

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
   // await page.touch.slide({
   //    start: { x: 700, y: 100 },
   //    end: { x: 50, y: 100 },
   //    steps: 20
   // })

   // 纵向
   // await page.touch.slide({
   //    start: { x: 250, y: 500 },
   //    end: { x: 250, y: 100 },
   //    steps: 50
   // })

   await chrome.page.touchScroll('#taget')

}

run().catch(function(error){
   console.error(error)
})
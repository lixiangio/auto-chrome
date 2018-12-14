const autoChrome = require('../../')
const devices = require('../../device')
const config = require('../helpers/config')

const { sleep, logger } = require('../helpers')
let { userAgent, viewport, isTouch } = devices['iPhone 6'];

const { width, height } = viewport

const { executablePath, userDataDir } = config

/**
 * 
 * @param {*} device 用户配置目录名称
 */
async function main() {

   let chrome = await autoChrome({
      executablePath,
      userDataDir,
      args: [
         // `--profile-directory=Default`, 
         `--user-agent=${userAgent}`,
         '--start-maximized',
         // `--window-position=0,0`,
         // `--window-size=${width}, ${height}`
      ],
      emulate: {
         viewport,
         isTouch
      },
      devtools: true,
      // slowMo: 20, // 减速
   })

   await chrome.newPage('D:/Nodejs/Project/auto-chrome/test/touch/index.html')

   await sleep(2000)

   await chrome.page.run(async function () {

      document.body.addEventListener('touchstart', function (ev) {
         let { localName, style } = ev.target
         style.backgroundColor = "#ea3c3c"
         console.log(ev.type)
      })

      document.body.addEventListener('touchmove', function (ev) {
         let { localName, style } = ev.target
         style.backgroundColor = "#f79c9c"
         console.log(ev.type)
      })

      document.body.addEventListener('touchend', function (ev) {
         let { localName, style } = ev.target
         style.backgroundColor = "#ea3c3c"
         console.log(ev.type)
      })

   })

   await sleep(2000)

   // 横向
   await chrome.page.touch.slide({
      start: { x: 700, y: 100 },
      end: { x: 50, y: 100 },
      steps: 20
   })

   // 纵向
   await chrome.page.touch.slide({
      start: { x: 250, y: 500 },
      end: { x: 250, y: 100 },
      steps: 50
   })

   await chrome.page.scroll('#taget')

}

main().catch(function (error) {
   console.error(error)
})
const autoChrome = require('../..')
const devices = require('../../device')

let { userAgent, viewport } = devices['Chrome'];

const { width, height } = viewport

console.log(userAgent)

async function run() {

   let chrome = await autoChrome({
      executablePath: "D:/Project/clicker/client/chrome-win32/chrome.exe",
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/",
      args: [
         `--user-agent=${userAgent}`,
         '--start-maximized',
         // `--window-size=${width}, ${height}`
      ],
      emulate: {
         geolocation: {
            longitude: 114.2916402075,
            latitude: 22.6088954693,
            accuracy: 14
         },
         screenWidth: width,
         screenHeight: height,
         width: width,
         height: Math.floor(height * 0.87),
         // mobile: true,
         // ...viewport
      },
      // devtools: true,
      // slowMo: 20, // 减速
   })

   await chrome.newPage('https://www.so.com/')

   let data = await chrome.page.evaluate(document => {

      return {
         "window.screen.height": window.screen.height,
         "window.screen.availHeight": window.screen.availHeight,
         "window.innerHeight": window.innerHeight,
         "window.screen.width": window.screen.width,
         "window.screen.availWidth": window.screen.availWidth,
         "window.innerWidth": window.innerWidth,
      }

   })

   console.log(data)

}

run()
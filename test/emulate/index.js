const autoChrome = require('../..')
const devices = require('../../device')
const { sleep, signale } = autoChrome.helper

let { userAgent, viewport } = devices['iPhone 6'];

const { width, height } = viewport

console.log(userAgent)

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
      emulate: {
         geolocation: {
            longitude: 114.2916402075,
            latitude: 22.6088954693,
            accuracy: 14
         },
         ...viewport
      },
      // devtools: true,
      // slowMo: 20, // 减速
   })

   await chrome.newPage('https://map.baidu.com/mobile/webapp/index/index/')

}

run()
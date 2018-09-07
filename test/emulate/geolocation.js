const autoChrome = require('../..')
const devices = require('../../device')

let { userAgent, viewport } = devices['iPhone 6'];

async function run() {

   let chrome = await autoChrome({
      executablePath: "D:/Project/clicker/client/chrome-win32/chrome.exe",
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/",
      args: [
         `--user-agent=${userAgent}`,
         '--start-maximized',
      ],
      emulate: {
         geolocation: {
            longitude: 114.2916402075,
            latitude: 22.6088954693,
            accuracy: 14
         },
         ...viewport
      }
   })

   await chrome.newPage('https://map.baidu.com/mobile/webapp/index/index/')
   
}

run()
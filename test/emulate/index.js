const autoChrome = require('../..')
const devices = require('../../device')
const { sleep, signale } = autoChrome.helper

let { userAgent, viewport } = devices['iPhone 6'];

const { width, height } = viewport

console.log(userAgent)

console.log(viewport)

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

   await chrome.newPage('https://ie.icoa.cn/')

}

run()
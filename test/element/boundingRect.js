const autoChrome = require('../..')
const { sleep, logger } = autoChrome.helper

async function run() {

   let chrome = await autoChrome({
      executablePath: "D:/Project/clicker/client/chrome-win32/chrome.exe",
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/",
      args: ['--start-maximized'],
      devtools: false,
      // slowMo: 20, // 减速
   })

   // http
   await chrome.page.goto('http://nodejs.cn/')

   let element1 = await chrome.page.$('#logo img')

   let boundingRect1 = await element1.getBoundingRect()

   console.log(boundingRect1)

   // https
   await chrome.page.goto('https://www.so.com/')

   let element2 = await chrome.page.$('#bd_logo')

   let boundingRect2 = await element2.getBoundingRect()

   console.log(boundingRect2)

}

run()
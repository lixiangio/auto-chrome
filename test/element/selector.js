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

   await chrome.page.goto('https://www.so.com/')

   await sleep(3000)

   // let body = await chrome.page.$('body')

   // let header = await body.$('#header')

   // let nav = await header.$$('nav > a')

   let nav = await chrome.page.$$('#header nav > a')

   let [, , element] = nav

   let innerText = await element.get('innerText')

   console.log(innerText)

}

run()
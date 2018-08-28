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

   // await chrome.page.goto('https://www.so.com/')

   // let value = await chrome.page.evaluate((document, selector) => {
   //    let innerText = document.querySelector(selector).innerText
   //    return innerText
   // }, '.login')


   await chrome.page.goto('http://www.runoob.com/')

   let value = await chrome.page.evaluate((document, selector) => {
      let innerText = document.querySelector(selector).innerText
      return innerText
   }, '#index-nav li a')

   console.log(value)

}

run()
const autoChrome = require('..')
const { sleep, signale } = autoChrome.helper

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

   let value = await chrome.page.evaluate(function (selector) {
      let innerText = document.querySelector(selector).innerText
      return innerText
   }, '.login')

   console.log(value)

}

run()
const autoChrome = require('../..')
const { sleep, signale } = autoChrome.helper

async function run() {

   let chrome = await autoChrome({
      executablePath: "D:/Project/clicker/client/chrome-win32/chrome.exe",
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/",
      args: ['--start-maximized'],
      devtools: false,
      // slowMo: 20, // 减速
   })

   await chrome.page.goto('http://www.runoob.com/')

   await sleep(2000)

   let element = await chrome.page.$('#footer')

   // console.log(element)

   await element.scroll()


}

run()
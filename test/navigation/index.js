const autoChrome = require('../../')
const { sleep, signale } = autoChrome.helper


async function run() {

   let chrome = await autoChrome({
      executablePath: "D:/Project/clicker/client/chrome-win32/chrome.exe",
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/",
      args: ['--start-maximized'],
      devtools: false,
      // slowMo: 20, // 减速
   })

   let page = await chrome.newPage()

   await page.goto('https://www.baidu.com/')

   await sleep(2000)

   await page.click('a[href="https://www.hao123.com"]')

}

run()
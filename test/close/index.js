const autoChrome = require('../../')
const { sleep, logger } = autoChrome.helper

async function run() {

   let chrome = await autoChrome({
      executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/",
      args: ['--start-maximized'],
      devtools: false,
      // slowMo: 20, // 减速
   })

   let page1 = await chrome.newPage('https://www.so.com/')

   await sleep(1000)

   let page2 = await chrome.newPage('https://www.baidu.com/')

   await sleep(2000)

   await chrome.clicker.scroll(0, 500)

   await sleep(1000)

   await page2.close()

   await sleep(4000)

   await chrome.page.goto('https://www.szhkch.com/')

   await sleep(2000)

   await page1.close()

   await sleep(3000)

   await chrome.close()

}

run()
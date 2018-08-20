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

   // chrome.on('navigation', page => {
   //    console.log(page.targetId)
   // })

   // let page = await chrome.newPage('https://www.baidu.com/')

   await chrome.page.goto('https://www.baidu.com/')

   // await sleep(2000)

   await chrome.page.goto('http://v.baidu.com/')

   await chrome.page.goto('https://www.hao123.com/')

   await chrome.page.goto('https://cn.vuejs.org/')

   await chrome.page.goto('http://johnny-five.io/')

   await chrome.page.goto('https://github.com/')

   // await chrome.page.goto('https://www.hao123.com/')

   // await page.click('a[href="https://www.hao123.com"]')

}

run()
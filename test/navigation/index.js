const autoChrome = require('../../')
const { sleep, logger } = require('../helpers')


async function main() {

   let chrome = await autoChrome({
      executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/",
      args: ['--start-maximized'],
      devtools: false,
      // slowMo: 20, // 减速
   })

   let page = await chrome.newPage('https://www.baidu.com/')

   await page.goto('https://www.baidu.com/')

   await page.goto('http://v.baidu.com/')

   await page.goto('https://www.hao123.com/')

   await page.goto('https://cn.vuejs.org/')

   await page.goto('http://johnny-five.io/')

   await page.goto('https://github.com/')

   await page.goto('https://www.hao123.com/')

   await page.click('a[href="https://www.hao123.com"]')

}

main()
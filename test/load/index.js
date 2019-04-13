const autoChrome = require('../../lib/')
const { sleep, logger } = require('../helpers')

async function main() {

   let chrome = await autoChrome({
      executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/",
      args: ['--start-maximized'],
      devtools: false,
   })

   let page = await chrome.newPage('http://v.baidu.com/')

   await page.goto('https://www.hao123.com')

}

main()
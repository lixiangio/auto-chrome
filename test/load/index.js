const autoChrome = require('../../')
const { sleep, logger } = autoChrome.helper


async function main() {

   let chrome = await autoChrome({
      executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/",
      args: ['--start-maximized'],
      devtools: false,
      // slowMo: 20, // 减速
   })

   chrome.on('navigation', page => {
      console.log(page.targetId)
   })

   let page = await chrome.newPage('http://v.baidu.com/')

   await page.goto('https://www.hao123.com')

}

main()
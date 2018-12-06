const autoChrome = require('../..')
const { sleep, logger } = autoChrome.helper

async function main() {

   let chrome = await autoChrome({
      executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/",
      args: ['--start-maximized'],
      devtools: false,
      // slowMo: 20, // 减速
   })

   await chrome.page.goto('https://www.so.com/')

   await sleep(3000)

   let $ = await chrome.page.$('.login, #input')

   console.log(!!$)

   let $$ = await chrome.page.$$('.login, #input')

   console.log($$.length)

}

main()
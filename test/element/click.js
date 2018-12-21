const autoChrome = require('../..')
const { sleep, logger } = require('../helpers')

async function main() {

   let chrome = await autoChrome({
      executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/",
      args: ['--start-maximized'],
      devtools: false,
   })

   await chrome.page.goto('https://www.so.com/')

   let nav = await chrome.page.$$('#header nav > a')

   let [, , , element] = nav

   await element.click()

}

main()
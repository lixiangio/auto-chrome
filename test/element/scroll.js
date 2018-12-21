const autoChrome = require('../..')
const { sleep, logger } = require('../helpers')

async function main() {

   let chrome = await autoChrome({
      executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/",
      args: ['--start-maximized'],
      devtools: false,
   })

   await chrome.page.goto('http://www.runoob.com/')

   await sleep(2000)

   let element = await chrome.page.$('#footer')

   // console.log(element)

   await element.scroll()


}

main()
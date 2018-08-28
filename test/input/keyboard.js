const autoChrome = require('../..')
const { sleep, logger } = autoChrome.helper

async function run() {

   let chrome = await autoChrome({
      executablePath: "D:/Project/clicker/client/chrome-win32/chrome.exe",
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/",
      args: ['--start-maximized'],
      // devtools: true,
      // slowMo: 20, // 减速
   })

   let page = chrome.page

   await page.goto('http://www.runoob.com/')

   await sleep(1000)

   let input = await page.$('.search-desktop .placeholder')

   await input.focus()

   await input.type('hellow word')

   await sleep(500)

   await page.keyboard.press("Enter")

}

run().catch(function (error) {
   console.log(error)
})
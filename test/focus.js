const autoChrome = require('..')
const { sleep, logger } = autoChrome.helper

async function run() {

   let chrome = await autoChrome({
      executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/",
      args: ['--start-maximized'],
      // devtools: true,
      // slowMo: 20, // 减速
   })

   await chrome.page.goto('http://www.runoob.com/')

   // await sleep(3000)

   await chrome.page.focus('.search-desktop .placeholder')

   // await chrome.page.goto('http://www.91vps.com/register.asp')

   // await sleep(3000)

   // await chrome.page.focus('#username')

}

run().catch(function (error) {
   console.log(error)
})
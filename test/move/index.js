const autoChrome = require('../../')
const { sleep, logger } = autoChrome.helper


async function run() {

   let chrome = await autoChrome({
      executablePath: "D:/Project/clicker/client/chrome-win32/chrome.exe",
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/",
      args: ['--start-maximized'],
      devtools: false,
      // slowMo: 20, // 减速
   })

   await chrome.page.goto('D:/Nodejs/git-project/auto-chrome/test/move/index.html')

   await sleep(1500)

   await chrome.page.mouse.move(300, 100)

   await chrome.page.mouse.move(600, 600)

   await chrome.page.mouse.click(300, 500)

   await chrome.page.mouse.click(600, 100)

   await chrome.page.mouse.click(1000, 350)


}

run()
const autoChrome = require('..')
const { sleep, signale } = autoChrome.helper

async function run() {

   let chrome = await autoChrome({
      executablePath: "D:/Project/clicker/client/chrome-win32/chrome.exe",
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/",
      args: ['--start-maximized'],
      // devtools: true,
      // slowMo: 20, // 减速
   })

   await chrome.page.goto('http://www.runoob.com/')

   await sleep(3000)

   await chrome.page.type('.search-desktop .placeholder', 'hellow word')

   await sleep(500)

   await chrome.keyboard.press("Enter")

}

run()
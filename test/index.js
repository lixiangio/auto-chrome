const autoChrome = require('..')
const { sleep, logger } = autoChrome.helper

async function run() {

   let chrome = await autoChrome({
      executablePath: "D:/Project/clicker/client/chrome-win32/chrome.exe",
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/",
      args: ['--start-maximized'],
      // devtools: true,
      // slowMo: 20, // 减速
   })

   let page = await chrome.newPage('http://v.baidu.com/')

   let [key1, key2] = chrome.pages.keys()

   console.log(key1)

}

run()
const autoChrome = require('..')
const { sleep, signale } = autoChrome.helper


async function run() {

   let chrome = await autoChrome({
      executablePath: "D:/Project/clicker/client/chrome-win32/chrome.exe",
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/",
      args: ['--start-maximized'],
      devtools: false,
      // slowMo: 20, // 减速
   })

   chrome.on('navigation', page => {
      console.log(page.targetId)
   })

   await chrome.newPage('https://www.baidu.com/')

   await sleep(2000)

   await chrome.newPage('https://www.baidu.com/')

   await sleep(2000)

   await chrome.initPage()

}

run()
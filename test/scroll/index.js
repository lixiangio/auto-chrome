const autoChrome = require('../../')
const { sleep, signale } = autoChrome.helper

/**
 * @param {*} device 用户配置目录名称
 */
async function run() {

   let chrome = await autoChrome({
      executablePath: "D:/Project/clicker/client/chrome-win32/chrome.exe",
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/",
      args: ['--start-maximized'],
      devtools: false,
      // slowMo: 20, // 减速
   })

   await chrome.page.goto('D:/Nodejs/git-project/auto-chrome/test/scroll/index.html')

   await sleep(1000)

   await chrome.mouse.move(300, 300)

   await sleep(1000)

   await chrome.mouse.scroll(0, 500)

   await sleep(1000)

   await chrome.mouse.scroll(0, 300)

   await sleep(1000)

   await chrome.mouse.scroll(0, 700)

   await sleep(1000)

   await chrome.page.scroll('#i2')

   await sleep(1000)

   await chrome.page.scroll('#i1')

   // await chrome.close()

}



run().catch(function (error) {
   console.error(error)
})
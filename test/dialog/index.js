const autoChrome = require('../../');
const { sleep, signale } = autoChrome.helper

/**
 * @param {*} device 用户配置目录名称
 */
async function run() {

   let chrome = await autoChrome({
      executablePath: "D:/Project/clicker/client/chrome-win32/chrome.exe",
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/",
      args: ['--start-maximized'],
      ignoreHTTPSErrors: true, //忽略https错误
      devtools: true,
      headless: false,
   })

   await chrome.page.goto('D:/Nodejs/git-project/auto-chrome/test/dialog/index.html')

   // await chrome.mouse.move(300, 300)

   // await page.evaluate(async function () {

   // })

   // // 触发isTrusted:true click
   // let element = await page.$('#link3')

   // await element.click()

}

run()
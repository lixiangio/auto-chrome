const autoChrome = require('../../lib/')
const { sleep, logger } = require('../helpers')

/**
 * @param {*} device 用户配置目录名称
 */
async function main() {

   let chrome = await autoChrome({
      executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/",
      args: ['--start-maximized'],
      devtools: false,
   })

   let { page } = chrome

   await page.goto('D:/Nodejs/Project/auto-chrome/test/scroll/index.html')

   await sleep(1000)

   await page.mouse.move(300, 300)

   await sleep(1000)

   await page.clicker.scroll(0, 500)

   await sleep(1000)

   await page.clicker.scroll(0, 300)

   await sleep(1000)

   await page.clicker.scroll(0, 700)

   await sleep(1000)

   await page.scroll('#i2')

   await sleep(1000)

   await page.scroll('#i1')

   // await chrome.close()

}



main().catch(function (error) {
   console.error(error)
})
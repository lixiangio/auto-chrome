const puppeteer = require('../../');

const { sleep } = require('../helper.js');

/**
 * @param {*} device 用户配置目录名称
 */
async function run(device = 'Default') {

   let browser = await puppeteer.launch({
      headless: false,
      // devtools: true,
      args: [`--profile-directory=${device}`, '--start-maximized'],
      // executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      // userDataDir: "C:/Users/Xiang/AppData/Local/Google/Chrome Aoto/User Data/"
   })

   let [page] = await browser.pages()

   await page.setViewport({ width: 0, height: 0 })

   await page.goto('D:/Nodejs/git-project/puppeteer-modify/test/scroll/index.html')

   await sleep(1000)

   await browser.close()

   return

   // await page.scroll(0, 520)

   await page.mouse.move(300, 300)

   await sleep(1000)

   await page.mouse.scroll(0, 200)

   await sleep(1000)
   
   await page.$scroll('#i2')

   await sleep(1000)

   await page.$scroll('#i1')

}

run()
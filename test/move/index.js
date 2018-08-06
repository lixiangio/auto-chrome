const puppeteer = require('../../');

const { sleep } = require('../helper.js');

/**
 * 
 * @param {*} device 用户配置目录名称
 */
async function run(device = 'Default') {

   let browser = await puppeteer.launch({
      headless: false,
      // devtools: true,
      args: [`--profile-directory=${device}`, `--start-maximized`],
      // executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      // userDataDir: "C:/Users/Xiang/AppData/Local/Google/Chrome Aoto/User Data/"
   })

   let [page] = await browser.pages()

   await page.setViewport({
      width: 0,
      height: 0,
   })

   await page.goto('D:/Nodejs/git-project/puppeteer-modify/test/move/index.html')

   await sleep(1500)

   // await page.mouse.move(300, 100)

   // await page.mouse.move(600, 600)

   await page.mouse.click(300, 500)

   await page.mouse.click(600, 100)

   await page.mouse.click(1000, 350)


}

run()
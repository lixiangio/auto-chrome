const puppeteer = require('../../');

const { sleep } = require('../helper.js');

/**
 * 
 * @param {*} device 用户配置目录名称
 */
async function run() {

   let browser = await puppeteer.launch({
      headless: false,
      ignoreHTTPSErrors:true,
      // devtools: true,
      args: [`--profile-directory=Default`, '--start-maximized'],
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/"
   })

   let [page] = await browser.pages()

   await page.goto('https://www.szhkch.com/', { timeout: 5000 })

   console.log(999)

}

run()
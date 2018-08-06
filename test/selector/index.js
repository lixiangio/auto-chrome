const puppeteer = require('../../');

const { sleep } = require('../helper.js');

async function run() {

   let browser = await puppeteer.launch({
      headless: false,
      // devtools: true,
      args: ['--start-maximized'],
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data"
   })

   let [page] = await browser.pages()

   await page.goto('https://www.so.com/s?ie=utf-8&fr=none&src=360sou_newhome&q=汽车')

   await sleep(1000)

}

run()
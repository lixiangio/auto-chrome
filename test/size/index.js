const puppeteer = require('../../');

const { sleep } = require('../helper.js');

const { mobile, desktop } = require('../../emulates/');

/**
 * 
 * @param {*} device 用户配置目录名称
 */
async function run() {

   let browser = await puppeteer.launch({
      headless: false,
      // devtools: true,
      // args: [`--start-maximized`],
      // args: [`--start-maximized`]
   })

   let [page] = await browser.pages()

   await page.emulate(mobile[1])

   await sleep(1000)

   await page.goto('https://www.baidu.com')

}

run()
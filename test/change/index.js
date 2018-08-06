const puppeteer = require('../../');

const { sleep } = require('../helper.js');

/**
 * @param {*} device 用户配置目录名称
 */
async function run(device = 'Default') {

   let browser = await puppeteer.launch({
      headless: false,
      devtools: true,
      args: [`--profile-directory=${device}`]
   })

   // dialog滞后于alert，测试不可用
   browser.on('targetchanged', async function (target) {

      let page = await target.page()

      if (page) {
         try {
            await page.evaluateOnNewDocument(function () {
               console.log(888)
            })
         } catch (err) {
            console.log(err)
         }
      }

   })

   let [page] = await browser.pages()

   await sleep(1000)

   await page.goto('https://www.so.com/')

   await page.evaluate(async function () {
      console.log(666)
   })

}

run()
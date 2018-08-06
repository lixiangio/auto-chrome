const puppeteer = require('../../');

const { sleep } = require('../helper.js');

/**
 * @param {*} device 用户配置目录名称
 */
async function run(device = 'Default') {

   let browser = await puppeteer.launch({
      headless: false,
      // devtools: true,
      args: [`--profile-directory=${device}`]
   })

   // dialog滞后于alert，测试不可用
   browser.on('targetcreated', async function (target) {
      let page
      try {
         page = await target.page()
      } catch (err) {
         console.log("浏览器异常关闭")
      }
      if (page) {
         page.on('dialog', async dialog => {
            console.log(999)
            await dialog.dismiss()
         });
      }
   })

   let [page] = await browser.pages()

   await sleep(1000)

   await page.goto('D:/Nodejs/git-project/puppeteer-modify/test/dialog/index.html')

   await page.mouse.move(300, 300)

   await page.evaluate(async function () {

   })

   // 触发isTrusted:true click
   let element = await page.$('#link3')

   await element.click()

}

run()
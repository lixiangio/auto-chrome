const puppeteer = require('../../');

const { sleep } = require('../helper.js');

/**
 * 
 * @param {*} device 用户配置目录名称
 */
async function run() {

   let browser = await puppeteer.launch({
      headless: false,
      devtools: true,
      args: [``]
   })

   let [page] = await browser.pages()

   // await page.setViewport({
   //    width: 0,
   //    height: 0,
   // })

   await sleep(1000)

   await page.goto('D:/Nodejs/git-project/puppeteer-modify/test/click/index.html')

   // 触发isTrusted:false click
   // await page.$eval('#button', element => {
   //    element.click()
   // });

   // 显示隐藏的按钮
   await page.$eval('#button', element => {
      while (element) {
         element = element.parentNode
         if (element && element.style) {
            element.style.display = "block"
         }
      }
   });

   // 触发isTrusted:true click
   await page.click('#button')

}

run()
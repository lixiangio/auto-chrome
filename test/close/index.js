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
      // ignoreHTTPSErrors: true,
      args: [`--profile-directory=${device}`]
   })

   // browser.on('targetcreated', async function (target) {
   //    // let page = await target.page()
   //    console.log(await target.type(), 666)
   // })

   let [page] = await browser.pages()

   await page.goto('D:/Nodejs/git-project/puppeteer-modify/test/close/index.html')

   let pages = await browser.pages()
   
   console.log(pages.length)

   try {
      await page.click('#link')
   } catch (err) {
      console.log("网页加载超时，等待时间超过30s！")
   }

   await sleep(3000)

   pages = await browser.pages()
   
   console.log(pages.length)

   await page.click('.xxx')

   await sleep(1000)

   browser.close()

}

run()
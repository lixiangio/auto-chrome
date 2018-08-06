const puppeteer = require('../../');
const devices = require('../../DeviceDescriptors');
const Chrome = devices['Chrome'];

const { sleep } = require('../helper.js');


/**
 * 
 * @param {*} device 用户配置目录名称
 */
async function run(device = 'Default') {

   let browser = await puppeteer.launch({
      headless: false,
      devtools: true,
      args: [`--profile-directory=${device}`],
      // executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      // userDataDir: "C:/Users/Xiang/AppData/Local/Google/Chrome Aoto/User Data/"
   })

   // 监听打开新标签事件
   browser.on('targetcreated', async function (target) {

      console.log(target.url())

      let page = await target.page()

      if (page) {

         page.on('load', async function () {
            console.log('load')
            // 在网页加载完毕后注入依赖
            await page.evaluate(function () {
               alert('load')
            })
         })

         page.on('dialog', async dialog => {
            await dialog.dismiss()
         });

         // 在dom更新时注入依赖，存在连续触发问题
         // await page.evaluateOnNewDocument(function () {
         //    console.log(12121212)
         //    alert('targetchanged>')
         // })

      }

   })

   // browser.on('targetchanged', async function (target) {
   //    let page = await target.page()
   //    if (page) {
   //       console.log('targetchanged')
   //       await page.evaluateOnNewDocument(function () {
   //          alert('targetchanged>')
   //       })
   //    }
   // })

   let page = await browser.newPage()

   let [initPage] = await browser.pages()

   await initPage.close()

   await page.goto('https://www.baidu.com/')

   await page.click('a[href="https://www.hao123.com"]')

}

run()
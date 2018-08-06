const puppeteer = require('../../');
const devices = require('../../DeviceDescriptors');
const iPhone6 = devices['iPhone 6'];

const { sleep } = require('../helper.js');

async function run() {

   let browser = await puppeteer.launch({
      headless: false,
      // devtools: true,
      args: ['--start-maximized'],
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data"
   })

   // 监听打开新标签事件
   browser.on('targetcreated', async function (target) {
      console.log('targetcreated')
   })

   // 监听标签url变更事件
   // browser.on('targetchanged', async function (target) {
   //    console.log('targetchanged')
   //    let page = await target.page()
   //    if (page) {
   //       // await sleep(100)
   //       // 依赖注入
   //       // await page.evaluate(function () {
   //       //    // document.body.style.backgroundColor = "#3cea5f"
   //       // })
   //    }
   // })

   let [page] = await browser.pages()

   await page.emulate(iPhone6)

   page.on('load', async function (target) {
      console.log('page load')
   })

   await page.goto('https://m.so.com')

   // await sleep(1000)

}

run()
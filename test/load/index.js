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
      args: [`--profile-directory=${device}`],
      // executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      // userDataDir: "C:/Users/Xiang/AppData/Local/Google/Chrome Aoto/User Data/"
   })

   return

   let [page] = await browser.pages()

   // await sleep(1000)

   await page.goto('https://www.baidu.com')

   let count = 0

   page.on("response", async function () {
      console.log(count++)
   })


   // setInterval(() => {

   //    try {
   //       page.type('#head #form #kw', "汽车之家")
   //    } catch (error) {
   //       console.log(error)
   //    }

   // }, 10000);

   await sleep(10000)

   try {
      await page.type('#head #form #kw', "汽车之家")
   } catch (error) {
      console.log(error)
   }

   // let res = await new Promise(function (resolve, reject) {
   //    page.on("load", async function () {
   //       resolve(888)
   //    })
   // })

   // console.log(res)

   // console.log(999)

}

run()
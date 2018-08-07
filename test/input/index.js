const puppeteer = require('../../');

const { sleep } = require('../helper.js');

/**
 * 
 * @param {*} device 用户配置目录名称
 */
module.exports = async function (device = 'Default') {

   let browser = await puppeteer.launch({
      headless: false,
      devtools: true,
      args: [`--profile-directory=${device}`, ' --start-maximized'],
      // executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      // userDataDir: "C:/Users/Xiang/AppData/Local/Google/Chrome Aoto/User Data/"
   })

   let [page] = await browser.pages()

   await page.setViewport({
      width: 0,
      height: 0,
   })

   await sleep(1000)

   await page.goto('D:/Nodejs/git-project/auto-chrome/test/input/index.html')

   await page.type('#kw', "qi'che", { delay: 50 });

   await sleep(100)

   await page.$eval('#kw', (element, keyword) => {
      element.value = keyword;
   }, "汽车");

   // let keyboard = await page.keyboard

   // await keyboard.type('汽车');

}
const puppeteer = require('../../');

const { sleep } = require('../helper.js');


/**
 * 
 * @param {*} device 用户配置目录名称
 */
async function run(device = 'Default') {

   let browser = await puppeteer.launch({
      headless: false,
      args: [`--profile-directory=${device}`],
      // executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      // userDataDir: "C:/Users/Xiang/AppData/Local/Google/Chrome Aoto/User Data/"
   })

   let [page] = await browser.pages()

   await page.setViewport({
      width: 0,
      height: 0,
   })

   let waitForNavigation = page.waitForNavigation()

   // 异步分支
   page.goto('http://news.baidu.com/')

      // 等待导航完成
   await waitForNavigation

   page.click('a[href="https://www.baidu.com/"]')

}

run()
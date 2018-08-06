const puppeteer = require('../../');

const { sleep } = require('../helper.js');

async function run() {

   let browser = await puppeteer.launch({
      headless: false,
      // devtools: true,
      args: ['--start-maximized'],
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data"
   })

   let [page] = await browser.pages()

   await page.setViewport({
      width: 0,
      height: 0,
   })

   await page.goto('D:/Nodejs/git-project/puppeteer-modify/test/click/index.html')

   await page.evaluate(function () {

      window.addEventListener('mousemove', function (ev) {
         let { localName, style } = ev.target
         if (localName === 'li') {
            style.backgroundColor = "#ea3c3c"
            console.log(ev.type)
         }
      })

      window.addEventListener('click', function (ev) {
         let { localName, style } = ev.target
         if (localName === 'li') {
            style.backgroundColor = "#3cea5f"
            console.log(ev.type)
         }
      })

   })

   await sleep(1000)

   await page.mouse.click(500, 300)

   await sleep(1000)

   await page.mouse.click(600, 500)

   await sleep(1000)

   await page.mouse.click(700, 200)

   // await page.mouse.move(500, 300)

}

run()
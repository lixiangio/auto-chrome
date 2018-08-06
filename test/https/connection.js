const puppeteer = require('../../');

const { sleep } = require('../helper.js');

async function run() {

   let browser = await puppeteer.launch({
      headless: false,
      // devtools: true,
      args: [`--profile-directory=Default`, '--start-maximized'],
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/"
   })

   let [page] = await browser.pages()

   await sleep(1000)

   await page.goto('https://www.sohu.com/a/218915569_161207')

   let info = await page.$$eval("body a", async function (elements) {

      let key = Math.round(Math.random() * (elements.length * 0.3))

      let element = tagetElement = elements[key]

      // 迭代到根节点
      while (element) {
         element = element.parentNode
         if (element && element.style) {
            element.style.display = "block"
         }
      }

      let { x, y, width, height } = await window.scrollByElement(tagetElement)

      let { innerText, href } = tagetElement

      return { x, y, width, height, innerText, href };

   })

   console.log(info)

   await page.click('.hot-article .pic-txt')

}

run()
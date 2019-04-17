const autoChrome = require('../../lib/')
const { sleep, logger } = require('../helpers')

async function main() {

   let chrome = await autoChrome({
      executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      userDataDir: userDataDir + 1,
      args: ['--start-maximized'],
      devtools: true,
   })

   let page = await chrome.newPage('https://www.szhkch.com/')

   await page.run(async function () {

      let elements = document.querySelectorAll("body a")

      let key = Math.round(Math.random() * (elements.length * 0.3))

      let element = elements[key]

      if (element) {

         let tagetElement = element

         // 迭代到根节点，将所有父级style.display设为block
         while (element) {
            element = element.parentNode
            if (element && element.style) {
               element.style.display = "block"
            }
         }

         let { x, y, width, height } = await tagetElement.getBoundingClientRect()

         let { innerText, href } = tagetElement

         return { x, y, width, height, innerText, href };

      }

   })

   await sleep(2000)

   await chrome.page.clicker.scroll(0, 500)

   await sleep(1000)

   await page.close()

   await sleep(2000)

   await chrome.close()

}

main().catch(function (error) {
   console.error(error)
})
const autoChrome = require('../../')
const { sleep, signale } = autoChrome.helper

async function run() {

   let chrome = await autoChrome({
      executablePath: "D:/Project/clicker/client/chrome-win32/chrome.exe",
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/",
      args: ['--start-maximized'],
      devtools: false,
      // slowMo: 20, // 减速
   })

   let page = await chrome.newPage('https://www.szhkch.com/')

   // let page = await chrome.newPage('https://www.so.com/')

   // await page.awaitLoading.catch(info => {
   //    signale.warn(info, 999)
   // })

   let data = await page.evaluate(async function () {

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

   console.log(data)

   // await sleep(2000)

   // await chrome.mouse.scroll(0, 500)

   // await sleep(1000)

   // await page.close()

   // await sleep(2000)

   // await chrome.close()

}

run().catch(function (error) {
   console.error(error)
})
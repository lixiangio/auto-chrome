const autoChrome = require('../')
const devices = require('../device')

const { sleep, logger } = autoChrome.helper

const { userAgent, viewport, isTouch } = devices['iPhone 6'];

async function main() {

   let chrome = await autoChrome({
      executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/",
      // devtools: true,
      args: [
         `--user-agent=${userAgent}`,
         '--start-maximized'
      ],
      emulate: {
         isTouch,
         viewport,
      }
   })

   let page = chrome.page

   await page.goto('https://m.so.com/')

   await sleep(1000)

   let element = await page.click('#q')

   await sleep(1000)

   await element.type('汽车')

   // 触发加载
   await page.keyboard.press("Enter")

   // let elements = document.querySelectorAll($items)

   // let sort = 0

   // 遍历匹配url位置
   // for (let element of elements) {

   //    sort++
   //    if (element.outerHTML.indexOf(url) >= 0) {
   //       element.sort = sort
   //       return element
   //    }

   // }

   // // 找不到目标时随机选择element
   // sort = 1 + Math.round(Math.random() * elements.length)

   // return elements

   // await sleep(3000)

   let result = await page.run((url, $items) => {
      return document
   }, 'm.autohome.com.cn', `#main > .r-results > div[data-page='1'] > a`)

   console.log(result)

}

main()
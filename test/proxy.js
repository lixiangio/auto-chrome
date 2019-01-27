"use strict"

const autoChrome = require('..')
const devices = require('../device')

const { userAgent, viewport } = devices['iPhone 6']

async function main() {

   let chrome = await autoChrome({
      executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/",
      // devtools: true,
      args: [
         `--user-agent=${userAgent}`,
         '--start-maximized',
         '--proxy-server=113.110.194.28:10306'
      ],
      emulate: {
         viewport,
      }
   })

   let page = chrome.page

   await page.goto('https://m.so.com/')

   let element = await page.click('#q')

   await element.type('ip')

   // 回车，触发并等待导航结束
   await page.enter()

   let result = await page.run((url, $items) => {

      let elements = document.querySelectorAll($items)

      let sort = 0

      // 遍历匹配url位置
      for (let element of elements) {

         sort++
         if (element.outerHTML.indexOf(url) >= 0) {
            element.sort = sort
            return element
         }

      }

      // 找不到目标时随机选择element
      sort = 1 + Math.round(Math.random() * elements.length)

      return elements

   }, 'm.autohome.com.cn', `#main > .r-results > div[data-page='1'] > a`)

   console.log(result)

}

main()
"use strict"

const autoChrome = require('../')
const devices = require('../device')
const { sleep, logger } = require('./helpers')

const { userAgent, viewport, isTouch } = devices['iPhone 6'];

async function main() {

   let chrome = await autoChrome({
      executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/",
      devtools: true,
      args: [
         `--user-agent=${userAgent}`,
         '--start-maximized'
      ],
      emulate: {
         isTouch,
         viewport,
      }
   })

   let page = await chrome.page

   await page.goto('https://m.so.com/')

   await sleep(1000)

   let result = await page.run(function (url, selecte) {
      console.log(url)
      console.log(selecte)
      return document
   }, 'm.autohome.com.cn', `#main > .r-results > div[data-page='1'] > a`)

   console.log(result)

   let element = await page.$('#q')

   await element.click()

}

main()
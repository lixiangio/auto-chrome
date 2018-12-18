"use strict"

const autoChrome = require('..')
const devices = require('../device')

const { userAgent, viewport, isTouch } = devices['iPhone 6']

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

   let { page } = chrome

   await page.goto('https://m.so.com/')

   let element = await page.click('#q')

   await element.type('ip')

   // 回车，触发并等待导航结束
   await page.enter()

}

main()
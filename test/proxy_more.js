"use strict"

const cluster = require('cluster');

if (cluster.isMaster) {

   for (let i = 0; i < 3; i++) {
      cluster.fork({ cid: i });
   }

} else {

   const autoChrome = require('..')
   const devices = require('../device')

   const { userAgent, viewport } = devices['Chrome']

   async function main() {

      let chrome = await autoChrome({
         executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
         userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/",
         // devtools: true,
         args: [
            `--user-agent=${userAgent}`,
            '--start-maximized',
            '--no-service-autorun'
            // '--proxy-server=116.249.188.142:28359'
         ],
         emulate: {
            viewport,
         }
      })

      // let page = chrome.page

      // await page.goto('https://www.so.com/')

      // let element = await page.click('#input')

      // await element.type('ip')

      // // 回车，触发并等待导航结束
      // await page.enter()

   }

   main().catch(function (error) {
      console.log(error)
   })

}
"use strict"

const cluster = require('cluster');

if (cluster.isMaster) {

   for (let i = 0; i < 3; i++) {
      cluster.fork({ cid: i });
   }

} else {

   const autoChrome = require('../lib/')
   const devices = require('../device.js')
   const { executablePath, userDataDir } = require('./config.js');
   const { userAgent, viewport } = devices['Chrome']

   async function main() {

      const chrome = await autoChrome({
         executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
         userDataDir: userDataDir + 1,
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
"use strict"

const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {

   for (let i = 0; i < 2; i++) {

      cluster.fork();
      
   }

} else {

   const { worker: { id } } = cluster

   const autoChrome = require('..')
   const devices = require('../device')
   const config = require('./helpers/config')
   const { sleep } = require('./helpers')

   const { executablePath } = config

   const { userAgent, viewport } = devices['iPhone 6']

   async function main() {

      let chrome = await autoChrome({
         executablePath,
         // userDataDir: `C:/Users/Administrator/AppData/Local/Google/Chrome/User Data${cid}/`,
         userDataDir: `C:/Users/Xiang/AppData/Local/Chromium/User Data${id}/`,
         args: [
            `--user-agent=${userAgent}`,
            '--start-maximized',
            // '--enable-touchview',
            // '--enabled',
            // '--force-device-scale-factor=1.25',
         ],
         emulate: {
            // geolocation: {
            //    longitude: 114.2916402075,
            //    latitude: 22.6088954693,
            //    accuracy: 14
            // },
            viewport
         },
         // devtools: true,
      })

      await chrome.page.goto('https://m.baidu.com/')

      await sleep(2000)

      await chrome.page.click('#index-kw')
      
      return

      await sleep(500)

      await chrome.page.keyboard.type('汽车')

      await sleep(500)

      await chrome.keyboard.press("Enter")

      await sleep(2000)

      let elments = await chrome.page.$$('#results .c-result')

      let elment = elments[6]

      await elment.scroll()

      await sleep(1000)

      await elment.click()

      // await elment.evaluate({
      //    func: (element) => {
      //       element.style.border = "1px solid #ed0000"
      //    },
      // })

      await sleep(1500)

      await await chrome.page.prev()

      await sleep(1500)

      await await chrome.page.next()

      await sleep(1500)

      await chrome.page.click('.athm-tab1st__assist a:nth-child(1)')

      await sleep(2000)

      await chrome.page.click('.athm-tab1st__assist a:nth-child(2)')

      await sleep(2000)

      await chrome.page.click('.athm-tab1st__assist a:nth-child(3)')

      await sleep(2000)

      await await chrome.page.prev()

      await sleep(2000)

      await await chrome.page.prev()

      // await sleep(1500)

      // await await chrome.page.prev()

   }

   main().catch(function (error) {
      console.log(error)
   })

}
"use strict"

const autoChrome = require('../lib/')
const devices = require('../device.js')
const config = require('./config.js')
const { sleep } = require('./helpers/')

const { executablePath, userDataDir } = config

const { userAgent, viewport } = devices['iPhone 6']

async function main() {

   let chrome = await autoChrome({
      executablePath,
      userDataDir,
      args: [
         `https://m.baidu.com`,
         `--new-window`,
         `--user-agent=${userAgent}`,
         '--start-maximized'
      ],
      emulate: {
         geolocation: {
            longitude: 114.2916402075,
            latitude: 22.6088954693,
            accuracy: 14
         },
         viewport
      },
      // devtools: true,
   })

   // await chrome.newPage('https://m.baidu.com/')

   await sleep(1000)

   await chrome.page.click('#index-kw')

   await sleep(500)

   await chrome.page.keyboard.type('汽车')

   await sleep(500)

   await chrome.keyboard.press("Enter")

   // await chrome.page.close()

}

main().catch(function (error) {
   console.log(error)
})

// main().catch(function (error) {
//    console.log(error)
// })
"use strict"

/**
 * 除了默认的BrowserContext外，通过createBrowserContext创建的BrowserContext仅支持隐身模式
 */

const autoChrome = require('../lib/');
const devices = require('../device.js');
const config = require('./config.js');
const { sleep } = require('./helpers');

const { executablePath, userDataDir } = config

const { userAgent, viewport } = devices['iPhone 6']

async function main() {

   const chrome = await autoChrome({
      executablePath,
      userDataDir,
      args: [
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

   let BrowserContext = await chrome.createBrowserContext()

   console.log(BrowserContext)

   await chrome.newPage('https://m.baidu.com/', BrowserContext.browserContextId)

   BrowserContext = await chrome.createBrowserContext()

   console.log(BrowserContext)

   await chrome.newPage('https://m.so.com/',  BrowserContext.browserContextId)

   // await sleep(1000)

   // await chrome.page.click('#index-kw')

   // await sleep(500)

   // await chrome.page.keyboard.type('汽车')

   // await sleep(500)

   // await chrome.keyboard.press("Enter")

   // await chrome.page.close()

}

main().catch(function (error) {
   console.log(error)
})
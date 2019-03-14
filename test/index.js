"use strict"

const autoChrome = require('..')
const devices = require('../device')
const config = require('./helpers/config')

const { executablePath, userDataDir } = config

const { userAgent, viewport } = devices['iPhone 6']

async function main() {

   let chrome = await autoChrome({
      executablePath,
      userDataDir,
      args: [
         `--user-agent=${userAgent}`,
         '--start-maximized',
         '--force-device-scale-factor=1.25',
      ],
      emulate: {
         geolocation: {
            longitude: 114.2916402075,
            latitude: 22.6088954693,
            accuracy: 14
         },
         viewport
      },
      loadTimeout: 6000,
      // devtools: true,
   })

   await chrome.newPage('https://m.baidu.com/')

   await chrome.page.click('#index-kw')

   await chrome.page.keyboard.type('汽车')

   await chrome.keyboard.press("Enter")

   // await chrome.page.close()

}

main().catch(function (error) {
   console.log(error)
})
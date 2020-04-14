"use strict"

const autoChrome = require('../../lib')
const { executablePath, userDataDir } = require('../config.js');
const devices = require('../../device.js')

const { userAgent, viewport } = devices['Chrome 1920'];

async function main() {

   const chrome = await autoChrome({
      executablePath,
      userDataDir,
      args: [
         `--user-agent=${userAgent}`,
         '--start-maximized',
      ],
      emulate: {
         geolocation: {
            longitude: 114.2916402075,
            latitude: 22.6088954693,
            accuracy: 14
         },
         viewport,
      },
      // devtools: true,
   })

   // await chrome.newPage('http://cn.screenresolution.org/')

   await chrome.newPage('http://www.baidu.com/')

   const data = await chrome.page.run(() => {

      return JSON.stringify({
         "window.screen.height": window.screen.height,
         "window.screen.availHeight": window.screen.availHeight,
         "window.innerHeight": window.innerHeight,
         "window.screen.width": window.screen.width,
         "window.screen.availWidth": window.screen.availWidth,
         "window.innerWidth": window.innerWidth,
      })

   })

   console.log(JSON.parse(data.value));

}

main();
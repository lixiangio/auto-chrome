"use strict";

const autoChrome = require('../../lib')
const { executablePath,userDataDir } = require('../config.js');
const devices = require('../../device.js');

let { userAgent, viewport } = devices['iPhone 6'];

const { width, height } = viewport

async function main() {

   const chrome = await autoChrome({
      executablePath,
      userDataDir,
      args: [
         // `--profile-directory=Default`, 
         `--user-agent=${userAgent}`,
         '--start-maximized',
         // `--window-position=0,0`,
         // `--window-size=${width}, ${height}`
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

   await chrome.newPage('https://map.baidu.com/mobile/webapp/index/index/')

}

main()
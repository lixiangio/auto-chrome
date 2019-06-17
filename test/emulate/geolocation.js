"use strict";

const autoChrome = require('../../lib')
const { userDataDir } = require('../config.js');
const devices = require('../../device.js');

const { userAgent, viewport } = devices['iPhone 6'];

async function main() {
   
   const chrome = await autoChrome({
      executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      userDataDir: userDataDir + 1,
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
         viewport
      }
   })

   await chrome.newPage('https://map.baidu.com/mobile/webapp/index/index/');
   
}

main()
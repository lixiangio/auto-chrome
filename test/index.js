"use strict";

const autoChrome = require('../lib/');
const devices = require('../device.js');
const config = require('./config.js');
const { sleep } = require('./helpers/');

const { executablePath, userDataDir } = config;

const { userAgent, viewport } = devices['iPhone 6'];

async function main() {

   const chrome = await autoChrome({
      executablePath,
      userDataDir: userDataDir + 1,
      args: [
         `--user-agent=${userAgent}`,
         '--start-maximized',
         // '--force-device-scale-factor=1.25',
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

   // await chrome.page.goto('https://m.baidu.com/');

   await chrome.newPage('https://m.baidu.com/');

   await chrome.page.click('#index-kw');

   await chrome.page.keyboard.type('汽车');

   await chrome.keyboard.press("Enter");

   await sleep(1000);

   // await chrome.close();

}

main().catch(function (error) {

   console.log(error);

})
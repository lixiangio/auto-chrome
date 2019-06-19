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
      // devtools: true,
   })

   // await chrome.page.goto('https://m.baidu.com/');

   const page = await chrome.newPage('https://m.baidu.com/');

   await page.click('#index-kw');

   await page.keyboard.type('汽车');

   await page.enter();

   await sleep(1000);

   const element = await page.scroll("#page-controller .new-nextpage-only, #page-controller .new-nextpage");

   await element.click();

   // await chrome.close();

}

main().catch(function (error) {

   console.log(error);

})
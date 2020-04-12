"use strict";

const autoChrome = require('../')
const devices = require('../device.js')
const { executablePath, userDataDir } = require('./config.js');
const { sleep } = require('./helpers')

const { userAgent, viewport } = devices['iPhone 6'];

async function main() {

   const chrome = await autoChrome({
      executablePath,
      userDataDir: userDataDir + 1,
      // devtools: true,
      args: [
         'https://m.so.com/',
         `--user-agent=${userAgent}`,
         '--start-maximized',
         // '--force-device-scale-factor=1.25',
      ],
      emulate: {
         viewport,
      }
   })

   const page = chrome.page;

   const result = await page.run(function (url, selecte) {
      return document
   }, 'm.autohome.com.cn', `#main > .r-results > div[data-page='1'] > a`)

   console.log(result);

   const element = await page.$('#q');

   await element.click();

}

main();
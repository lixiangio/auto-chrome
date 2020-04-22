"use strict";

const autoChrome = require('../')
const devices = require('../device.js')
const { executablePath, userDataDir } = require('./config.js');
const { sleep } = require('./helpers')

const { userAgent, viewport } = devices['iPhone 6'];

async function main() {

   const chrome = await autoChrome({
      executablePath,
      userDataDir,
      // devtools: true,
      args: [
         'https://m.so.com/',
         `--user-agent=${userAgent}`,
         '--start-maximized',
         // '--force-device-scale-factor=1.25',
      ],
      emulate: {
         viewport,
      },
      devtools: true,
   })

   const page = chrome.page;

   const result = await page.run(function (element, selecte) {
      console.log(selecte)
      return JSON.stringify({
         a: 1,
         b: 2
      })
   }, 'm.autohome.com.cn', `#main > .r-results > div[data-page='1'] > a`)

   console.log(result);

   const element = await page.$('#q');

   await element.click();

}

main();
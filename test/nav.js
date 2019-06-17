"use strict"

const autoChrome = require('../lib/');
const devices = require('../device.js');
const config = require('./config.js');
const { sleep } = require('./helpers');

const { executablePath, userDataDir } = config;

const { userAgent, viewport } = devices['iPhone 6'];

async function main() {

   const chrome = await autoChrome({
      executablePath,
      userDataDir: userDataDir + 1,
      args: [
         'https://www.baidu.com/',
         `--user-agent=${userAgent}`,
         // '--start-maximized',
         // '--enable-touchview',
         // '--enabled',
         // '--force-device-scale-factor=1.25'
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

   await chrome.page.click('#index-kw')

   await sleep(500)

   await chrome.page.keyboard.type('汽车')

   await sleep(500)

   await chrome.keyboard.press("Enter")

   await sleep(2000)

   const elments = await chrome.page.$$('#results .c-result')

   const elment = elments[6];

   await elment.scroll()

   await sleep(1000)

   await elment.clickNav()

   // await elment.evaluate({
   //    func: (element) => {
   //       element.style.border = "1px solid #ed0000"
   //    },
   // })

   await sleep(1500)

   await await chrome.page.prev();

   await sleep(1500)

   await await chrome.page.next();

   await sleep(1500)

   await chrome.page.clickNav('.athm-tab1st__assist a:nth-child(1)');

   await sleep(2000)

   await chrome.page.clickNav('.athm-tab1st__assist a:nth-child(2)');

   await sleep(2000)

   await chrome.page.clickNav('.athm-tab1st__assist a:nth-child(3)');

   await sleep(2000)

   await await chrome.page.prev();

   await sleep(2000)

   await await chrome.page.prev();

   await sleep(1500)

   await await chrome.page.prev();

}

main().catch(function (error) {
   console.log(error);
})
"use strict"

const autoChrome = require('../')
const devices = require('../device.js')
const { sleep } = require('./helpers')

const { userAgent, viewport } = devices['iPhone 6'];

async function main() {

   let chrome = await autoChrome({
      executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/",
      // devtools: true,
      args: [
         'https://m.so.com/',
         `--user-agent=${userAgent}`,
         '--start-maximized',
         '--force-device-scale-factor=1.25',
      ],
      emulate: {
         viewport,
      }
   })

   let page = chrome.page;

   let result = await page.run(function (url, selecte) {
      return document
   }, 'm.autohome.com.cn', `#main > .r-results > div[data-page='1'] > a`)

   console.log(result);

   let element = await page.$('#q');

   await element.click();

}

main();
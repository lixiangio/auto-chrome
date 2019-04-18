"use strict";

const autoChrome = require('../lib/');
const devices = require('../device.js');
const { executablePath, userDataDir } = require('./config.js');
const { userAgent, viewport } = devices['iPhone 6'];

async function main() {

   let chrome = await autoChrome({
      executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      userDataDir: userDataDir + 1,
      // devtools: true,
      args: [
         `--user-agent=${userAgent}`,
         '--start-maximized',
         '--proxy-server=58.218.200.227:17322',
         '--force-device-scale-factor=1.25',
      ],
      emulate: {
         viewport,
      }
   })

   let page = chrome.page

   await page.goto('https://m.so.com/')

   return;

   let element = await page.click('#q')

   await element.type('ip')

   // 回车，触发并等待导航结束
   await page.enter()

}

main()
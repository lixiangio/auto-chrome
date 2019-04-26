"use strict";

const autoChrome = require('../lib/');
const devices = require('../device.js');
const { executablePath, userDataDir } = require('./config.js');
const { userAgent, viewport } = devices['iPhone 6'];

async function main() {

   let chrome = await autoChrome({
      executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      userDataDir: userDataDir + 3,
      // devtools: true,
      args: [
         `--user-agent=${userAgent}`,
         '--start-maximized',
         '--proxy-server=113.121.178.186:40278',
         '--force-device-scale-factor=1.25',
      ],
      emulate: {
         viewport,
      }
   })

   await chrome.newPage('https://m.baidu.com/')

   let page = chrome.page;

   return;

   let element = await page.click('#q')

   await element.type('ip')

   // 回车，触发并等待导航结束
   await page.enter()

}

main()
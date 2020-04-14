"use strict";

const autoChrome = require('../lib/');
const devices = require('../device.js');
const { executablePath, userDataDir } = require('./config.js');

async function main() {

   const chrome = await autoChrome({
      executablePath,
      userDataDir: userDataDir + 3,
      // devtools: true,
      args: [
         '--start-maximized',
         '--proxy-server=127.0.0.1:1337',
      ],
   })

   await chrome.newPage('https://www.baidu.com/s?ie=UTF-8&wd=ip');

   const page = chrome.page;

   const element = await page.click('#q')

   await element.type('ip')

   // 回车，触发并等待导航结束
   await page.enter()

}

main()
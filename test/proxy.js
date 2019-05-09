"use strict";

const autoChrome = require('../lib/');
const devices = require('../device.js');
const { executablePath, userDataDir } = require('./config.js');

async function main() {

   let chrome = await autoChrome({
      executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      userDataDir: userDataDir + 3,
      // devtools: true,
      args: [
         '--start-maximized',
         '--proxy-server=119.116.97.98:4358',
      ],
   })

   await chrome.newPage('https://www.baidu.com/s?ie=UTF-8&wd=ip');

   let page = chrome.page;

   return;

   let element = await page.click('#q')

   await element.type('ip')

   // 回车，触发并等待导航结束
   await page.enter()

}

main()
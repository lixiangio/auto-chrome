"use strict"

const autoChrome = require('../lib/')
const devices = require('../device.js')
const { executablePath, userDataDir } = require('./config.js');

const { userAgent, viewport } = devices['iPhone 6']

async function main() {

   const chrome = await autoChrome({
      executablePath,
      userDataDir,
      // devtools: true,
      args: [
         `--user-agent=${userAgent}`,
         '--start-maximized'
      ],
      emulate: {
         viewport,
      }
   })

   await chrome.newPage('https://www.baidu.com')

   await chrome.newPage('https://www.so.com')

   await chrome.newPage('https://www.sogou.com')

   const { page } = chrome;

   await page.goto('https://m.so.com/')

   const element = await page.click('#q')

   await element.type('ip')

   // 回车，触发并等待导航结束
   await page.enter();

   await chrome.initPage();

}

main()
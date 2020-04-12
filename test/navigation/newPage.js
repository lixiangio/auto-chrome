"use strict"

const autoChrome = require('../../lib/')
const { executablePath, userDataDir } = require('../config.js');
const { sleep } = require('../helpers/')

async function main() {

   let chrome = await autoChrome({
      executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      userDataDir: userDataDir + 1,
      args: ['--start-maximized'],
      // devtools: true,
   })

   await chrome.page.goto('http://www.runoob.com/')

   console.log('-----------------')

   let element = await chrome.page.$('.runoob-block dl dd:nth-child(2) a')

   await element.scroll();

   await element.clickNav();

   console.log('-----------------')

   element = await chrome.page.$('.runoob-block dl dd:nth-child(3) a')

   console.log("element", !!element);

   await element.scroll();

   await element.clickNav();

   console.log('-----------------')

   element = await chrome.page.$('.runoob-block dl dd:nth-child(4) a')

   await element.scroll()

   await element.clickNav()

   console.log('-----------------')

   element = await chrome.page.$('.runoob-block dl dd:nth-child(5) a')

   await element.scroll()

   await element.clickNav()

}

main()
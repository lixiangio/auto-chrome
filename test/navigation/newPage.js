"use strict"

const autoChrome = require('../../lib/')
const { executablePath, userDataDir } = require('../config.js');
const { sleep } = require('../helpers/')

async function main() {

   const chrome = await autoChrome({
      executablePath,
      userDataDir,
      args: ['--start-maximized'],
      // devtools: true,
   })

   await chrome.newPage('http://www.runoob.com/');

   console.log('-----------------')

   const element = await chrome.page.$('.runoob-block dl dd:nth-child(2) a')

   await element.scroll();

   await element.clickNav();

   console.log('-----------------')

   const element2 = await chrome.page.$('.runoob-block dl dd:nth-child(3) a')

   console.log("element", !!element2);

   await element2.scroll();

   await element2.clickNav();

   console.log('-----------------')

   const element3 = await chrome.page.$('.runoob-block dl dd:nth-child(4) a')

   await element3.scroll();

   await element3.clickNav();

   console.log('-----------------')

   const element4 = await chrome.page.$('.runoob-block dl dd:nth-child(5) a')

   await element4.scroll();

   await element4.clickNav();

}

main()
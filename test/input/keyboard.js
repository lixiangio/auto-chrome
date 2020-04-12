"use strict"

const autoChrome = require('../../lib/')
const { executablePath, userDataDir } = require('../config.js');
const { sleep } = require('../helpers/')

async function main() {

   const chrome = await autoChrome({
      executablePath,
      userDataDir: userDataDir + 1,
      args: ['--start-maximized'],
      // devtools: true,
   })

   const page = chrome.page;

   await page.goto('http://www.runoob.com/');

   await sleep(1000);

   const element = await page.$('.search-desktop .placeholder');

   await element.scroll();

   await element.click();

   await element.type('hellow word')

   await sleep(500)

   await page.keyboard.press("Enter")

}

main().catch(function (error) {
   console.log(error)
})
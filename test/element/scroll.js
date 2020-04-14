"use strict";

const autoChrome = require('../../lib');
const { executablePath, userDataDir } = require('../config.js');
const { sleep } = require('../helpers/');

async function main() {

   const chrome = await autoChrome({
      executablePath,
      userDataDir,
      args: ['--start-maximized'],
      devtools: false,
   });

   await chrome.page.goto('http://www.runoob.com/');

   await sleep(2000);

   const element = await chrome.page.$('#footer');

   // console.log(element)

   await element.scroll();

}

main();
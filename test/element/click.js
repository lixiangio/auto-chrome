"use strict"

const autoChrome = require('../../lib')
const { userDataDir } = require('../config.js');
const { sleep } = require('../helpers/')

async function main() {

   const chrome = await autoChrome({
      executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      userDataDir: userDataDir + 1,
      args: ['--start-maximized'],
      devtools: false,
   })

   await chrome.page.goto('https://www.so.com/');

   const nav = await chrome.page.$$('#header nav > a');

   const [, , , element] = nav;

   await element.click()

}

main()
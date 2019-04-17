"use strict";

const autoChrome = require('../../lib/');
const { sleep } = require('../helpers/');

async function main() {

   let chrome = await autoChrome({
      executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      userDataDir: userDataDir + 1,
      args: ['--start-maximized'],
      devtools: true,
   })

   let { page } = chrome

   page.goto('D:/Nodejs/Project/auto-chrome/test/move/index.html')

   await sleep(1500)

   await page.clicker.move(300, 100)

   await page.clicker.move(600, 600)

   await page.clicker.click(300, 500)

   await page.clicker.click(600, 100)

   await page.clicker.click(1000, 350)

}

main()
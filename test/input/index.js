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

   await chrome.page.goto('https://www.so.com/')

   await sleep(1000)

   await chrome.page.type('#input', 'hellow word')

   await sleep(500)

   await chrome.keyboard.press("Enter")

}

main()
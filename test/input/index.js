"use strict"

const autoChrome = require('../../lib/')
const { executablePath, userDataDir } = require('../config.js');
const { sleep } = require('../helpers/')


async function main() {

   let chrome = await autoChrome({
      executablePath,
      userDataDir: userDataDir + 1,
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
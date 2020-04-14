"use strict"

const autoChrome = require('../../lib')
const { executablePath, userDataDir } = require('../config.js');
const { sleep } = require('../helpers/')

async function main() {

   const chrome = await autoChrome({
      executablePath,
      userDataDir,
      args: ['--start-maximized'],
      devtools: false,
   })

   // http
   await chrome.page.goto('http://nodejs.cn/')

   let element1 = await chrome.page.$('#logo img')

   let boundingRect1 = await element1.getBoundingRect()

   console.log(boundingRect1)

   // https
   await chrome.page.goto('https://www.so.com/')

   let element2 = await chrome.page.$('#bd_logo')

   let boundingRect2 = await element2.getBoundingRect()

   console.log(boundingRect2)

}

main()
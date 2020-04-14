"use strict"

const autoChrome = require('../../lib/')
const { executablePath, userDataDir } = require('../config.js');
const { sleep } = require('../helpers/')

async function main() {

   const chrome = await autoChrome({
      executablePath,
      userDataDir,
      args: ['--start-maximized'],
      devtools: true,
   })

   const page = chrome.page

   await chrome.page.goto('D:/Nodejs/Project/auto-chrome/test/input/touch.html')

   await sleep(1000)

   const element = await page.$('input')

   await element.click()

   await element.type('hellow你好吗')

}

main().catch(function (error) {
   console.log(error)
})
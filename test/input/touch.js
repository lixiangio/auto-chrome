"use strict"

const autoChrome = require('../../lib/')
const { executablePath, userDataDir } = require('../config.js');
const { sleep } = require('../helpers/')

async function main() {

   let chrome = await autoChrome({
      executablePath,
      userDataDir,
      args: ['--start-maximized'],
      devtools: true,
   })

   let page = chrome.page

   await chrome.page.goto('D:/Nodejs/Project/auto-chrome/test/input/touch.html')

   await sleep(1000)

   let input = await page.$('input')

   await input.click()

   await input.type('hellow你好吗')

}

main().catch(function (error) {
   console.log(error)
})
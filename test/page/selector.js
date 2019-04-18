"use strict"

const autoChrome = require('../../lib/')
const { executablePath, userDataDir } = require('../config.js');
const { sleep } = require('../helpers/')

async function main() {

   let chrome = await autoChrome({
      executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      userDataDir: userDataDir + 1,
      args: ['--start-maximized'],
      devtools: false,
   })

   await chrome.page.goto('https://www.so.com/')

   await sleep(3000)

   let $ = await chrome.page.$('.login, #input')

   console.log(!!$)

   let $$ = await chrome.page.$$('.login, #input')

   console.log($$.length)

}

main()
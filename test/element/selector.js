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

   await chrome.page.goto('https://www.so.com/')

   await sleep(3000)

   // let body = await chrome.page.$('body')

   // let header = await body.$('#header')

   // let nav = await header.$$('nav > a')

   let nav = await chrome.page.$$('#header nav > a')

   let [, , element] = nav

   let innerText = await element.get('innerText')

   console.log(innerText)

}

main()
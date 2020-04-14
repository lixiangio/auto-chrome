"use strict"

const autoChrome = require('../lib/')
const { executablePath, userDataDir } = require('./config.js');

async function main() {

   const chrome = await autoChrome({
      executablePath,
      userDataDir,
      args: ['--start-maximized'],
      // devtools: true,
   })

   return

   await chrome.page.goto('http://www.runoob.com/')

   await chrome.page.focus('.search-desktop .placeholder')

}

main().catch(function (error) {
   console.log(error)
})
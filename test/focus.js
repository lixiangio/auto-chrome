"use strict"

const autoChrome = require('../lib/')

async function main() {

   let chrome = await autoChrome({
      executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      userDataDir: userDataDir + 1,
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
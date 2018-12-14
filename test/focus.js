"use strict"

const autoChrome = require('..')

async function main() {

   let chrome = await autoChrome({
      executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/",
      args: ['--start-maximized'],
      // devtools: true,
      // slowMo: 20, // 减速
   })

   return

   await chrome.page.goto('http://www.runoob.com/')

   await chrome.page.focus('.search-desktop .placeholder')

}

main().catch(function (error) {
   console.log(error)
})
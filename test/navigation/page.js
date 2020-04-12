"use strict"

const autoChrome = require('../../lib/')
const { executablePath, userDataDir } = require('../config.js');
const { sleep } = require('../helpers/')

async function main() {

   const chrome = await autoChrome({
      executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      userDataDir: userDataDir + 1,
      args: ['--start-maximized'],
      devtools: false,
   })

   await chrome.page.goto('http://www.runoob.com/html/html-tutorial.html')

   await chrome.page.clickNav('.pc-nav li:nth-child(3) a')

   await chrome.page.clickNav('.pc-nav li:nth-child(4) a')

   await chrome.page.clickNav('.pc-nav li:nth-child(5) a')

   await chrome.page.clickNav('.pc-nav li:nth-child(6) a')

   await chrome.page.clickNav('.pc-nav li:nth-child(7) a')

   await chrome.page.clickNav('.pc-nav li:nth-child(8) a')

   await chrome.page.clickNav('.pc-nav li:nth-child(9) a')

   await chrome.page.clickNav('.pc-nav li:nth-child(10) a')

   await chrome.close()

}

main()
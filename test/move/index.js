"use strict"

const autoChrome = require('../../')

const { sleep } = require('../helpers')


async function main() {

   let chrome = await autoChrome({
      executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/",
      args: ['--start-maximized'],
      devtools: false,
      // slowMo: 20, // 减速
   })

   await chrome.page.goto('D:/Nodejs/Project/auto-chrome/test/move/index.html')

   await sleep(1500)

   await chrome.clicker.move(300, 100)

   await chrome.clicker.move(600, 600)

   await chrome.clicker.click(300, 500)

   await chrome.clicker.click(600, 100)

   await chrome.clicker.click(1000, 350)

}

main()
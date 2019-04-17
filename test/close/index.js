"use strict"

const autoChrome = require('../../lib/')
const { sleep } = require('../helpers')

async function main() {

   let chrome = await autoChrome({
      executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      userDataDir: userDataDir + 1,
      args: ['--start-maximized'],
      devtools: false,
   })

   let page1 = await chrome.newPage('https://www.so.com/')

   await sleep(1000)

   let page2 = await chrome.newPage('https://www.baidu.com/')

   await sleep(2000)

   await page2.close()

   await sleep(4000)

   await chrome.page.goto('https://www.szhkch.com/')

   await sleep(2000)

   await page1.close()

   await sleep(3000)

   await chrome.close()

}

main()
"use strict"

const autoChrome = require('../../lib/')
const { userDataDir } = require('../config.js');
const { sleep } = require('../helpers/')

async function main() {

   const chrome = await autoChrome({
      executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      userDataDir: userDataDir + 1,
      args: ['--start-maximized'],
      devtools: false,
   })

   const page1 = await chrome.newPage('https://www.so.com/')

   await sleep(1000)

   // let page2 = await chrome.newPage('https://www.baidu.com/')

   // await sleep(2000)

   // await page2.close()

   // await sleep(4000)

   await chrome.page.goto('https://mirrors.aliyun.com/ubuntukylin/ubuntukylin-19.04-enhanced-amd64.iso')

   // await sleep(2000)

   // await page1.close()

   await sleep(30000)

   await chrome.close()

}

main()
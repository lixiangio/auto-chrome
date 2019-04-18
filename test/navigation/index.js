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

   let page = await chrome.newPage('https://www.baidu.com/')

   await page.goto('https://www.baidu.com/')

   let el = await page.$('#head')

   console.log(page.contextId)

   console.log(el.objectId)

   el = await page.$('a')

   console.log(el.objectId)

   el = await page.$('#kw')

   console.log(el.objectId)

   return

   await page.goto('http://v.baidu.com/')

   await page.click('xxx')

   await page.goto('https://www.hao123.com/')

   await page.click('xxx')

   await page.goto('https://cn.vuejs.org/')

   await page.click('xxx')

   await page.goto('http://johnny-five.io/')

   await page.click('xxx')
   
   await page.goto('https://github.com/')

   await page.goto('https://www.hao123.com/')

   await page.click('a[href="https://www.hao123.com"]')

}

main()
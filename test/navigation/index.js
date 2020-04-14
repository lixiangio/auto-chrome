"use strict"

const autoChrome = require('../../lib/')
const { executablePath, userDataDir } = require('../config.js');
const { sleep } = require('../helpers/')

async function main() {

   const chrome = await autoChrome({
      executablePath,
      userDataDir,
      args: ['--start-maximized'],
      devtools: false,
   })

   const page = await chrome.newPage('https://www.baidu.com/')

   await page.goto('https://www.baidu.com/')

   const head = await page.$('#head')

   console.log(page.contextId)

   console.log(head.objectId)

   const a = await page.$('a')

   console.log(a.objectId)

   const kw = await page.$('#kw')

   console.log(kw.objectId)

   return

   await page.goto('http://v.baidu.com/')

   await page.clickNav('xxx')

   await page.goto('https://www.hao123.com/')

   await page.clickNav('xxx')

   await page.goto('https://cn.vuejs.org/')

   await page.clickNav('xxx')

   await page.goto('http://johnny-five.io/')

   await page.clickNav('xxx')

   await page.goto('https://github.com/')

   await page.goto('https://www.hao123.com/')

   await page.clickNav('a[href="https://www.hao123.com"]')

}

main()
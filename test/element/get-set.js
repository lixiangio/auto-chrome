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

   let element = await chrome.page.$('body')
   
   element = await element.$('#header')

   element = await element.$('.setting a')

   const get = await element.get('innerText')

   console.log(get)

   await element.set('innerText', '设定')

   if (element) {

      const bounding = await element.getBoundingRect()

      console.log(bounding)

   }

}

main()
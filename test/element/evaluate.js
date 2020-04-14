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

   // await chrome.page.goto('https://www.so.com/')

   // let value = await chrome.page.run((selector) => {
   //    let innerText = document.querySelector(selector).innerText
   //    return innerText
   // }, '.login')


   await chrome.page.goto('http://www.runoob.com/')

   let value = await chrome.page.run((selector) => {
      let innerText = document.querySelector(selector).innerText
      return innerText
   }, '#index-nav li a')

   console.log(value)

}

main()
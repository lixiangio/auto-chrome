"use strict"

const autoChrome = require('../../lib/');
const { executablePath, userDataDir } = require('../config.js');
const { sleep } = require('../helpers/');

async function main() {

   const chrome = await autoChrome({
      executablePath,
      userDataDir,
      args: ['--start-maximized'],
      devtools: false,
   })

   await chrome.newPage('https://www.so.com/')

   await sleep(3000)

   const elment = await chrome.page.$('.login, #input')

   console.log(!!elment)

   const elments = await chrome.page.$$('.login, #input')

   console.log(elments.length)

}

main()
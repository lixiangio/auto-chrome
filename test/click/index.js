"use strict";

const autoChrome = require('../../lib/');
const devices = require('../../device.js');

const { sleep, logger } = require('../helpers/');

// const { userAgent, viewport } = devices['iPhone 6'];
const { userAgent, viewport } = devices['Chrome'];

async function main() {

   let chrome = await autoChrome({
      executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/",
      // devtools: true,
      args: [
         `--user-agent=${userAgent}`,
         '--start-maximized'
      ],
      emulate: {
         viewport,
      }
   })
   
   await chrome.page.goto('D:/Nodejs/Project/auto-chrome/test/click/index.html')

   await chrome.page.run(function () {

      window.addEventListener('mousemove', function (ev) {
         let { localName, style } = ev.target
         if (localName === 'li') {
            style.backgroundColor = "#ea3c3c"
            // console.log(ev.type)
         }
      })

      window.addEventListener('click', function (ev) {
         let { localName, style } = ev.target
         if (localName === 'li') {
            style.backgroundColor = "#3cea5f"
            console.log(ev.type)
         }
      })

      window.addEventListener('touchstart', function (ev) {
         let { localName, style } = ev.target
         console.log(ev.type)
      })

   })

   await sleep(1000)

   // await chrome.clicker.click(500, 300)

   // await sleep(1000)

   // await chrome.clicker.click(600, 500)

   // await sleep(1000)

   // await chrome.clicker.click(700, 200)

   // await chrome.mouse.move(500, 300)

}

main()
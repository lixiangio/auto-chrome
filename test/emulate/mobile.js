const autoChrome = require('../..')
const devices = require('../../device')

let { userAgent, viewport } = devices['iPhone 6'];

async function main() {

   let chrome = await autoChrome({
      executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/",
      args: [
         `--user-agent=${userAgent}`,
         '--start-maximized'
      ],
      emulate: {
         geolocation: {
            longitude: 114.2916402075,
            latitude: 22.6088954693,
            accuracy: 14
         },
         viewport
      },
      // devtools: true,
   })

   await chrome.newPage('https://www.baidu.com/')

   let data = await chrome.page.run(() => {

      return {
         "window.screen.height": window.screen.height,
         "window.screen.width": window.screen.width,
         "window.screen.availHeight": window.screen.availHeight,
         "window.screen.availWidth": window.screen.availWidth
      }

   })

   console.log(data)

}

main()
const autoChrome = require('../..')
const devices = require('../../device')
const { sleep, logger } = autoChrome.helper

let { userAgent, viewport } = devices['iPhone 6'];

// console.log(userAgent)

// console.log(viewport)

async function run() {

   let chrome = await autoChrome({
      executablePath: "D:/Project/clicker/client/chrome-win32/chrome.exe",
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
         ...viewport
      },
      // devtools: true,
   })

   await chrome.page.goto('https://www.baidu.com/')

   await sleep(1000)

   await chrome.page.click('#index-kw')

   await sleep(500)

   await chrome.page.keyboard.type('汽车')

   await sleep(500)

   await chrome.keyboard.press("Enter")

   await sleep(2000)

   let elment = await chrome.page.$('.c-result:nth-child(3)')

   await elment.scroll()

   await sleep(1000)

   await elment.click()

   await sleep(1500)

   await await chrome.page.goBack()

   await sleep(1500)

   await await chrome.page.goForward()

   await sleep(1500)

   await chrome.page.click('.athm-tab1st__assist a:nth-child(1)')

   await sleep(2000)

   await chrome.page.click('.athm-tab1st__assist a:nth-child(2)')

   await sleep(2000)

   await chrome.page.click('.athm-tab1st__assist a:nth-child(3)')

   await sleep(2000)

   await await chrome.page.goBack()
   
   await sleep(2000)

   await await chrome.page.goBack()

   await sleep(1500)

   await await chrome.page.goBack()
}

run().catch(function (error) {
   console.log(error)
})
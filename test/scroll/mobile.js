"use strict"

const autoChrome = require('../../')
const devices = require('../../device')
const config = require('../helpers/config')
const { sleep } = require('../helpers')

const { executablePath, userDataDir } = config

const { userAgent, viewport } = devices['iPhone 6']

async function main() {

   let chrome = await autoChrome({
      executablePath,
      userDataDir,
      args: [
         `--user-agent=${userAgent}`,
         '--start-maximized',
         '--enable-touchview',
         '--enabled'
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

   let { page } = chrome

   await page.goto('https://www.baidu.com/')

   await sleep(1000)

   await page.click('#index-kw')

   await sleep(500)

   await page.keyboard.type('汽车')

   await sleep(500)

   await page.enter()

   await sleep(2000)

   let remote = await page.run((url, $items) => {

      let elements = document.querySelectorAll($items)

      let sort = 0

      // 遍历匹配url位置
      for (let element of elements) {

         sort++
         if (element.outerHTML.indexOf(url) >= 0) {
            element.sort = sort
            return element
         }

      }

   }, 'xcar.com.cn', '#results .c-result')

   let element = page.newElementByRemote(remote)

   if (element) {
      await element.scroll()
   }

}

main().catch(function (error) {
   console.log(error)
})
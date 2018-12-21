const autoChrome = require('../..')
const config = require('../helpers/config')

const { sleep, logger } = require('../helpers')

const { executablePath, userDataDir } = config

async function main() {

   let chrome = await autoChrome({
      executablePath,
      userDataDir,
      args: ['--start-maximized'],
      // devtools: true,
   })

   let page = chrome.page

   await page.goto('http://www.runoob.com/')

   await sleep(1000)

   let input = await page.$('.search-desktop .placeholder')

   await input.scroll()

   await input.click()

   await input.type('hellow word')

   await sleep(500)

   await page.keyboard.press("Enter")

}

main().catch(function (error) {
   console.log(error)
})
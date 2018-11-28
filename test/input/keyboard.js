const autoChrome = require('../..')
const config = require('../helpers/config')

const { sleep, logger } = autoChrome.helper

const { executablePath, userDataDir } = config

async function run() {

   let chrome = await autoChrome({
      executablePath,
      userDataDir,
      args: ['--start-maximized'],
      // devtools: true,
      // slowMo: 20, // 减速
   })

   let page = chrome.page

   await page.goto('http://www.runoob.com/')

   await sleep(1000)

   let input = await page.$('.search-desktop .placeholder')

   await input.focus()

   await input.type('hellow word')

   await sleep(500)

   await page.keyboard.press("Enter")

}

run().catch(function (error) {
   console.log(error)
})
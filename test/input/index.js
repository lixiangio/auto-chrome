const autoChrome = require('../../')
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

   await chrome.page.goto('https://www.so.com/')

   await sleep(1000)

   await chrome.page.type('#input', 'hellow word')

   await sleep(500)

   await chrome.keyboard.press("Enter")

}

run()
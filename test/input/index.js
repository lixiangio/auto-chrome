const autoChrome = require('../../lib/')
const config = require('../helpers/config')

const { sleep } = require('../helpers')
const { executablePath, userDataDir } = config

async function main() {

   let chrome = await autoChrome({
      executablePath,
      userDataDir,
      args: ['--start-maximized'],
      // devtools: true,
   })

   await chrome.page.goto('https://www.so.com/')

   await sleep(1000)

   await chrome.page.type('#input', 'hellow word')

   await sleep(500)

   await chrome.keyboard.press("Enter")

}

main()
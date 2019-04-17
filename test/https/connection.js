const autoChrome = require('../../lib/')
const { sleep, logger } = require('../helpers')

async function main() {

   let chrome = await autoChrome({
      executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      userDataDir: userDataDir + 1,
      args: ['--start-maximized'],
      devtools: false,
   })

   let page = await chrome.newPage('https://www.so.com/')

   await sleep(1000)

   await page.goto('https://www.sohu.com/a/218915569_161207')

   await sleep(2000)

   await page.clicker.scroll(0, 500)

   await sleep(2000)

   await page.close()

   await sleep(3000)

   await chrome.close()

}

main()
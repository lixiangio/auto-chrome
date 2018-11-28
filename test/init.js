const autoChrome = require('..')
const config = require('./helpers/config')

const { sleep, logger } = autoChrome.helper
const { executablePath, userDataDir } = config

async function run() {

   let chrome = await autoChrome({
      executablePath,
      userDataDir,
      args: ['--start-maximized'],
      // slowMo: 20, // 减速
   })

   // chrome.on('navigation', page => {
   //    console.log(page.targetId)
   // })

   await chrome.newPage('https://www.baidu.com/')

   await sleep(1000)

   await chrome.newPage('https://www.baidu.com/')

   await sleep(1000)

   await chrome.initPage()

}

run()
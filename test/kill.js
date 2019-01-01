const autoChrome = require('../')
const { sleep } = require('./helpers')

async function main() {

   let chrome = await autoChrome({
      executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/",
      args: ['--start-maximized'],
      devtools: false,
   })

   await chrome.newPage('https://www.so.com/')

   await sleep(1000)

   await chrome.close()

}

main()
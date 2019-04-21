const autoChrome = require('../')
const { sleep } = require('./helpers')
const config = require('./config.js');

const { executablePath, userDataDir } = config;

async function main() {

   let chrome = await autoChrome({
      executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      userDataDir: userDataDir + 1,
      args: ['--start-maximized'],
      devtools: false,
   })

   await chrome.newPage('https://www.so.com/')

   await sleep(1000)

   await chrome.close()

}

main()
const autoChrome = require('../')
const { sleep } = require('./helpers')
const config = require('./config.js');

const { executablePath, userDataDir } = config;

async function main() {

   const chrome = await autoChrome({
      executablePath,
      userDataDir,
      args: ['--start-maximized'],
      devtools: false,
   })

   await chrome.newPage('https://www.so.com/')

   await sleep(1000)

   await chrome.close()

}

main()
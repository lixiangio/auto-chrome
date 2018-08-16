const autoChrome = require('../..')
const { sleep, signale } = autoChrome.helper

async function run() {

   let chrome = await autoChrome({
      executablePath: "D:/Project/clicker/client/chrome-win32/chrome.exe",
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/",
      args: ['--start-maximized'],
      devtools: false,
      // slowMo: 20, // 减速
   })

   await chrome.page.goto('https://www.so.com/')

   await sleep(3000)

   let element = await chrome.page.$('body')
   
   element = await element.$('#header')

   element = await element.$('.setting a')

   let get = await element.get('innerText')

   console.log(get)

   let set = await element.set('innerText', '设定')

   console.log(set)

   if (element) {

      let bounding = await element.getBoundingRect()

      console.log(bounding)

   }

}

run()
const autoChrome = require('../..')
const { sleep, logger } = require('../helpers')

async function main() {

   let chrome = await autoChrome({
      executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      userDataDir: userDataDir + 1,
      args: ['--start-maximized'],
      devtools: false,
   })

   await chrome.page.goto('https://www.so.com/')

   await sleep(3000)

   let element = await chrome.page.$('body')
   
   element = await element.$('#header')

   element = await element.$('.setting a')

   let get = await element.get('innerText')

   console.log(get)

   await element.set('innerText', '设定')

   if (element) {

      let bounding = await element.getBoundingRect()

      console.log(bounding)

   }

}

main()
const autoChrome = require('../../')
const { sleep, signale } = autoChrome.helper

async function run() {

   let chrome = await autoChrome({
      executablePath: "D:/Project/clicker/client/chrome-win32/chrome.exe",
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/",
      args: ['--start-maximized'],
   })

   await chrome.page.goto('D:/Nodejs/git-project/auto-chrome/test/click/index.html')

   await chrome.page.evaluate(function () {

      window.addEventListener('mousemove', function (ev) {
         let { localName, style } = ev.target
         if (localName === 'li') {
            style.backgroundColor = "#ea3c3c"
            console.log(ev.type)
         }
      })

      window.addEventListener('click', function (ev) {
         let { localName, style } = ev.target
         if (localName === 'li') {
            style.backgroundColor = "#3cea5f"
            console.log(ev.type)
         }
      })

   })

   await sleep(1000)

   await chrome.mouse.click(500, 300)

   await sleep(1000)

   await chrome.mouse.click(600, 500)

   await sleep(1000)

   await chrome.mouse.click(700, 200)

   // await chrome.mouse.move(500, 300)

}

run()
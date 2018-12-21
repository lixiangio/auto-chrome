const autoChrome = require('../../')


async function main() {

   let chrome = await autoChrome({
      executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/",
      args: ['--start-maximized'],
      devtools: false,
   })

   await chrome.page.goto('http://www.runoob.com/html/html-tutorial.html')

   await chrome.page.click('.pc-nav li:nth-child(3) a')

   await chrome.page.click('.pc-nav li:nth-child(4) a')

   await chrome.page.click('.pc-nav li:nth-child(5) a')

   await chrome.page.click('.pc-nav li:nth-child(6) a')

   await chrome.page.click('.pc-nav li:nth-child(7) a')

   await chrome.page.click('.pc-nav li:nth-child(8) a')

   await chrome.page.click('.pc-nav li:nth-child(9) a')

   await chrome.page.click('.pc-nav li:nth-child(10) a')

   await chrome.close()

}

main()
const autoChrome = require('..')

async function main() {

   let chrome = await autoChrome({
      executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      userDataDir: "C:/Users/Xiang/AppData/Local/Chromium/User Data/",
      args: ['--start-maximized'],
      devtools: false,
      // slowMo: 20, // 减速
   })

   let frameTree = await chrome.page.send('Page.getFrameTree')

   console.log(frameTree.frameTree)

   console.log(frameTree.frameTree.childFrames)

}

main().catch(function (error) {

   console.error(error)
   
})
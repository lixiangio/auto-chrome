const autoChrome = require('../lib/')

async function main() {

   let chrome = await autoChrome({
      executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      userDataDir: userDataDir + 1,
      args: ['--start-maximized'],
      devtools: false,
   })

   let frameTree = await chrome.page.send('Page.getFrameTree')

   console.log(frameTree.frameTree)

   console.log(frameTree.frameTree.childFrames)

}

main().catch(function (error) {

   console.error(error)
   
})
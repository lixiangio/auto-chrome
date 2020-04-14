const autoChrome = require('../lib/')
const { executablePath, userDataDir } = require('./config.js');

async function main() {

   const chrome = await autoChrome({
      executablePath,
      userDataDir,
      args: ['--start-maximized'],
      devtools: false,
   })

   const frameTree = await chrome.page.send('Page.getFrameTree')

   console.log(frameTree.frameTree)

   console.log(frameTree.frameTree.childFrames)

}

main().catch(function (error) {

   console.error(error)
   
})
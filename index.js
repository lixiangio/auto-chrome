const childProcess = require('child_process')
const axios = require('axios');
const WebSocket = require('ws');
const Chrome = require('./lib/Chrome');
// const Input = require('./lib/Input');
const helper = require('./lib/helper');

async function index(options) {

   let { executablePath, args = [], headless, userDataDir } = options

   args.push("--remote-debugging-port=9222")

   if (userDataDir) {
      args.push(`--user-data-dir=${userDataDir}`)
   }

   if (headless) {
      args.push(
         '--headless',
         '--disable-gpu',
         '--hide-scrollbars',
         '--mute-audio'
      );
   }

   // 异步启动浏览器
   let chromeProcess = childProcess.spawn(executablePath, args)

   chromeProcess.once('exit', () => {
      console.log('浏览器关闭');
   });

   chromeProcess.once('message', (message) => {
      console.log("message", message);
   });

   // 等待浏览器准备就绪
   await helper.sleep(3000)

   let { data } = await axios.get('http://localhost:9222/json')

   let [{ webSocketDebuggerUrl }] = data

   let ws = new WebSocket(webSocketDebuggerUrl, { perMessageDeflate: false });

   let chrome = new Chrome(ws)

   await chrome.run()

   return chrome

}

index.helper = helper

module.exports = index
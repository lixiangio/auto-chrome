const childProcess = require('child_process')
const readline = require('readline');
const WebSocket = require('ws')
const Chrome = require('./lib/Chrome')
const helper = require('./lib/helper')
const { signale, newPromise } = helper

async function index(options) {

   let { args = [], executablePath, ignoreHTTPSErrors, emulate } = options

   args.push("--remote-debugging-port=9222")

   if (options.userDataDir) {
      args.push(`--user-data-dir=${options.userDataDir}`)
   }

   if (options.headless) {
      args.push(
         '--headless',
         '--disable-gpu',
         '--hide-scrollbars',
         '--mute-audio'
      );
   }

   if (options.devtools) {
      args.push('--auto-open-devtools-for-tabs');
   }

   // 异步启动浏览器
   let chromeProcess = childProcess.spawn(executablePath, args)

   chromeProcess.once('exit', () => {
      signale.success('浏览器关闭');
   });

   chromeProcess.once('message', (message) => {
      console.log("message", message);
   });

   const rl = readline.createInterface({ input: chromeProcess.stderr });

   let linePromise = newPromise(30000)

   rl.on('line', function (data) {
      if (data) {
         data = data.replace('DevTools listening on ', '')
         linePromise.resolve(data)
      }
   })

   // 获取webSocket连接地址
   let webSocketDebuggerUrl = await linePromise.catch(function (error) {
      throw error
   })

   let ws = new WebSocket(webSocketDebuggerUrl, { perMessageDeflate: false });

   let awaitOpen = newPromise()

   ws.on('open', awaitOpen.resolve);

   ws.on('error', awaitOpen.reject);

   await awaitOpen.then(function () {
      signale.success('WebSocket连接成功');
   }).catch(function (error) {
      signale.error('WebSocket连接失败');
      throw error
   })

   let chrome = new Chrome(ws, ignoreHTTPSErrors, emulate)

   await chrome.run()

   return chrome

}

index.helper = helper

module.exports = index
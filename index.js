"use strict"

const childProcess = require('child_process')
const readline = require('readline')
const WebSocket = require('ws')
const Chrome = require('./lib/Chrome')
const helper = require('./lib/helper')

const { logger, zPromise } = helper

async function main(options) {

   let { args = [], userDataDir, headless, devtools, executablePath } = options

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

   if (devtools) {
      args.push('--auto-open-devtools-for-tabs');
   }

   // 启动浏览器
   let chromeProcess = childProcess.spawn(executablePath, args)

   chromeProcess.once('exit', () => {
      logger.log('浏览器关闭');
   })

   chromeProcess.once('message', (message) => {
      logger.log("message", message);
   })

   let rl = readline.createInterface({ input: chromeProcess.stderr });

   let linePromise = new zPromise({ delay: 30000 })

   rl.on('line', function (data) {
      if (data.indexOf('ws://') >= 0) {
         let url = data.replace('DevTools listening on ', '')
         linePromise.resolve(url)
      }
   })

   // 获取webSocket连接地址
   let webSocketDebuggerUrl = await linePromise.catch(function (error) {
      throw error
   })

   let ws

   try {
      ws = new WebSocket(webSocketDebuggerUrl, { perMessageDeflate: false });
   } catch (error) {
      chromeProcess.kill()
      throw error
   }

   let awaitOpen = new zPromise()

   ws.on('open', awaitOpen.resolve);

   ws.on('error', awaitOpen.reject);

   await awaitOpen.then(function () {
      logger.success('Chrome 连接成功');
   }).catch(function (error) {
      logger.error(new Error('Chrome 连接失败'));
      throw error
   })

   let { ignoreHTTPSErrors, emulate } = options

   let chrome = new Chrome(ws, ignoreHTTPSErrors, emulate)

   await chrome.init()

   return chrome

}

main.helper = helper

module.exports = main
"use strict"

const cluster = require('cluster');
const childProcess = require('child_process');
const readline = require('readline');
const WebSocket = require('ws');
const Chrome = require('./lib/Chrome');
const helper = require('./lib/helper');

const { logger, timerPromise } = helper

async function main(options) {

   let { args = [], userDataDir, profileDir, headless, devtools, executablePath } = options

   // cluster模式下启用多个不同的端口，避免端口重复
   let port
   if (cluster.isMaster) {
      port = 9222
   } else if (cluster.isWorker) {
      port = 9222 + cluster.worker.id
   }

   args.push(`--remote-debugging-port=${port}`)

   if (userDataDir) {
      args.push(`--user-data-dir=${userDataDir}`)
   }

   if (profileDir) {
      args.push(`--profile-directory=${profileDir}`)
   }

   if (headless) {
      args.push(
         '--headless',
         '--disable-gpu',
         '--hide-scrollbars',
         '--mute-audio',
         '--force-device-scale-factor=1.25',
      );
   }

   if (devtools) {
      args.push('--auto-open-devtools-for-tabs');
   }

   // 启动浏览器
   let chromeProcess = childProcess.spawn(executablePath, args)

   chromeProcess.on('error', error => {
      logger.error(error);
   })

   chromeProcess.on('message', message => {
      logger.info(message);
   })

   let rl = readline.createInterface({ input: chromeProcess.stderr });

   let linePromise = new timerPromise(30000)

   rl.on('line', function (data) {

      if (data.indexOf('ws://') >= 0) {

         let url = data.replace('DevTools listening on ', '')

         linePromise.resolve(url)

      }

   })

   // 获取webSocket连接地址
   let webSocketUrl = await linePromise.catch(error => {
      throw error
   })

   try {

      var ws = new WebSocket(webSocketUrl, { perMessageDeflate: false });

   } catch (error) {

      chromeProcess.kill()

      throw error

   }

   let awaitOpen = new timerPromise(30000)

   ws.on('open', awaitOpen.resolve);

   ws.on('error', awaitOpen.reject);

   await awaitOpen.then(function () {
      logger.success('Chrome连接成功');
   }).catch(function (error) {
      logger.error(new Error('Chrome连接失败'));
      throw error
   })

   let { ignoreHTTPSErrors, emulate } = options

   let chrome = new Chrome(ws, ignoreHTTPSErrors, emulate)

   chrome.options = options

   await chrome.init()

   return chrome

}

module.exports = main
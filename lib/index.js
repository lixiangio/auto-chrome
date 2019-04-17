"use strict";

const logger = require('loggercc');
const childProcess = require('child_process');
const readline = require('readline');
const WebSocket = require('ws');
const Chrome = require('./Chrome.js');
const helper = require('./helper.js');

const { timerPromise } = helper;

async function main(options) {

   const { args = [], userDataDir, profileDir, port = 9222, } = options;
   const { headless, devtools, executablePath, } = options;

   args.push(`--remote-debugging-port=${port}`);

   if (userDataDir) {
      args.push(`--user-data-dir=${userDataDir}`);
   }

   if (profileDir) {
      args.push(`--profile-directory=${profileDir}`);
   }

   if (headless) {
      args.push(
         '--headless',
         '--disable-gpu',
         '--hide-scrollbars',
         '--mute-audio',
      );
   }

   if (devtools) {
      args.push('--auto-open-devtools-for-tabs');
   }

   // 启动浏览器
   const chromeProcess = childProcess.execFile(executablePath, args);

   chromeProcess.on('error', error => {
      logger.error(error);
   });

   chromeProcess.on('message', message => {
      logger.info(message);
   });

   const rl = readline.createInterface({
      input: chromeProcess.stderr
   });

   const linePromise = new timerPromise(30000);

   rl.on('line', function (data) {

      if (data.indexOf('ws://') >= 0) {
         const url = data.replace('DevTools listening on ', '');
         linePromise.resolve(url);
      }

   });

   // 获取webSocket连接地址
   const webSocketUrl = await linePromise.catch(error => {
      throw error
   })

   let ws;

   try {

      ws = new WebSocket(webSocketUrl, { perMessageDeflate: false });

   } catch (error) {

      chromeProcess.kill();

      throw error;

   }

   const awaitOpen = new timerPromise(30000);

   ws.on('open', awaitOpen.resolve);

   ws.on('error', awaitOpen.reject);

   await awaitOpen.then(function () {
      logger.success('Chrome连接成功');
   }).catch(function (error) {
      logger.error(new Error('Chrome连接失败'));
      throw error;
   })

   const chrome = new Chrome({
      ws,
      options,
      process: chromeProcess,
   });

   ws.on('message', chrome.message.bind(chrome));

   await chrome.init();

   return chrome;

}

module.exports = main;
"use strict";

const consoln = require('consoln');
const childProcess = require('child_process');
const Connection = require('./Connection.js');
const Chrome = require('./Chrome.js');

async function main(options) {

   const { args = [], userDataDir, profileDir, } = options;
   const { headless, devtools, executablePath, timeOut } = options;

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

   if (timeOut === undefined) {
      options.timeOut = 15000;
   }
   
   args.push('--remote-debugging-pipe');

   // 启动浏览器
   const chromeProcess = childProcess.spawn(executablePath, args, {
      env: process.env,
      stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe']
   });

   chromeProcess.on('error', error => {
      consoln.error(error);
   });

   const [, , , pipeWrite, pipeRead] = chromeProcess.stdio;

   const connection = new Connection(pipeWrite, pipeRead);

   const chrome = new Chrome({
      connection,
      options,
      process: chromeProcess,
   });

   connection.bind(chrome);

   await chrome.init();

   return chrome;

}

module.exports = main;
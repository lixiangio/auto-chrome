"use strict";

const cluster = require('cluster');
const { sleep } = require('./helpers');

if (cluster.isMaster) {

   (async function () {

      let count = 4;

      while (count--) {

         cluster.fork();
         await sleep(3000);

      }

   })()

} else {

   const { worker: { id } } = cluster;

   const autoChrome = require('../lib/');
   const devices = require('../device.js');
   const config = require('./config.js');

   const { executablePath, userDataDir } = config;

   const { userAgent, viewport } = devices['iPhone 6']

   async function main() {

      const chrome = await autoChrome({
         executablePath,
         userDataDir: userDataDir + id,
         port: 9222 + id,
         args: [
            `--user-agent=${userAgent}`,
            '--start-maximized',
         ],
         emulate: {
            viewport
         },
      })

      await chrome.newPage('https://m.baidu.com/');

      await sleep(10000);

      await chrome.newPage('http://www.runoob.com/');

      await chrome.close();

   }

   (async function () {

      let count = 1000;

      while (count--) {

         console.log(id, count)

         await main().catch(function (error) {

            console.log(error);

         })

      }

   })()

}
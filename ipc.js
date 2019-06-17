"use strict";

const childProcess = require('child_process');

const chromeProcess = childProcess.spawn(
   'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
   ['--remote-debugging-pipe'],
   {
      env: process.env,
      stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe']
   }
);

chromeProcess.once('exit', () => {
   console.log('exit');
});

const [, , , pipeWrite, pipeRead] = chromeProcess.stdio;

const message = JSON.stringify({ id: 1, method: 'Browser.getVersion' });

pipeWrite.write(`${message}\0`);

pipeRead.on('data', function (data) {

   console.log(data.toString());

})
"use strict"

const autoChrome = require('../../lib/');
const { userDataDir } = require('../config.js');

/**
 * @param {*} device 用户配置目录名称
 */
async function main() {

   const chrome = await autoChrome({
      executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      userDataDir: userDataDir + 1,
      args: [
         '--start-maximized'
      ],
      ignoreHTTPSErrors: true, //忽略https错误
      // devtools: true,
   })

   await chrome.page.goto('D:/Nodejs/Project/auto-chrome/test/dialog/index.html')

}

main()
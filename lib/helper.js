"use strict";

const logger = require('loggercc');
const timeChain = require('timechain');
const timerPromise = require('zpromise/timer.js');
const restartPromise = require('zpromise/restart.js');

const timechain = new timeChain({ delay: 10000 })

module.exports = {
   logger,
   timechain,
   timerPromise,
   restartPromise,
   assert(value, message) {
      if (!value) {
         throw new Error(message);
      }
   },
   sleep(time = 0) {
      return new Promise(resolve => setTimeout(resolve, time))
   },
}
"use strict";

const timeChain = require('timechain');

const timechain = new timeChain({ delay: 10000 });

module.exports = {
   timechain,
   sleep(time = 0) {
      return new Promise(resolve => setTimeout(resolve, time));
   },
}
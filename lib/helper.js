"use strict"

const logger = require('loggercc')
const timeChain = require('timechain')
const zPromise = require('zpromise')

const timechain = new timeChain({ delay: 10000 })

module.exports = {
  logger,
  zPromise,
  timechain,
  assert(value, message) {
    if (!value)
      throw new Error(message);
  },
  sleep(time = 0) {
    return new Promise(resolve => setTimeout(resolve, time))
  },
}
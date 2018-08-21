const signale = require('signale')
const zPromise = require('zpromise')
const timeChain = require('timechain')
const timechain = new timeChain({ timeout: 5000 })

module.exports = {
  signale,
  zPromise,
  timechain,
  assert(value, message) {
    if (!value)
      throw new Error(message);
  },
  sleep(time = 0) {
    return new Promise(resolve => setTimeout(resolve, time))
  },
};
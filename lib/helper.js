const signale = require('signale')
const zPromise = require('zpromise')

module.exports = {
  signale,
  zPromise,
  assert(value, message) {
    if (!value)
      throw new Error(message);
  },
  sleep(time = 0) {
    return new Promise(resolve => setTimeout(resolve, time))
  },
};
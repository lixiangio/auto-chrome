const signale = require('signale')

module.exports = {
  signale,
  assert(value, message) {
    if (!value)
      throw new Error(message);
  },
  sleep(time = 0) {
    return new Promise(resolve => setTimeout(resolve, time))
  }
};
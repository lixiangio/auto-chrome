const signale = require('signale')

module.exports = {
  signale,
  assert(value, message) {
    if (!value)
      throw new Error(message);
  },
  sleep(time = 0) {
    return new Promise(resolve => setTimeout(resolve, time))
  },
  /**
   * Promise简化包装器
   * @param {Number} time 超时报错，单位ms
   */
  promise(time) {
    let callback
    let promise = new Promise((resolve, reject) => {
      callback = { resolve, reject }
    })
    if (time) {
      let timeId = setTimeout(() => {
        callback.reject()
      }, time);
      promise.resolve = function () {
        clearTimeout(timeId)
        callback.resolve()
      }
      promise.reject = function () {
        clearTimeout(timeId)
        callback.reject()
      }
    } else {
      Object.assign(promise, callback)
    }
    return promise
  }
};
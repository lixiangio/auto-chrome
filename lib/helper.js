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
   * 带有超时功能的简化Promise包装器
   * @param {Number} time 超时报错，单位ms
   */
  promise(time) {
    let callback
    let promise = new Promise((resolve, reject) => {
      callback = { resolve, reject }
    })
    if (time) {
      let timeId = setTimeout(() => {
        callback.reject(new Error(`Promise等待超超过${time}ms`))
      }, time);
      promise.resolve = function (data) {
        clearTimeout(timeId)
        callback.resolve(data)
      }
      promise.reject = function (data) {
        clearTimeout(timeId)
        callback.reject(data)
      }
    } else {
      Object.assign(promise, callback)
    }
    return promise
  }
};
const childProcess = require('child_process')
const WebSocket = require('ws');
const EventEmitter = require('events');
const debugSend = require('debug')('chrome:send');
const debugError = require('debug')('chrome:error');
const axios = require('axios');
const Page = require('./Page');
const { Keyboard, Mouse, Touchscreen } = require('./Input');
const { sleep, signale } = require('./helper');

class Chrome extends EventEmitter {
   /**
    * 
    * @param {*} param0 
    */
   constructor() {

      super()
      this.id = 1 // 自增消息id
      this.callbacks = new Map() // WebSocket消息回调队列

   }
   /**
    * 启动浏览器，创建连接
    */
   static async run(options) {

      let { executablePath, args = [], headless, userDataDir } = options

      args.push("--remote-debugging-port=9222")

      if (userDataDir) {
         args.push(userDataDir) 
      }

      if (headless) {
         args.push(
            '--headless',
            '--disable-gpu',
            '--hide-scrollbars',
            '--mute-audio'
         );
      }

      // 异步启动浏览器
      childProcess.spawn(executablePath, args)

      // 等待浏览器准备就绪
      await sleep(3000)

      let { data } = await axios.get('http://localhost:9222/json')

      let [{ webSocketDebuggerUrl }] = data


      let chrome = new Chrome()

      chrome.ws = new WebSocket(webSocketDebuggerUrl, { perMessageDeflate: false });

      await new Promise((resolve, reject) => {
         chrome.ws.on('open', function () {
            resolve()
            signale.success('WebSocket连接成功');
         });
         chrome.ws.on('error', reject);
      })

      chrome.ws.on('message', chrome.onMessage.bind(chrome))

      // 使用绑定this的send覆盖原send
      chrome.send = chrome.send.bind(this)

      // this.keyboard = new Keyboard(this.send)

      this.mouse = new Mouse(this.send)

      this.touchscreen = new Touchscreen(this.send)

      if (this.ignoreHTTPSErrors) {
         await this.send('Security.disable', { override: true });
      }

      this.on('Target.targetCreated', function () {
         console.log(9999)
      });

   }
   /**
    * 事件回调
    */
   onMessage(data) {
      const object = JSON.parse(data);
      if (object.id) {
         const callback = this.callbacks.get(object.id);
         if (callback) {
            this.callbacks.delete(object.id);
            if (object.error) {
               callback.reject(object.error)
            } else {
               callback.resolve(object.result);
            }
         }
      } else {
         if (object.method === 'Target.receivedMessageFromTarget') {
         } else if (object.method === 'Target.detachedFromTarget') {
         } else {
            console.log(object.method)
            this.emit(object.method, object.params);
         }
      }
   }
   /**
    * 发送消息
    */
   send(method = '', params = {}) {

      let id = this.id++

      let message = JSON.stringify({ id, method, params });

      this.ws.send(message);

      return new Promise((resolve, reject) => {
         this.callbacks.set(id, { resolve, reject, method, error: new Error() });
      }).catch(error => {
         error.suffix = error.code
         signale.error(error)
         return
      })

   }
   /**
    * 获取Chrome版本信息
    */
   getVersion() {
      return this.send('Browser.getVersion')
   }
   /**
    * 创建新标签，如果返回空值表示创建失败
    * @param {*} url 新标签的初始url
    */
   async newPage(url = '') {

      let result = await this.send('Target.createTarget', { url })

      if (result.targetId) {

         return new Page(this.send, result.targetId)

      }

   }
   /**
    * 关闭浏览器
    */
   close() {

      return this.send('Browser.close')

   }
}

module.exports = Chrome
class Network {

   constructor(chrome, targetId) {
      this.chrome = chrome
      this.targetId = targetId
   }

   /**
    * 设置网络类型
    * @param {*} connectionType 
    */
   connectionType(connectionType) {

      return this.chrome.send('Network.emulateNetworkConditions', { connectionType })

   }

}

module.exports = Network
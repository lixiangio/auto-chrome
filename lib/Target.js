await this._client._connection.send('Target.closeTarget', { targetId: this._target._targetId });


class Target {
   constructor(send) {
      this.send = send
      this.targets = new Map()
   }
   createSession(){
      
   }
}

module.exports = Target
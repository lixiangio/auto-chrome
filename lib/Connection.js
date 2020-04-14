"use strict";

class Connection {
   constructor(pipeWrite, pipeRead) {

      this.pipeWrite = pipeWrite;
      this.pipeRead = pipeRead;

   }
   bind(chrome) {

      const message = chrome.message.bind(chrome);

      this.pipeRead.on('data', function (buffer) {

         const data = buffer.toString();

         const list = data.split('\u0000');

         for (const item of list) {
            if (item) message(item);
         }

      });

   }
   /**
    * 
    * @param {String} method 
    */
   send(message) {

      // console.log(message);

      this.pipeWrite.write(`${message}\0`);

   }
}

module.exports = Connection;

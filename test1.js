const EventEmitter = require('events');

let evnet = new EventEmitter()

evnet.on('小明', function (data) {
   console.log(1, data)
})

evnet.on('小明', function (data) {
   console.log(2, data)
})

evnet.emit('小明', { a: 888 })

console.log(9999)
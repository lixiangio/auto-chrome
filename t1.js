const zPromise = require('zpromise')

let promise = new zPromise()

promise.catch(info => {
   console.error(info)
})

async function run() {

   await promise.catch(info => {
      console.error(info)
   })

   console.log(9999)

}

setTimeout(() => {
   promise.reject(666)
}, 1000);

run()
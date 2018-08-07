function promise() {
   let func
   let promise =  new Promise(resolve => func = resolve)
   promise.resolve = func
   return promise
 }
 
 async function name() {

   let pro = promise()

   pro.resolve()

   pro.resolve()
   
   await pro

   console.log(999)

}

name()
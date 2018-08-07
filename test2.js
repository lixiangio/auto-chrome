async function a(){
   await b()
}

async function b(){
   await c()
}

async function c(){
   this.xxx.sss
}

a()

console.log(9999)
let promeis = new Promise(function (res, reject) {
   setTimeout(() => {
      res()
   }, 1000);
})


async function name1(params) {
   console.log(111)
   await promeis
   console.log(121212)
}

async function name2(params) {
   console.log(222)
   await promeis
   console.log(232323)
}

name1()

name2()
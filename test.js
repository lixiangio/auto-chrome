let por = new Promise((resolve, reject) => {
   resolve(666)
   // reject(9999)
});

(function () {
   por.then(function (data) {
      console.log(data)
      return data
   }).then(function (data) {
      return data + 888
   }).then(function (data) {
      console.log(data)
      return data
   }).catch(function (err) {
      return err
   })

   console.log(por)

})


async function run() {

   let result = await por.catch(err => {
      return err
   })

   console.log(result)

}



// run()
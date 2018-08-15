class a {
   static a1(){
      console.log(this.a2)
      // this.a2()
   }
   a2(){
      console.log(666)
   }
}

a.a1()
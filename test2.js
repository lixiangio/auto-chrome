let m = new Map()

m.set(1, 12)

m.set(9, 666)

console.log()

for (let [key ,value] of m) {
   console.log(key ,value)
}
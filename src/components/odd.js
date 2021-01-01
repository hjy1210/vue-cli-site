let {julian} = require('astronomia')
/*let jdes = [1721789.5684809217, 1721790.0684809217, 1721790.5684809217]
jdes = [1721789.5684809217, 1721790.0684809217, 1721790.5684809217]
let dates = jdes.map(x=>julian.JDEToDate(x))
console.log(dates,""+dates)
dates = jdes.map(x=>julian.JDEToDate(x+0.3))
console.log(dates,""+dates)


E:\vue-cli-site\src\components>node base
[
  0001-12-30T22:42:33.401Z,
  0001-12-31T10:42:33.414Z,
  0002-12-31T22:42:33.428Z
] Mon Dec 31 0001 06:48:33 GMT+0806 (GMT+08:00),Mon Dec 31 0001 18:48:33 GMT+0806 (GMT+08:00),Wed Jan 01 0003 06:48:33 GMT+0806 (GMT+08:00)
[
  0001-12-31T05:54:33.409Z,
  0001-12-31T17:54:33.423Z,
  0002-01-01T05:54:33.437Z
] Mon Dec 31 0001 14:00:33 GMT+0806 (GMT+08:00),Tue Jan 01 0002 02:00:33 GMT+0806 (GMT+08:00),Tue Jan 01 0002 14:00:33 GMT+0806 (GMT+08:00)
*/

function onedate(){
  let date = new Date('0002-12-31T22:42:33.428Z')
  console.log(date)
  console.log(date.toString())
}
onedate()

function oddJDEToDate(){
  let d = 1721790.0684809217
  console.log([julian.JDEToDate(d), julian.JDEToDate(d+0.5)]) // [ 0001-12-31T10:42:33.414Z, 0002-12-31T22:42:33.428Z ]
}

oddJDEToDate()

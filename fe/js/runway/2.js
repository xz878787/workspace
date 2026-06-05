//v8 引擎眼里
//声明提升
var myname //变量提升
function showName() {
  console.log('函数showName执行');
}

showName();
console.log(myname);
myname="方磊"
console.log(myname);

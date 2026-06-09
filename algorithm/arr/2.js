let num = 0;
// 非纯函数：依赖外部变量，结果不可控
function add(b) {
  num += b;
  return num;
}
add(1);
console.log(num);
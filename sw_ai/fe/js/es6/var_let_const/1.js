var height = 100;
// 局部作用域 global scope 全局作用域
function setWidth(){
    // 局部作用于变量      
    var width = 100;
    console.log(width, height);
}

setWidth();
//console.log(width);
var age = 100;
if(age >12){
    // es6 常量 不可以改变的
   var dog=age*7;
   let x=111;
    console.log(dog);   
    dog++;
}
console.log(dog);
console.log(x);
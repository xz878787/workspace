var height = 100;
// 局部作用域 global scope 全局作用域
function setWidth(){
    // 局部作用于变量      
    var width = 100;
    console.log(width, height);
}

setWidth();
console.log(width);

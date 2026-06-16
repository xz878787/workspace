// symbol 唯一的标识符，用函数创建的， 简单数据类型
// 轻松表达独一无二
console.log(Symbol('张强')===Symbol('张强'));
console.log(typeof Symbol('id'));
console.log(Symbol());// 绝对唯一,可以传一个标签label 
let odj={
    [Symbol()]:'value',
    prop:"2"
}

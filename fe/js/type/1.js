//  表示空， 没有
//null

let a=null;
let b=a;
b=2;
console.log(a);

let obj={
    name:'张三',
    address:null,
}
console.log(obj.age);//undefined

let largeObject={
    data:new Array(1000000).fill("hgh")
}
// 手动回收内存？
largeObject= null;


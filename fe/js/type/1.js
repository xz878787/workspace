//  表示空， 没有
//null
// primitive 原始 内存空间固定 ,  
let a=null;
let b=a;
b=2;
let obj1={name:"谢灵运"}
let obj2=obj1; //
console.log(obj1,obj2);

obj2.company="快手";
console.log(a,b);

let obj={
    name:'张三',
    address:null,
}
console.log(obj.address);///null
console.log(obj.age);//undefined

let largeObject={
    data:new Array(1000000).fill("hgh")
}
// 手动回收内存？
largeObject= null;


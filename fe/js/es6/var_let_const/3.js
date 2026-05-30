
//常量一开始就赋值
const item=1;
let a;//undefined
//简单数据类型
const key='abc123';
key='ABC123';
let points=51;
points=51;
//let 不只是值可以改变，类型也可以改变
//不要这么干
points="52";//不好的
let winner =false;
winner='戴';
//复杂数据类型 对象 
// 值可以改变，但是类型不能变
const person={
    name:'李玉刚',
    age:18
}
person.age++
console.log(person);
person="111";//Assignment to constant variable.
console.log(person);
// 函数表达式
//类 MyQueue
// 早期的js 没有类
// JS 是基于原型的面向对象语言
// 不需要class 也可以完成面向对象
// 函数+ prototype 更优秀
// js 开发比较快
// 类 ? 抽象 一套属性 + 方法的模板
const MyQueue = function () {
// 构造函数，属性
console.log('实例化',this);
// this.x = 1;
this.stack1 = [];
this.stack2 = [];
}

MyQueue.prototype.push = function () {}



const queue = new MyQueue();
console.log(queue,queue.push());
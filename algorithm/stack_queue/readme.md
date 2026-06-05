# 如何用栈模拟队列
线性 
  栈、队列、链表
非线性
  树
- 栈  stack
  FILO 
- 队列 Queue FIFO 先进先出
push(x) 将一个元素放入队列的尾部
pop() 从队列首部移除元素
peek() 返回队列首部的元素
empty() 返回队列是否为空

## JS 的面向对象
- 不走寻常路
  不需要class 也可以完成面向对象
  函数是一等对象
  普通函数
    this 全局对象
  new + 构造函数 
    this 指向新创建的对象
    new+ 构造函数运行时，this 指向不断地完成
    对象属性的创建 
  原型式的面向对象 
    js 没有类 只有对象 MyQueue 对象 
    MyQueue.prototype  也是一个对象 
    人 概念class 钟sir 对象 prototype 孔子 

## new 的过程
- 创建一个空对象 ， this 指向新创建的对象
- 构造函数执行， this 上添加属性， 实例也就有了这些属性
- 构造函数有一个prototype 属性， 指向原型对象
  原型对象上拥有的方法， 实例也会拥有

  ## JS 设计哲学
  - 一切皆是对象，没有类
  - Object 是顶层对象
    按照原型式的面向对象来设计
    Object() 函数对象
    Object.prototype 是一个原型对象
    let obj={} new Object();
    Function、Array、Date、RegExp 函数对象
    下一站 Object 原型链

    - 实例对象有__proto__ 私有属性指向 原型对象
    - 沿着__proto__ 一直查找，沿着原型链查找
    终点是null
    - 任何函数有prototype 属性， 指向原型对象
    负责给实例们提供共享方法
    - 原型对象上有constructor 属性， 指向构造函数
    - 实例先在自身查找属性，再沿着原型链查找属性或方法
    - 任何对象，要不原型直接是Object.prototype,要不终点前
    一定是Object.prototype
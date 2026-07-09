//fs FileSystem 是文件系统模块， 用于操作文件和目录
import fs from 'fs';//没加 不直接启用/promise
//I/O 操作 可异步， 可同步 readFileSync 同步阻塞线程的执行性能问题
// 简单粗暴，性能问题差一点 同步
// JS 单线程， 充斥着异步 高性能解决方案
//node 和前端环境不一样 ，可以异步(node 的优势),可同步
// node 异步无阻塞 no block 
//node省很多服务器
// node c++ 写出来的(fs,path 暴露给js 代码)  封装了v8 引擎 (解析js )
const syncData= fs.readFileSync('./test.txt', 'utf-8');
console.log(syncData);
//异步  跳过执行后面的 将回调函数放入事件循环
//控制流程 
// es6 之前的老方法 回调函数
fs.readFile('./test.txt1','utf-8',(err,data)=>{
  //node 第一个参数是err 错误对象 
  if(!err){
    console.log(`file1`,data);
  } else {
    console.log(err);
  }
})
fs.readFile('./test.txt2','utf-8',(err,data)=>{
  //node 第一个参数是err 错误对象 
  if(!err){
    console.log(`file2`,data);
  } else {
    console.log(err);
  }
})
fs.readFile('./test.txt3','utf-8',(err,data)=>{
  //node 第一个参数是err 错误对象 
  if(!err){
    console.log(`file3`,data);
  } else {
    console.log(err);
  }
})
// 流程控制

// 先读取file1.txt, 再读取file2.txt，最后读取file3.txt
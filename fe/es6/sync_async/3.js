// promise es6 用于异步任务控制的 最佳机制
const p= new Promise((resolve,reject)=>{
    console.log('许诺言');   
    //耗时性任务的 
    setTimeout(()=>{
        //resolve(666);
        reject("网络出错");//耗时性异步任务，没有履约
        
    },2000)
});// 许诺言
console.log(p.__proto__);
p

  .then ((data)=>{
    console.log(data);
    console.log('end，成功了');
  })
  .catch ((err)=>{
    console.log(err);
    console.log('失败了');
  })
  .finally (()=>{
    console.log('finally');
  })
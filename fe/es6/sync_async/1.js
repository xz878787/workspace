//同步代码 sync
console.log('start');
//异步代码 async
setTimeout(()=>{
    console.log('222');
},1000);
console.log('end');

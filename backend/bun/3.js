//如何封装一个sleep 函数？ 2000？

function sleep(t){
    //es6 提供的 解决异步问题的api 许下诺言 
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            resolve();
        },t);
    })
}
async function main(){
    console.log('--start--');
    // await 后面接受promise 
    await sleep(1000);
    console.log('--end--');
}
 main();

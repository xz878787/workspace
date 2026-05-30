//全局作用域
{
    //代码块
    //申明了变量，属于当前块级作用域
    const name='deepseek';
    console.log(name);
}
//console.log(name);
//退出了循环
for(let i=0;i<10;i++){
    //同步代码
    console.log(i);}
    //异步代码 i 10
    setTimeout(function(){
        console.log(`This number is ${i}`);
    },1000);


//.env 文件中apiKey 读取进来？
//dotenv      
    import dotenv from 'dotenv';
    import {OpenAI} from 'openai'
    dotenv.config();

    const client = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: process.env.DEEPSEEK_BASE_URL,
});
//process ? 进程对象
// 操作系统的核心概念  
// node index.mjs 本质是启动进程
// 进程是分配资源(内存、CPU、IO)的最小单位
// node 就是process 这个全局对象
// process.env 是一个对象，包含了环境变量

   //console.log(process.env, process.env.DEEPSEEK_API_KEY, process.env.DEEPSEEK_BASE_URL);
//函数表达式
//async 修饰符 表示函数是异步的
//函数内部可以使用await 关键字 等待异步操作完成
//省略function 关键字,使用箭头函数表达式
const main = async  () =>{
    console.log('程序开始运行');

const result=await client.chat.completions.create({
    model:'deepseek-chat',
    messages:[{role:'user',content:'hello'}]
})
console.log(result.choices[0].message.content);

    setTimeout(function(){
        console.log('1秒后执行');
    },1000)
    console.log('程序结束')
}
 main();

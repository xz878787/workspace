// //.env 文件中apiKey 读取进来？
// //dotenv      
//     import dotenv from 'dotenv';
//     import {OpenAI} from 'openai'
//     dotenv.config();

//     const client = new OpenAI({
//     apiKey: process.env.DEEPSEEK_API_KEY,
//     baseURL: process.env.DEEPSEEK_BASE_URL,
// });
// //process ? 进程对象
// // 操作系统的核心概念  
// // node index.mjs 本质是启动进程
// // 进程是分配资源(内存、CPU、IO)的最小单位
// // node 就是process 这个全局对象
// // process.env 是一个对象，包含了环境变量

//    //console.log(process.env, process.env.DEEPSEEK_API_KEY, process.env.DEEPSEEK_BASE_URL);
// //函数表达式
// //async 修饰符 表示函数是异步的
// //函数内部可以使用await 关键字 等待异步操作完成
// //省略function 关键字,使用箭头函数表达式
// const main = async  () =>{
//     console.log('程序开始运行');

// const result=await client.chat.completions.create({
//     model:'deepseek-chat',
//     messages:[{role:'user',content:'hello'}]
// })
// console.log(result.choices[0].message.content);

//     setTimeout(function(){
//         console.log('1秒后执行');
//     },1000)
//     console.log('程序结束')
// }
//  main();
// ========== 1. 固定 dotenv 读取路径（解决 99% 报错）==========
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// 获取当前文件所在目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 强制从当前目录加载 .env
dotenv.config({ path: path.join(__dirname, '.env') });

// ========== 2. 测试是否读到 ==========
console.log('读到的 API KEY：', process.env.DEEPSEEK_API_KEY);
console.log('读到的 URL：', process.env.DEEPSEEK_BASE_URL);

// ========== 3. 初始化 AI ==========
import { OpenAI } from 'openai';

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL,
});

// ========== 4. 主逻辑 ==========
const main = async () => {
  console.log('程序开始运行');

  const result = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [{ role: 'user', content: 'hello' }],
  });

  console.log('AI 回复：', result.choices[0].message.content);
  console.log('程序结束');
};

main();
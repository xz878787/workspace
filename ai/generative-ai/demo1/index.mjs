//.env 文件中apiKey 读取进来？
//dotenv      
import dotenv from 'dotenv';
dotenv.config();
//process ? 进程对象
// 操作系统的核心概念  
// node index.mjs 本质是启动进程
// 进程是分配资源(内存、CPU、IO)的最小单位
// node 就是process 这个全局对象
// process.env 是一个对象，包含了环境变量

console.log(process.env, process.env.DEEPSEEK_API_KEY, process.env.DEEPSEEK_BASE_URL);

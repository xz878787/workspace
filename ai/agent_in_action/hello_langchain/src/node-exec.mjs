// node 主进程 agent 执行 js 单线程
// 调用工具去执行命令行任务 (分离出去，独立的子进程)
// node 多进程架构
// child_process 做完后，IPC (进程间的通信Inner process Communication) 告诉主进程
// 子进程
import{
    spawn // 启动一个子进程
}from 'node:child_process';
// mini cursor I/O ,命令行 
// agent tool, 自动化 
// const command='ls -al';//command  linux 命令 shell 脚本
const command ='pnpm create vite react-todo-app --template react-ts'
//切一下， 第一项 cmd , rest 运算符 所有的参数数组
const[cmd, ...args]=command.split(' ');
const cwd= process.cwd();// 当前的工作目录
// 开启子进程
const client=spawn(cmd, args,{
    cwd,// 工作目录
    // node 运行会申请这个资源，
    // bash 也会申请这个资源， 
    // 子进程继承父进程的输入输出 直接显示在当前控制台
    stdio:'inherit',//命令行
    shell :true
});


let errorMsg='';
client.on('error', (err)=>{
    errorMsg=err.message;
});
client.on('close', (code)=>{
    if(code==0){
        process.exit(0);//退出
    }else{
        if(errorMsg){
            console.log(`错误：${errorMsg}`);
        }
        process.exit(code||1);
    }
});

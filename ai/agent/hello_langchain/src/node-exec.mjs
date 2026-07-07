// node 主进程 agent 执行 js 单线程
// 调用工具去执行命令行任务 (分离出去，独立的子进程)
// node 多进程架构
// child_process 做完后，IPC (进程间的通信Inner process Communication) 告诉主进程
// 子进程
import{
    // spawn 启动一个子进程
}from 'node:child_process';

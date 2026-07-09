# MCP 

- 这里的tool 有什么问题?
1. 只能在我们这个项目里用， 不能再其他应用里面
2. node 写的， 如果用java /python/rust 写的tool呢?

tool 应该独立于 llm , 本地/ 远程 跨进程、跨语言调用

## MCP 协议
Model context Protocol
- 标准化llm 与tool 和 资源之间的通信
llm 和 tool 解耦
- 基于stdio 标准输入输出流， 键盘输入、控制台输出， 当一个进程(agent)
调一个子进程(node child_process) 或其他语言进程时， 可以通过stdio
标准输入输出流来实现通信
- http 远程通信 MCP 掌管 

不管时本地工具， 还是远程工具， agent 想跨进程调用某个工具， 通过MCP协议就行。
是给Model 扩展Context 上下文， 让他能做的更多， 知道的更多(resource)的Protocol协议
MCP 
跨本地的进程调用， 就是stdio
跨远程的进程调用， 就是http
ai agent 是 MCP 客户端， 可以通过MCP 协议调用各种MCP Server ,
client 配置添加， 实现**跨进程**工具调用
他和fetch 不同 不是接口调用 不是拿数据接口。他是扩展context

## MCP Tool
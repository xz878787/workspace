# Bun 
Bun 是比node 更快、开箱即用、零配置的js/ts 运行时+包管理器
node 优化的升级版， 性能特别好
ahthropic 收购了 用于claude code 底层

## typescript
来自微软， 是js 的超集， 添加了类型约束
js 弱类型， 经常出类型错误
- 静态类型编译  ts -> js文件 检查类型或代码错误
- ts非常强大， 已经是AI Agent 的标配
## 安装一下
powershell -c "irm bun.sh/install/windows | iex"

## js 的易错性
- 浏览器 input 输入
我们以为是数字，但其实是字符串
- + 加法和字符串拼接
- 又不报错，导致结果错误可能隐藏在系统里很久。

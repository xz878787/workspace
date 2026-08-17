# nestjs

next.js 全栈， nestjs  就是node 的纯后端企业级开发框架
默认使用 typescript 开发，全面模块化思想，适合构建企业级应用。

## 后端开发做些什么?
- 提供API 接口 web开发
- 系统集成， 并发 底层服务， AI Infra
- 微服务 
## 安装
npm i -g @nestjs/cli

nest new hello
nest run start
## 目录架构
main.ts 入口文件
app.module.ts 根模块， 引入其他模块
## 工厂模式
## 高度模块化
  约定
  App-> Module
  -> @nestjs/common Module类
  -> import 依赖项
  -》 controllers 控制器 参数校验 ，简单逻辑 最后 return
  response 
  -> service 服务， return数据

  ## 装饰器模式
  装饰器模式在不修改原有对象的前提下，动态给对象叠加额外功能。
  @
  class
## 开发流程
AppModule import 里面植入我们的
Module 是nestjs 的独立业务模块
  xx.module.ts 定义 组装
  xx.controller.ts 定义 控制器
  xx.service.ts 定义 provider 数据业务
  @Injectable() 自动依赖注入
  自动注入controller 或任何用它的地方
  controller 里的一个属性
  MVC 本质
  装饰器模式用到极致 
  - NotFoundException 
  nestjs 内置的错误类
  请说一下你是如何处理后端报错的
  try catch finally 
  nestjs 提供了各种的错误类，标准化错误输出
  status

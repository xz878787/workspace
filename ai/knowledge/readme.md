# 企业知识库全栈项目

## 目的
- 完整的将全栈Agent 项目 流程和工程理一遍

## 需求
一家本土千人规模的大型装修集团公司， 其中300人是销售。
企业资料分散在不同的系统中（erp系统、网站、各部门电脑、纸质文档）， 公司内部没有统一的知识库。沟通、培训成本高。一个销售新人需要培训2周，才能了解公司业务，服务顾客.....
1. AI 提效 
员工在权限范围内，检索资料， 完成工作
2. 数据资产
打造企业知识库，打造企业Ai大脑。

## 原型设计 

后台管理系统
AI Agent 全栈项目 
前端 react + ts
后端 nest 
- 图 1  login 
  企业智能知识库登录页 
  - 路由守卫 
  <guard>
    <guanli />
  </guard>
  - 页面布局
  layout 组件
  - ui 组件库 
  antd 企业级 后台管理系统打造
  - nestjs login api token 

### 项目初始化
- react + ts 前端 
组件思维  70% 来自组件库  30% 自定义组件 
shadcu/ui  用户端 
后台管理系统  antd  
Ant Design 是一套开箱即用、规范统一的企业级组件库 ，
它大幅降低后台管理系统的开发成本、统一UI交互，让开发者聚焦业务而非基础界面 
pnpm i antd
- 全局样式配置 国际化
- 路由配置
  - 路由懒加载
  用户系统， 要做， 每天很多新用户， 用户体验非常重要
  后台管理系统， 自己人用， 自己人每天用， 前端缓存解决了， 没有那么必要
- 路由守卫
  - Guard 组件 
  - hooks useAuth
  - 配置路由
- 自定义组件 BrandLogo 
  SVG 图标 数学图形绘制， 不会失真

#### nestjs 后端 
- docker-compose.yml
Docker Compose 通过 yaml 文件定义多容器服务，一键编排、启停整套应用。
  1. psql + vector
  关系型数据存储（用户、文档元数据、权限等）和向量储存(embedding)
  psql 容器启动 + 初始化
  psql 官方镜像约定 容器首次启动时（数据目录为空）， 会自动执行挂载到
  /docker-entrypoint-initdb.d 目录下的所有 .sql/.sh 文件
  映射到项目目录 init-scripts/postgresql/init.sql 文件
  init.sql 做了三件事
  - 建表
  - 预制种子数据 seeds 
  2. mongodb
  psql 关系型数据 
  mongodb 非关系型数据 NOSQL 
  擅长存储非结构化数据， 如 文本、图片、视频等
  psql 关联高频查询， 如果原文档（kb/mb 比较大）也放，性能不好
  文档的元数据放psql, 文档内容放mongodb 等到详情页， 可以根据id 关联查询
  init.js  建了文件表

## 表关系
### RBAC 权限管理（Role-Based Access Control，基于角色的访问控制）
- kh-user 用户表 
- kh-role 角色表
- kh-role_user 角色用户关联表
  多对多 
  一个用户可以有多个角色， 一个角色也可以有多个用户。
- kh_permission 权限表 和用户表解耦 
  parent_id 树状结构 用于多级权限展示， sort 排序
  permission_type 不同类型的权限 
  1 菜单权限 
    menu_url  null
  2 接口权限
    api_url   null
  3. 操作权限 


- kh_role_permission 角色权限关联表
- kh_user_permission 用户权限关联表 单独给某用户开设权限 

## dto 校验
data transfer object 数据传输对象
路由 -> 控制器 之前， 会根据dto 校验用户输入
class-validator 提供类型校验的装饰器 

## 双token 机制 
- 单token机制 JWT 
  用户， 提交登录表单  username + password 
  后端验证成功 user 对象  -> jwt 颁发一个token(加盐) -> Bearer + token -> localStorage 
  前端每次请求， 都在header Authorization 里带 Bearer + token 
  后端验证token 有效，verify token  接触token 里的用户对象 

- cookie + session 传统的登录
  cookie 请求头 每次请求的时候会自动带sessionId，   
   sessionId -> session 存储在后端
  后端根据sessionId 从session 存储里获取用户信息

- **客户端适配**：Cookie 受浏览器同源限制；JWT 放请求头，适配 APP、小程序、前后端分离跨域场景。
- **状态**：Cookie-Session 是有状态，服务端要存会话；JWT 无状态，服务端不用维护会话，分布式部署更简单。
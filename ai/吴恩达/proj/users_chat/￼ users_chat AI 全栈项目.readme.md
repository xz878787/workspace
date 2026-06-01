# users_chat AI 全栈项目

- 后端+ 前端目录创建
    目录->全栈项目->协同形式（前端分离+古法编程）->模块化

    ## 模块化 module
    - 一个函数只做一个功能
    - 一个文件只写一个类/模块
    - 一个文件夹只负责一个模块/架构
    ### 优势是
    - 好维护
    - 高质量
       可读性、简单可靠
## js
前端，后端，ai，嵌入式.....

## users 项目需求 
- 后端 
    users 相关的数据接口 API Application Programming Interface
http://localhost:3000/users用户列表资源
http://localhost:3000/users/:id动态路由 某个用户的详情
### restful 设计模式 暴露资源
- 设计url 的范式
    域名:端口 某台服务器的某个服务
http://localhost:3000/users
http://localhost:3000/books
http://localhost:3000/posts
    http://localhost:3000/posts/:id 某篇文章

    -http的动作 
    CRUD 增删改查
    GET Read http://localhost:3000/users 某个用户的详情
    POST  Create http://localhost:3000/posts
    Put/Patch Update
    Delete Delete
    - js node 后端初始化
npm init -y
package.json 项目描述文件
    npm node package management
node包管理器
    npm i json-server
     ##  数据存储
    - 数组
    -长期存储、对象 内存中的数据容器
    数据库 mysql 
    json 文件 JavaScript Object Notation {key:val...}
        excel csv 文本 pdf....

        ## 前端三剑客 模块化
        html 结构
        css 样式
    js  行为
### html
- 盒子
    块级的能力  宽高
    PC 业务 固定的宽度 左右留白
    container 设备 电脑屏幕尺寸
- 语义化标签
    div.container(盒子) > nav + main + nav 
    不要div 满天飞 nav/main 拒绝用div 
    语义化的标签 除了盒子功能外， 自带语义
    - 可读性更好 有利于维护
    - 搜索引擎优化 SEO  爬虫看的 
        百度/google 爬虫 爬取网页 分析DOM结构
- DOM 模型
    Document Object Model 
    - Document 
    html document 文本 
    text/plain
    html 标签 a img h1 http 传输的超文本传输协议一种文本格式 
    text/html
    <!DOCTYPE html>//doucument 是html
    !  html5 版本的标记
-  DOM树 
    html 是根节点
        body 可视区的开始节点
            header
            .container
                nav
                main
                nav
            footer
- Object Model?
    html 通过浏览器（html parser c++）的树状结构，在内存中
    建立了全局的Document对象
    通过Document 对象可以 操作html ,动态改变页面
    DOM 编程
    document.querySelector 树的查找 
    id 很快 唯一 索引
    .table 次之 
    标签 最慢 

- 内容
    行内
       ## prompt
       - 加上模块化的约束
       - 请你帮我设计Users 用户接口，请遵守restful 机制
       - 请帮我编写首页，使用bootstrap css 框架，使用语义化标签。

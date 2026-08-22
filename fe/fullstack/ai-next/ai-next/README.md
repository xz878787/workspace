1. 文件系统的路由映射
page.tsx
loading.tsx 布局，共享的
loading.tsx 加载UI
not-found.tsx 404页面
error.tsx 错误页面

目录映射 目录名直接映射到URL 路径

3. Link 组件
-  他是客户端导航， 无需刷新页面。(前端路由)
Hash, HistoryRouter 局部刷新
还是要请求后端的， 只是不整页刷新(白一下)。
前端导航是，next.js 会自动发一个RSC payload(React Server Component 序列化)

- 预加载可连接的页面，提升速度
<link rel="prefetch" href="/blog" />
浏览器空闲时就会提前下载目录页的数据， "秒开"
资源预加载
 
 dns domain system key:value 分布式数据库
 domain  -> ip 查询 (电信服务商)， 解析时间              性能优化，预加载









<!-- 

 帮我创建一个about页面，将nextjs
 帮我创建一个404页面，
 帮我创建一个blog显示页面， 可以显示两篇blog的卡片
 帮我在 `d:\workspace\sw_ai\fe\fullstack\ai-next\ai-next\app\layout.tsx` 顶部导航栏上加上about和blog的链接
 完成点击两篇文章的页面， 用slug mock 数据渲染文章
 请使用shadcn/ui的按钮组件去替换所有的按钮 -->
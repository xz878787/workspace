# Next.js + AI 

基于React的全栈开发框架， 最好的Ai 全栈框架，为全栈开发叠加了上下文buf。

## 什么是框架？ Framework ?
想像为一个建筑蓝图/工具箱 ，不需要从0开始盖房子。
而是提供了地基、墙壁和屋顶的一个基本架构。
以前是为开发者所有，现在是AI 也可以用。
我们只需要关注组装和装修这个房子， 关注业务。
## js 和React  库
返回JSX 的函数， 响应式状态
把开发者从低级的前端API 命令式流水线编程，
通过现代前端库React/Vue MVVM ，直接写业务就好。

const [count, setCount] = useState(0)
<>
  {count}
  onCLick={setCount(count++)}
<>
## Next.js 基于React 的最好的面向AI的全栈框架， 
AI 上下文 = 组件 + 响应式业务 + 服务器端渲染 + api 
不使用框架：散乱的积木和工具
- 图片放哪里？ /public 
- 页面文件放哪里 /app
- 组件放哪里？ /components
使用框架 预制的乐高积木 提供了一系列的约束最佳实践，和AI SDD 文档上下文不谋而合。

开发效率大大提高， 常见功能内置好，文件放在哪里， 请求方法放哪？
框架提供基础结构， 开发者专注于**业务**逻辑。AI FDE harness 落地。
使用框架，也给 AI一套约束， 一套上下文。AI能够更高效的根据框架给的
约束开发项目。

## 为什么选择next.js ？
- 传统的前端开发框架， 前端和后端开发是分离的，
react +Java/Python  两种语言， 上下文切换成本
- clauded code/ codex 支持最好
 约束，简化(csr ，ssr) 开箱即用
- 生态超级丰富
  - shadcn/ui 组件库
  ElementUI ANTD ...
  vibe coding 写组件， 引入上下文

  - tailwindcss 
  原子类名 自带语义， 特别适合AI 学习
  AI 语义理解能力
  - vercel 公司
  全球唯一一家JS 栈 AI coding Agent 以及Ai 生态的技术公司
  快捷发布 域名二级， 绑定域名。

  ## 创建项目
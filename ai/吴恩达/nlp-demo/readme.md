# Prompt 做NLP 任务开发

- 有哪些东西可以模块化？
import from
export default 
  - 维护和可读性
  - 好复用  引入
- 项目的模块化搭建
  - main.mjs 单点入口 (鉴权、路由)
  - client.mjs client 对象 
  - completion.mjs 完成任务 
  
  ## es6 语法特性
  es6 是javascript 在2015 年推出的新版本，变化比较大，目标是让js 成为一个企业级大型项目开发语言
  - let const 声明提升bug ，支持块级作用域
    let const 不能重复声明， const 简单数据类型不能重新赋值，
    复杂数据类型可以重新赋值，但不可以改变其指向的内存地址（类型）
  - ... res 运算符  收 | spread 展开运算符
  - 解构赋值
    - 对象
    - 数组 简洁且性能好
    - 模块化 esm 模块
    - import from 
    - export default
    - export  

    ## nlp 任务
    - 情感分类  
    正面 | 负面 | 中性
    电商等行业中非常重要 客户服务、预警、产品质检等
    后台 
    - 信息提取 information extraction
    - 主题推断 
    - 文本总结 summarization
    老板、行政岗、小编 需要对长文本进行总结，提取出信息，减少工作量
    仅用几分钟，我们就可以构建多个用于对文本
    进行**推理**的系统，而以前需要熟练的机器
    学习人员数天到数周的时间(平等)。
    让我们兴奋，可以使用Prompt 构建nlp系统 
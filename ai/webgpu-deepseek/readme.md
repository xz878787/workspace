# webgpu-deepseek
## huggingface
AI 圈最火的开源模型社区， 各个厂商把AI模型发布到这里。
modelscope

transformer.js
web 访问 id 远程下载，访问，并执行nlp 任务。
场景


deepseek deepseek-r1-distall-qwen 1.5B 文件上传-> huggingface
-> transformer.js-> load -> web 下载到浏览器本地(慢) -浏览器缓存
-> webgpu (新特性，兼容性)-> nlp 任务

## 安装依赖
- @huggingface/transformers
  js 版本的transformers 库，用于加载模型，执行推理
  - "marked": "^15.0.5",
  aigc 返回的是markdown 格式文本， 有利于在文本中表示一定的格式， 比如代码，加粗，引用等。
  显示到页面前需要把md文档 格式转换成html格式， 才能在浏览器中显示。

   更简洁 
  # <h1></h1>

  ## 引入webworker
  个人介绍， 聊一下自己的项目 webgpu-deepseek 
  怎么学系? 看《你不知道的javascript》，掘金社区，关注一些AI博主 github看源码， 输出内容到社区

  ## ！！(navigator as any).gpu
  gpu 报错， 比较新， 实验阶段的属性， ts  没有很好的识别Navigator 类
  any 的原生类型 任意类型， 不要乱用， 会泛滥。
  用于忽略ts 类型检查
  别的方式?
  ### ts 类型类型的底层
  ts 里有专门的申明文件， @typs/webgpu 本质是缺失类型声明文件
  pnpm i -D @webgpu/types 安装类型申明文件 开发依赖
开发阶段ts ，打包阶段js。

tsconfig.json typescript 配置文件  根据项目需求做各种

## 设计模式
OOP 面向对象编程，总结出来的23种解决特定问题的模式。
数据结构， ADT
面向设计， 而不是实现 Design Pattern
##  单例模式
类只实例化一次， 全局只有一个实例。
用于解决全局变量的问题， 以及全局状态的问题。

OOP 大型企业级项目， 类的管理和设计模式应用。


## load
- 空值合并运算符
??= 用于在变量为null 或 undefined 时， 
如果变量为false 或其他值， 则不赋值。
用于避免重复赋值， 保持变量的原始值。AutoTokenizer.from_pretrained 
开销比较大
- web 异步下载
AutoTokenizer.from_pretrained  promise
文件比较大，文件chunk 慢慢到达，  提供一个process_callback
AutoModelForCausalLM.from_pretrained  promise
Promise.all()
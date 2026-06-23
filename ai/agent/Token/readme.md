# Token

## 怎么学习llm ?
###  先搞懂AI是什么
- 吴恩达
AI for Everyone
Generative for Everyone
AI Promptoing  For Everyone
- Karpathy
  tesla 总监 OpenAI gpt3的作者 
  3 小时 大模型入门视频
  讲透大模型原理
  [深入chatgpt这样的模型](https://www.bilibili.com/video/BV16cNEeXEer/?spm_id_from=333.337.search-card.all.click&vd_source=19dea2d6e1dfcae122ca9315d761ad9e)

  Transformer架构(google )、Attention机制(注意力机制)、
  微调(fine-tuning) ...
  理论高级篇
  ## 动手用起来
  把日常重复性工作交给AI
  - cc, codex
  - notebookllm google 出品的RAG 
  google 账号
  梯子
  超级学习AI工具
  - Obsidian  第二大脑
  ## 做个人作品
  - vibe coding 一个完整的项目
  网站、小程序、客户管理工具
  Agent 开发
  ## 关注
  - 晓辉博士 专业深度
- 42章经
- 宝玉AI  Prompt Enginner 
- 归藏 AI 产品




  ## 分词 Tokenization
  -llm 计价和工作的最小单位
  1 个英文字符 大约 0.3个token
  1 个中文字符 大约 0.6个token
  百万token 几人民币
  - 为什么必须分词？
  输入的是Prompt文本 
  根据上一个词，预测下一个词
  词之间的语义相关性 计算
  数学？
  神经网洛只能处理数字(向量、矩阵)， 看不懂中文、英文等字符(主要是
  由计算机的底层运行机制和模型训练的效率决定的)。
  必须把文字转为一串数字离散符号ID ,token 。 
  
  ## token demo
  - js-tiktoken
  js-tiktoken 是无 WASM 依赖的纯 JS 库，复刻 OpenAI BBPE 分词规则，用于前端 / 边缘环境精准统计 GPT 系列模型 token。
  npm init -y
  pnpm i js-tiktoken
  文本编码为token
  解码token为文本
  输入的tokens + 输出的tokens  = 总token数
  ## Embedding
  大模型不能直接处理文本，先tokenizer, 再embedding
  文本 切割为token(大的文本理解任务切割为小的文本理解任务， llm的处理性能)  不能切成字符，没意义
  token 可以想成一个单词，但也不完全是单词， 
  cl100k_base(gpt 官方的token编码器)
  文本 -> cl100k_base映射规则(不一定是word,而一定是token ) token ID 215 100k 

  理解语义， 神经网洛计算， 相似度 

  embedding 文本嵌入(向量化)  llm emdedding 接口
  1024 -1->1 的范围

  和神经网洛知识embedding , 相似度计算

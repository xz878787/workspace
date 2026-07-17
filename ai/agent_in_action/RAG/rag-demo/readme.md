#  RAG 
Retrival Agument Generation
Retrival 检索器 名词
知识库 -> 先embedding 基于数据向量库 -> 检索器(embedding +行速度+prompt embedding)


## langchain  RAG 业务能力
开箱即用的llm 开发框架
- @langchain/openai  ChatOpenAI Embedding
- @langchain/core/documents
  embedding 的最小单元
  知识库 由文件(文本、声音、图片、视频等) 构成
  某个段落的文字 有我们要
  {
    pageContent:'要单独embedding的文本'
    meta:{元数据 不做embedding 的
        ...
        link:'http://www.baidu.com',
        author:...
    }
  }
  documents .... 简单放内存  复杂 ， 发向量数据库
  - @langchain/classic llm 以来  langchain 的经典常用模块
  MemoryVectorStore 内存向量存储

  检索器=(知识库-> 文档-> documents-> embedding-> memoryVectorStore)
  invoke()

  AI 发展太迅猛 langchain 版本更新太快， 看文档

- retriever.invoke(3) top_k
在相似度查询的基础上， 还会做去重、 过滤、 rerank  等
- vector.similaritynSearchWithScore(3) 只做向量查询 
score 会表达内容的质量 增加高质量的数据， 向量化 
# Elastic Search

- 基于Milvus 向量数据库 靠卖大米线性的RAG
- 基于LangGraph 实现闭环的Agentic RAG ,也就是Agent 自主决策要不要检索， 用什么检索(web search+milvus+es),  信息够不够，效果怎么样，
要不要重新搜。
具体的Agentic RAG 要根据业务场景设计， 理解这个闭环的思路就可以。

向量数据库有个问题
专业属于、精确实体更适合关键词检索，
=== 关键词
like embedding 

混合检索= es 关键词检索+ milvus  相似度检索
mysql 行列 ， milvus 语义  es 关键词索引哪个  id 
解决方案：
- 同时结合关键词检索和语义检索， 由模型统一融合多路结果， 提升
专业场景的准确率。

关键词检索的服务

## Elastic Search
实现全文检索的。
Mysql **原始**数据的， es 是特种兵（关键词检索）
- es 9200 存放的是索引
- kibana 类似于phpMyAdmin 之于Mysql
kibana 可视化查看es









GET /_cat/indices?v&h=health,status,index,doc.count


PUT /article
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text"
      },
      "content": {
        
          "type": "text"
        
      },
      "author": {
        "type": "keyword"
      },
      "createTime": {
        "type": "date"
      },
      "viewCount": {
        "type": "integer"
      }
    }
  }
}

GET /article/_mapping

GET /article/_settings

DELETE /article

## 新增POST， 修改PUT
POST /article/_doc
{
    "title":"Elasticsearch 全文检索入门",
    "content": "ES 基于倒排索引与 BM25 实现全文索引， 适用于文本检索场景",
    "author": "后端开发",
    "createTime":"2025-09-14",
    "viewCount":120
}

## 新增POST， 修改PUT
POST /article/_doc/1001
{
    "title":"RAG 混合检索实战",
    "content": "ES 负责关键词检索，Milvus负责向量语义检索，结合使用更佳",
    "author": "AI开发",
    "createTime":"2025-09-14",
    "viewCount":236
}
GET /article/_doc/

GET /article/_search
{
  "query":{
    "match":{
      "content":"检索"
    }
  }
}

GET /article_search
{
  "query":{
    "term":{
      "term":{
        "author":"AI开发"
      }
    }
  }
}
GET /article/_search
{
  "query":{
    "multi_match":{
      "query":"检索",
      "fields":["title","content"]
    }
  }
}
GET /article/_search
{
  "_source":["title","author"],
  "query":{
    "match_all":{"检索"}
  }
}
GET /article/_search
{
  "form":0,
  "size":10,
  "sort":[
    {"viewCount":"desc"}
  ],
  "query":{
    "match_all":{}
  }
}

POST /_analyze 
{
  "analyzer":"standard",
  "text":"Elasticsearch RAG 混合检索知识库"
}
GET /_cat/plugins?v  
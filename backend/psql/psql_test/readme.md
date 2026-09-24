# PostgreSQL: AI 时代**最适合**的数据库 
Mysql + Milvus = Pg 

关系型数据库是互联网应用的基石。 
账号信息、订单数据、聊天记录 、业务数据 几乎都是依赖关系型数据库存储。

## 消息长时记忆 PG来做 
豆包、Codex 等Agent， 都要长期存储聊天记录 
数据表怎么设计 
- 用户表
  user_id
- 会话表 title
  一对多 
  user_id 关联用户表
  获取所有的会话列表 
- 消息表messages 
  点击某个会话
  取出当前会话所有的messages 

## SQL
SELECT *
FROM conversations
WHERE user_id="你的用户ID";

SELECT *
FROM messages
WHERE conversation_id="你的会话ID"
ORDER BY created_at ASC;


MYSQL， PG 流行的关系型数据库 
AI时代， PQ优势更大
只需要在原来的消息表上， 多加一个向量字段（Mysql不支持 ）， 不需要额外的数据库，
不需要**双写**， 不需要维护两套系统 

内连 inner join 
  交集
外链接
  left join
    左边表为主 右边没有 NULL 
  right join 
    右边表为主， 左边没有 NULL
  full join 
  并集

SELECT m.*
FROM messages m
JOIN conversations c 
ON m.coversation_id = c.id
WHERE 
  c.user_id='你的用户id'
AND c.id = '你的会话ID'
ORDER BY
  m.embedding <=> '[1.2, 0.5, 0.8, ....]'
LIMIT 5;
按用户过滤、按会话过滤、按时间过滤、按语义检索
AI时代最需要的能力
不用拆分架构、不用同步数据、不用写复杂的关联逻辑
一张表、搞定传统关系查询+AI长期记忆

`<=>` 是 pgvector 里的**向量余弦距离运算符**
向量余弦距离 = 1 - 向量余弦

## ORM 
开发不写SQL, ORM 操作数据库。
typeorm node orm 库
nestjs 特色 1. MVC模块化 2. 依赖注入 
## ORM 操作流程
1. 数据库全局配置
2. nest g res conversations --no-spec 
  自动创建资源型的 conversations 模块
  restful  CRUD 基本方法 
3. nest mvc模块化
  - module 声明
  - controller 控制器 
    装饰器  路由
  - service
    数据操作
4. entities 
  实体类  八股文  表的映射
  orm 需要 
5. dto  
  data transfer object 
  前端提交表达 
  前端 params, queryString 
  约束提交规则 如果不行就直接报错， 退出
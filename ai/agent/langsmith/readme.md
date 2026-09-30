# LangSmith 全链路观测：从Agent 调试到RAG量化评估

## trace 追踪
langchain\langgraph 开发Agent，强烈的“盲盒感”

调用了哪个工具？每一步耗时多少？流式的Token，消耗了多少token？

如果你无法度量它，你就无法管理它。

给Agent 加上全生命周期的客观观测性， LangSmith 是不可或缺的仪表盘。
## 核心功能
- Tracing 追踪bug，调试agent
  每次agent 的执行
- Monitoring
  Agent 后台实时监控
  llm token 开销，时间，工具
- Datasets
  数据集，问题-回答对
- Evaluators
  评估器，评估agent 的回答
  
langsmith trae graph 的运行， 考到了整体统计的monitor 数据  
ahent 运行情况一目了然 方便接入全链路的观测
对业务效果做标准化评估
  Dataset ，测试样本， 统一存放用户提问和标准答案(搭建数据集)
  再通过Evaluation 设定打分，  批量弯沉自动化pincers， 靳准衡量回答质量， 优化agent 的回答
 
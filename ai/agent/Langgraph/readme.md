# Langgraph

## 为什么需要多Agent、
复杂的Agent 产品基本都是多Agent 架构。
- langchain 工作流编排 线性的
- langgraph 工作流编排 网状的 
- 上下文的开销
单agent 架构下， 所有tool 的描述， 功能的prompt 都放到system prompt 里。
实际上执行每个功能只需要一部分prompt ，但是每次都带上。
token 消耗更高， 更重要的是很多无关消息的干扰， 思考效率低且容易出错。
- 如何拆分多个Agent?
每个Agent 只保留需要的Prompt，
无关信息干扰， 准确率更高。

Agent = LLM(大脑)+ Harness(tool+mcp+rag+skill.. +...)
单Agent 只有一个llm 大脑  需要一步一步思考， 调用tool
规划   
多Agent 多个大脑， 并行思考
主Agent 下发任务， 子Agent 并行处理完成后返回
每个大脑需要选择适合的模型
agent 组合式， 编程agent 负责写代码， 让测试agent 编写测试代码TDD
让 验证Agent 验证代码是否符合预期。 告诉主Agent 通过了、

基于三个原因

- 决策准确率高， token 消耗更低。
每个Agent 只要带必要的最小Prompt ，没有冗余信息干扰。
调用llm 次数多， 但更省token。
- 并行思考和任务处理
主管分派子任务，子Agent 并行处理，整体效率更高
- 多角色互相讨论，纠错能力更强。 AutoGen  法庭

## Langchain -> LangGraph
- llm api ， document loaders ,splitter , embedding, vector store ,output parser memory ... 基础模块
- langchain 线性工作流编排
- langgraph 网状工作流编排
- 工作节点+ 组织方式(api)
- 简单Agent -> 复杂多Agent 协作 。

## 网状的工作流编排  API
- 初始节点
初始状态
- 工作节点
职责  状态state
- 连接工作节点
边
- 工作节点
最终状态
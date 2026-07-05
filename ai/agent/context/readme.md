# 上下文工程 Context Engineering
22-23 Prompt Engineering 不确定性， 正确的胡说八道 AIGC 基于预训练数据 一部分 通过设计完美的提示词， 升级到工程化的级别。 chatgpt github copilot AIGC coding 代码建议 我们开发， AI 提效 gpt 3.5

24-25 Context Engineering llm 幻觉 补全上下文 上下文工程 更靠谱 更准确 不是直接利用预训练数据回答，在回答前， 去先检索一些资料 ，加到prompt 里面 cursor /trae / 法律专家RAG cursor 基于vscode 又干掉了vscode 将我们的整个代码库作为上下文（技术架构，代码风格，功能模块 ... ） 让它去开发， 我们辅助

25-26 Harness Engineering claude code codex 小龙虾 记忆力不如(token 太费) 爱马仕 hermes llm 非常牛逼， claude 4.6 gemini 3 有如千里马， 用上马鞍、缰绳， 指定的环境和场景中跑的又快又好。

规则， llm 围栏 安全， 可靠， LOOP , SKILLS, mcp 类似传统软件 确定性交付的工程化

llm 工程化终于在 25-26 年，成熟了， 各个企业都拥抱AI 数字化， FDE被大量需要。

即使写出最完美的提示词， 也可能得不到好结果。 为啥？ AIGC transformer 架构 根据预训练知识预测 LLM GPT 5 Gemini 3 AI 进化了， 现在的MCP SKills 。。。。 早期需要详细且准确的指令， 现在随着AI 的发展，没有那么依赖了。

chatgpt 生成代码， 身份， 详细准确的任务， 分步骤， 例子，.... 长且工程化设计的Prompt , 大大提升生成代码的质量？

cursor/trae/cc 简单 的prompt 就可以完成之前的复杂prompt 的还要好

llm 更强大了 推理能力
AI和人类已经交互了数年， 积累了海量Prompt数据
openai, google, claude, 新的强大模型 用户的prompt 不是拿去直接生成的， llm 会自动优化你的提示词， AI 已经理解了 人类常见的需求模式。
上下文技术
用户prompt -> (llm 优化后的prompt、上下文技术、mcp、skills ) -> transformer 生成-> Loop Engineer + harness Engineer -> FDE (AI 工程落地)

上下文工程（Context Enginnering） 本质不是写一句提示词(prompt), 而是为AI 搭建一个包含 “背景、约束、规则”， 目的是准确、靠谱的完成AI任务。 RAG 是上下文工程中最可笑、最高阶的应用场景之一。


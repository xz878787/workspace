# Agent 开发实战笔记：从 LLM 到可用 Agent 的完整路径

## 核心结论

**Agent 的本质是给 LLM 补上它天生缺失的五种能力——Memory、Tool、RAG、MCP、Skills——从而把一个"只能聊天的大脑"变成一个"能记住上下文、能动手执行、能检索私有知识、能获取实时信息、能编排复杂任务"的智能体。**

一句话：

```
Agent = LLM + Memory + Tool + RAG + MCP + Skills
```

一个比喻：**LLM 是一个刚毕业的天才研究生——脑子聪明但没工牌没电脑不知道内部流程；Agent 是给他配齐了工牌、电脑、内部 Wiki、同事通讯录之后的正式员工。** Claude Code、Cursor、Manus 这些最值钱的 AI 产品，本质上做的都是这件事。

---

## 论点一：公式不是拼凑——每个模块对应 LLM 的一项天生短板

| LLM 天生缺陷 | 具体表现 | 对应模块 |
|---|---|---|
| **无状态（Stateless）** | 每次对话都像初次见面，无法积累上下文 | **Memory**（数据库/Redis/前端存储） |
| **无执行能力** | 能说"应该怎么做"，不能真的去读文件、调 API | **Tool Use**（LLM 输出指令 → 运行时执行） |
| **无私有知识** | 训练数据里没有你公司的 API 文档、代码库 | **RAG**（检索增强生成，把私有知识注入 Prompt） |
| **知识有截止日期** | 不知道最新新闻、实时股价、刚发布的库 | **MCP / 第三方 Tool**（通过协议接入外部实时能力） |
| **无法编排长任务** | 单轮问答粒度太粗，真实工作都是多步骤的 | **Skills**（把多个子任务组合成可复用的技能流） |

五个缺陷互斥且穷尽（MECE），合在一起覆盖了从"聊天"到"干活"的全部能力缺口。反过来也成立：**如果一个 Agent 缺少其中任一模块，它一定在对应场景里露馅。**

---

## 论点二：Tool 调用是 Agent 的核心机制——`while` 循环 + `Promise.all` 并发

在所有模块中，**Tool 最最关键**——它是 LLM 从"能说"变成"能做"的分水岭。下面用真实的 `src/tool.mjs` 代码来把整个机制讲透。

### 2.1 Tool 的结构

一个 Tool 由两部分组成：处理函数（干活的）和描述对象（让 LLM 知道什么时候调、怎么传参）。

```js
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import fs from 'node:fs/promises';

const readFileTool = tool(
  async ({ filePath }) => {
    const content = await fs.readFile(filePath, 'utf-8');
    console.log(`[工具调用] read_file(${filePath}) 成功读取 ${content.length} 字节`);
    return content;
  },
  {
    name: 'read_file',
    description: `用此工具来读取文件内容，当用户要求读取文件、查看代码、分析文件内容时，调用此工具。输入文件路径（可以是相对路径或绝对路径）`,
    schema: z.object({
      filePath: z.string().describe('要读取的文件路径'),
    }),
  }
);
```

三条设计约束：
- **处理函数必须是 async**：读文件、调 API、查数据库都是异步操作，同步阻塞会让整个 Agent 卡死。
- **description 决定准确率**：LLM 靠自然语言判断调用时机，场景覆盖越全，误判越少。
- **schema 是调用契约**：LLM 必须按 Zod schema 约定的格式传参——契约不清晰，调用必失败。

### 2.2 绑定 Tool 到模型

LangChain 提供了统一的 `bindTools` 抽象，不关心底层模型是 OpenAI、DeepSeek 还是其他：

```js
import { ChatOpenAI } from '@langchain/openai';

const model = new ChatOpenAI({
  modelName: 'deepseek-v4-flash',
  apiKey: process.env.DEEPSEEK_API_KEY,
  temperature: 0,
  configuration: {
    baseURL: 'https://api.deepseek.com/v1',
  },
});

const tools = [readFileTool];
const modelWithTools = model.bindTools(tools);
```

**这就是 LangChain 的核心价值**：`bindTools` 屏蔽了底层模型差异，一套代码兼容多家模型。用 DeepSeek 还是 OpenAI，改个 `baseURL` 即可。

### 2.3 核心调用流程：`while` 循环实现多轮 Tool 调用

这是整个 Agent 最关键的机制。**LLM 具有"自知之明"——当它判断需要调用 Tool 时，不硬编答案，而是生成 `tool_calls` 声明"我需要调这些工具"。**

```js
import { HumanMessage, SystemMessage, ToolMessage, AIMessage } from '@langchain/core/messages';

const messages = [
  new SystemMessage(`
    你是一个代码助手、可以使用工具读取文件并解释代码。
    工作流程：
    1. 用户要求读取文件时，立即调用 read_file 工具。
    2. 等待工具返回文件内容。
    3. 基于文件内容进行分析和解释。
  `),
  new HumanMessage('请读取 src/tool.mjs 文件内容并解释代码'),
];

let response = await modelWithTools.invoke(messages);
messages.push(response);

while (response.tool_calls && response.tool_calls.length > 0) {
  console.log(`\n[检测到 ${response.tool_calls.length} 个工具调用]`);

  // 关键：Promise.all 并发执行所有无依赖的 Tool
  const toolResults = await Promise.all(
    response.tool_calls.map(async (toolCall) => {
      const tool = tools.find(t => t.name === toolCall.name);
      if (!tool) {
        return `错误: 找不到工具 ${toolCall.name}`;
      }
      console.log(`[执行工具] ${toolCall.name}(${JSON.stringify(toolCall.args)})`);
      try {
        const result = await tool.invoke(toolCall.args);
        return result;
      } catch (err) {
        return `错误: ${err.message}`;
      }
    })
  );

  // 用 tool_call_id 把每个结果精确对应到每个调用
  response.tool_calls.forEach((toolCall, index) => {
    messages.push(new ToolMessage({
      content: toolResults[index],
      tool_call_id: toolCall.id,
    }));
  });

  // 把 Tool 执行结果交还给 LLM，让它继续推理
  response = await modelWithTools.invoke(messages);
  messages.push(response);
}
```

**这段代码揭示了四个关键设计决策：**

**决策一：`while` 循环而非 `if` 判断。** 真实场景中 Agent 可能需要多轮工具调用——读完 A 文件后 LLM 发现还需要读 B 文件。`if` 只处理一轮，`while` 让 LLM 反复决策"还需要调工具吗"直到它认为信息足够，直接生成回复。这才是 Agent 自主性的体现。

**决策二：`Promise.all` 并发执行。** 同一轮中多个 Tool 互不依赖，就必须并行。串行总耗时 = `t1 + t2 + ... + tn`，并行总耗时 = `max(t1, t2, ..., tn)`。在文件 I/O、网络请求场景下，差距可能是数倍。

**决策三：`tool_call_id` 精准对齐。** 一次任务可能涉及多个 Tool，且异步返回顺序不确定。LLM 靠 `tool_call_id` 把每个 `ToolMessage` 精准对应到它发出的每个 `tool_call`——没有这个机制，上下文必然乱掉。

**决策四：错误处理不容忽略。** 两个容错点：一是 `tools.find` 找不到工具时返回友好错误而非 crash；二是 `try/catch` 包裹 `tool.invoke`，工具执行失败时返回错误信息，让 LLM 自己决定下一步怎么办。

### 2.4 消息循环的底层模型

```
HumanMessage  → 用户："帮我读这个文件"
AIMessage     → LLM："我需要调 read_file，参数如下…"（停住，不编答案）
ToolMessage   → 运行时："这是文件内容……"（带上 tool_call_id 对齐）
AIMessage     → LLM："好的，基于文件内容，我的分析是…"（或继续调更多工具）
```

LLM 每次 `invoke` 都是在已有 messages 的历史上下文上做推理，所以 `tool_call_id` 的正确性直接影响 LLM 是否能正确理解上下文。

---

## 论点三：Agent 的扩展方向——CLI 工具让 Agent 真正"动手"

文件读写只是 Tool 的起点。**真正让 Agent 产生实用价值的，是 CLI 工具——让 Agent 能执行 shell 命令。**

`src/node-exec.mjs` 中建立的方向是：用 Node.js 的 `child_process` 模块把命令行执行拆到独立子进程：

```js
import { spawn } from 'node:child_process';
// 子进程执行 CLI 命令 → IPC 通信告诉主进程结果
// Node 多进程架构：主进程负责 Agent 调度，子进程负责执行命令
```

这意味着你可以把任何 CLI 操作包装成 Tool——`npm install`、`git log`、`docker ps`、`curl API`。Claude Code 本质上就是这么做的：**LLM + fs（文件系统 Tool）+ CLI（命令行 Tool）**。

推演一个更日常的例子——"用 React + Vite 创建一个 TodoList"：

1. LLM 调 CLI Tool → `npm create vite@latest`
2. LLM 调文件写入 Tool → 生成组件代码写入 `src/App.jsx`
3. LLM 调 CLI Tool → `npm run dev`

**每一步都是一个 Tool 调用，`while` 循环串起整个任务。** Agent 和 ChatBot 的区别，不在于底层模型多强，而在于有没有装上能执行操作的 Tool。

---

## 论点四：这个公式已被真实产品验证

| 产品 | 拆解 | 本质上做了什么 |
|---|---|---|
| **Claude Code** | LLM + fs + CLI | 把文件读写和命令执行做到极致 |
| **Cursor** | LLM + fs + LSP + CLI | 加上了代码智能感知 |
| **Manus** | LLM + Browser + CLI + Memory | 加上了浏览器操控和记忆 |
| **ChatGPT** | LLM + WebSearch + CodeInterpreter + Memory | 加上了搜索和代码执行 |

它们都遵循同一个公式——**在一套稳定的 LLM + Tool 调用循环之上，各自叠加不同的 Tool 和 Memory 能力，形成差异化产品。**

---

## 落地技术栈

```
Node.js（NestJS 后端）
  + LangChain（单 Agent：统一 LLM 接口 + Tool 抽象 + Message 管理）
  + LangGraph（多 Agent：当单 Agent 不够用时做多 Agent 编排）
  + MCP / RAG / Skills（扩展能力层）
```

三层边界清晰：
- **NestJS**：传统后端——路由、数据库、中间件、权限。
- **LangChain**：AI 层抽象——`@langchain/openai` 兼容各家模型，`bindTools` 屏蔽底层差异，`@langchain/core/tools` + Zod 做工具验证。
- **LangGraph**：多 Agent 协作场景——当单个 Agent 处理不了复杂工作流时，编排多个 Agent。

---

## 全文收束

```
                      ┌──────────────────────────┐
                      │       用户 Prompt          │
                      └───────────┬──────────────┘
                                  ▼
                      ┌──────────────────────────┐
                      │   LLM Planning/Reasoning  │  ← 大脑：自主调度
                      └───────────┬──────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
  ┌─────────────┐        ┌─────────────┐         ┌─────────────┐
  │   Memory    │        │    Tool     │         │     RAG     │
  │  记住上下文  │        │ while循环    │         │  内部知识库  │
  │             │        │ Promise.all │         │             │
  └─────────────┘        └─────────────┘         └─────────────┘
                                  │
                         ┌────────┴────────┐
                         ▼                 ▼
                  ┌────────────┐    ┌────────────┐
                  │  MCP/第三方 │    │   Skills   │
                  │   外部能力  │    │   组合技能  │
                  └────────────┘    └────────────┘
                                  │
                                  ▼
                      ┌──────────────────────────┐
                      │      组装 Response         │
                      └──────────────────────────┘
```

**三句话概括全文：**

1. **六个模块是对 LLM 五项短板的精确补丁**——不是堆砌功能，是补全能力缺口。记不住 → Memory，动不了 → Tool，不知道内部知识 → RAG，不知道新信息 → MCP，做不了长任务 → Skills。
2. **`while` 循环 + `Promise.all` + `tool_call_id` 是 Tool 调用的三项核心设计**——`while` 保证多轮自主调用，`Promise.all` 保证并发性能，`tool_call_id` 保证上下文不混乱。
3. **这个公式已经足够构建真正的产品**——Claude Code 就是 LLM + fs + CLI 的产物，技术栈 Node.js + LangChain + LangGraph + MCP/RAG/Skills 可以直接落地。

**把 LLM 从"能说会道"升级成"能说会做"——这就是 Agent 开发的核心命题。**

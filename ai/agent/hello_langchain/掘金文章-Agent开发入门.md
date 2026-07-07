# Agent 开发思考笔记：LLM + Memory + Tool + RAG + MCP + Skills

## 核心结论（塔尖）

**Agent 的本质是给 LLM 补上它天生缺失的五种能力——Memory、Tool、RAG、MCP、Skills——从而把一个"只能聊天的大脑"变成一个"能记住上下文、能动手执行、能检索私有知识、能获取实时信息、能编排复杂任务"的智能体。**

用一句话记就是：

```
Agent = LLM + Memory + Tool + RAG + MCP + Skills
```

如果只给一个比喻：**LLM 是一个刚毕业的天才研究生——脑子聪明但没工牌没电脑不知道内部流程；Agent 是给他配齐了工牌、电脑、内部 Wiki、同事通讯录之后的正式员工。** Claude Code、Cursor、Manus 这些最值钱的 AI 产品，本质上做的都是这件事。

下面我用三组论点来证明这个公式为什么成立、怎么落地、以及为什么它足够。

---

## 论点一：这个公式不是拼凑出来的——每个模块都是 LLM 某一项短板的精确解

Agent 的六大模块不是"越多越高级"的堆砌。**逐一拆开看，每个模块都精准地对应 LLM 的一项天生缺陷。** 也就是说，Agent 是从 LLM 的短板出发，逐层"生长"出来的。

| LLM 天生缺陷 | 具体表现 | 为什么这是致命的 | 对应模块 |
|---|---|---|---|
| **无状态（Stateless）** | 上周聊过的事这周完全忘记，每次对话都是"初次见面" | 无法积累用户上下文，无法形成长期协作关系 | **Memory**（数据库/Redis/前端存储） |
| **无执行能力** | 能告诉你"应该怎么做"，但不能真的去读文件、调 API、写数据库 | 永远停留在"建议"层面，无法产生实际价值 | **Tool Use**（函数调用，LLM 输出指令 → 运行时执行） |
| **无私有知识** | 训练数据里没有你公司的 API 文档、业务规范、代码库 | 通用能力强，但一碰到具体业务就"编" | **RAG**（检索增强生成，把私有知识注入 Prompt） |
| **知识有截止日期** | 预训练数据有 cutoff，不知道最新新闻、实时股价、刚发布的库 | Chat 场景可以用搜索弥补，但 Agent 场景需要结构化数据 | **MCP / 第三方 Tool**（通过协议接入外部实时能力） |
| **无法编排长任务** | 做 PPT、分析股市并自动买卖——单轮问答的粒度太粗 | 真实工作都是多步骤、多轮次的 | **Skills**（把多个子任务组合成可复用的技能流） |

**这五项缺陷是"互斥且穷尽"的（MECE）：** 记不住 → Memory ；动不了 → Tool ；不知道内部知识 → RAG ；不知道新信息 → MCP ；做不了长任务 → Skills。每个模块解决一个独立问题，合在一起覆盖了 LLM 从"聊天"到"干活"所需的全部能力补全。

由此可以得出一个更强的推论：**如果你对面坐的是一个真正的 Agent，那么它背后一定以某种形式实现了这五个模块——缺少任何一个，它就会在对应的场景里"露馅"。**

---

## 论点二：模块之间的协同机制决定了 Agent 能不能真正工作——核心是 Tool 调用闭环

有了公式只是知道了"要装什么零件"。**更关键的问题是：这些零件怎么配合？** 因为零件之间的接口设计不当，整个 Agent 就是个摆设。

### 2.1 整体工作流：LLM 自己当调度中心

Agent 的调度中心不是外部规则引擎，**就是 LLM 自己**。整个执行流程如下：

```
用户以 Prompt 提交一个复杂任务
    ↓
LLM 进行 Planning / Reasoning（规划推理：拆解子任务）
    ↓
LLM 自己判断：需要加载 Memory 吗？（历史上下文、用户偏好）
    ↓
LLM 自己判断：需要调用 Tool 吗？（可能多个，可能多轮）
    ↓
LLM 自己判断：需要走 RAG 吗？（检索内部知识 → 拼进 Prompt Template）
    ↓
组装最终 Response → 返回用户
```

这里的关键设计是：**每一步"判断"都不是硬编码的 if-else，而是 LLM 基于任务内容自主做出的。** 这也是为什么 description 和 schema 写得充不充分，直接决定了 LLM 能不能在正确时机调用正确的模块——LLM 是读自然语言来做决策的，信息越模糊，判断越随机。

### 2.2 最核心的机制：Tool 调用的完整闭环

在所有模块中，**Tool 是最关键的——因为它是 LLM 从"能说"变成"能做"的分水岭。** 我把它拆开，分两层来讲。

**第一层：Tool 本身的结构**

一个 Tool 由两个互不重叠的部分组成：

```
Tool = 处理函数（async 异步，干活的）
     + 描述对象
         ├── name：工具标识
         ├── description：功能 + 适用场景 → LLM 据此判断"调不调"
         └── schema（Zod）：参数约束 → LLM 必须按此传参，这是"合同"
```

用 LangChain 实现的代码是这样的：

```js
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

const readFileTool = tool(
  async ({ filePath }) => {
    const content = await fs.readFile(filePath, 'utf-8');
    console.log(`[工具调用] read_file(${filePath}) 成功读取 ${content.length} 字节`);
    return content;
  },
  {
    name: 'read_file',
    description: '用此工具来读取文件内容。当用户要求读取文件、查看代码、分析文件内容时，调用此工具。',
    schema: z.object({
      filePath: z.string().describe('要读取的文件路径'),
    }),
  }
);
```

从这个结构可以直接推导出三条设计约束：
- **处理函数必须是 async**：因为读文件、调 API、查数据库都是耗时操作，同步阻塞会让整个 Agent 卡死；
- **description 决定准确率**：LLM 靠 description 判断调用时机，场景覆盖越全，误判越少；
- **schema 是调用契约**：LLM 必须按 schema 约定的参数格式传参，zod 做校验，契约不清晰则调用必失败。

**第二层：Tool 的调用流程——LLM 的"自知之明"**

这是整个 Agent 机制中最精妙的一环。**LLM 具有"自知之明"——当它判断需要调用 Tool 时，它不会硬编答案，而是停下来，生成 tool_calls 列表声明"我需要调这些工具"。**

```js
const modelWithTools = model.bindTools(tools);

const messages = [
  new SystemMessage('你是一个代码助手。用户要求读文件时立即调用 read_file，等待结果后分析代码。'),
  new HumanMessage('请读取 tool.mjs 文件内容并解释代码'),
];

// 第一次 invoke：LLM 不生成文本，而是返回 tool_calls
let response = await modelWithTools.invoke(messages);
// response.tool_calls = [{ id, name: 'read_file', arguments: { filePath: 'tool.mjs' } }]
messages.push(response);

// 运行时执行 Tool，用 tool_call_id 把结果和调用一一对应
if (response.tool_calls && response.tool_calls.length > 0) {
  for (const toolCall of response.tool_calls) {
    const toolResult = await readFileTool.invoke(toolCall.args);
    messages.push(new ToolMessage({
      content: toolResult,
      tool_call_id: toolCall.id,  // ← 关键：id 是关联调用和结果的唯一标识
    }));
  }
  // 第二次 invoke：LLM 拿到工具结果，生成基于结果的最终回复
  const finalResponse = await modelWithTools.invoke(messages);
  console.log('[最终回复]', finalResponse.content);
}
```

**这段代码揭示了 Tool 调用的底层模型——一个接力式的消息循环：**

```
HumanMessage  → 用户："帮我读这个文件"
AIMessage     → LLM："我需要调 read_file，参数如下…"（停住，不编答案）
ToolMessage   → 运行时："这是文件内容……"（带上 tool_call_id 对齐）
AIMessage     → LLM："好的，基于文件内容，我的分析是…"
```

这个接力模型解释了为什么 `tool_call_id` 至关重要：**Agent 一次任务可能调用多个 Tool，且 Tool 是异步的，返回时间不确定。** LLM 靠 `tool_call_id` 把每个 ToolMessage 精准对应到它发出的每个 tool_call——没有这个 id 机制，上下文必然乱掉，LLM 根本分不清哪个结果属于哪个子任务。

---

## 论点三：Agent 的性能瓶颈在 Tool 执行层——Promise.all 并发是关键优化

确定了"多个 Tool 异步执行"这个前提之后，必然引出下一个问题：**当多个 Tool 之间没有依赖关系时，应该串行还是并行？**

### 3.1 前置概念：Promise 的状态模型

讨论并行之前，先把基础概念钉死：

| 概念 | 定义 |
|---|---|
| **Promise** | ES6 异步抽象，三种状态：Pending（等待）、Fulfilled（成功）、Rejected（失败） |
| **状态转换规则** | `resolve()` → Pending 变为 Fulfilled；`reject()` → Pending 变为 Rejected。**两种结果互斥，且状态一旦确定就不可逆转** |
| **await** | ES8 语法，让异步代码以同步风格书写，消除回调嵌套 |
| **Promise.all** | 接收 Promise 数组，**并行执行**所有任务，全部完成后返回，结果数组顺序与输入数组顺序一致 |

### 3.2 串行 vs 并行：从原理到数据

用具体场景说话——假设 Agent 需要同时获取天气数据和推文列表，两个请求互不依赖：

```js
function getWeather() {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ temp: 38, conditions: 'Sunny with Clouds' }), 2000);
  });
}
function getTweets() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(['I like cake', 'BBQ is good too!']), 500);
  });
}

// 串行：总耗时 = 2000ms + 500ms = 2500ms
const weatherData = await getWeather();   // 等 2000ms
const tweetsData = await getTweets();     // 上面走完，再等 500ms
// 两个 await 是叠加关系 —— 互不依赖的两个操作却在互相等待

// 并行：总耗时 = max(2000ms, 500ms) = 2000ms
const [weatherData, tweetsData] = await Promise.all([getWeather(), getTweets()]);
// 两个 Promise 同时启动，先完成的等后完成的，最后一起返回
```

**这个对比直接给出了一条明确的优化原则：如果两个异步操作之间没有数据依赖，绝不应该让它们串行执行。**

### 3.3 对 Agent 的影响

这条原则在 Agent 场景中会被显著放大：**一次复杂任务可能调用 5 个互相独立的 Tool——串行执行的总耗时是 `t1+t2+t3+t4+t5`，而 Promise.all 并行执行的总耗时是 `max(t1,t2,t3,t4,t5)`，差距可能是数倍。**

因此，**在实现 Agent 的 Tool 执行循环时，必须增加一层"依赖分析"**——先区分哪些 Tool 之间有先后依赖（必须先读再写），哪些完全独立，然后把独立的放进 `Promise.all` 并发执行。**这是 Agent 从"能用"到"好用"的关键一步。**

---

## 论点四：这个公式的完备性已经被现有产品验证——Claude Code 就是 LLM + fs + CLI

理论讲完了，用现实产品来验证这个公式的解释力。拆开 Claude Code 来看：

```
Claude Code = LLM + Tool（fs 文件系统 + CLI 命令行）
```

**它就是把 Tool 机制做到极致的结果：** 文件系统 Tool 负责读写代码，CLI Tool 负责执行命令——配上编程能力强的 LLM，加上 Planning 和 Tool 调用循环，一个 Coding Agent 就成立了。

用同样的思路推演一个更日常的例子——"用 React + Vite 创建一个 TodoList"：

LLM Planning 会把这个任务拆成三步：
1. 调 CLI Tool → `npm create vite@latest` 创建项目脚手架
2. 调写入文件 Tool → LLM 生成 React 组件代码，写入 `src/App.jsx`
3. 调 CLI Tool → `npm run dev` 启动开发服务器

**每一步都是一个 Tool 调用，三次调用串成一次完整的编程任务。** 这个例子说明了一个朴素但重要的结论：**一个"Agent"和一个"ChatBot"之间的区别，不在于底层模型有多强，而在于有没有给模型装上能执行操作的 Tool、能管理记忆的 Memory、能检索私有知识的 RAG。** 装上就是 Agent，没装就是 ChatBot。

---

## 落地路线图：从理论到代码

以上四个论点证明了公式的**正确性**（论点一）、**可行性**（论点二）、**性能要求**（论点三）、**完备性**（论点四）。**剩下一件事：把它做出来。**

落地的技术栈是明确且成熟的：

落地需要框架：为什么选 LangChain？
当然可以手搓原生 API，把 Tool 调用逻辑、Message 管理、Schema 校验全部自己写。但这显然不划算——**LangChain 的定位就是一个"LLM 开发框架"，它在 OpenAI 原生接口之前就诞生了，相当于提供了一套标准化的抽象层。**
我目前选择的技术栈是：
```
Node.js（NestJS 做后端）
  + LangChain（单智能体——统一 LLM 接口 + Tool 抽象 + Message 管理）
  + LangGraph（多智能体——当单 Agent 不够用时的多 Agent 编排）
  + MCP / RAG / Skills（扩展能力层）
```

三层边界清晰：
- **NestJS** 负责传统后端（路由、数据库、中间件、权限）；
- **LangChain** 负责 AI 层抽象（`@langchain/openai` 兼容各家模型，`@langchain/core/tools` + zod 做工具验证和绑定）；
- **LangGraph** 负责多 Agent 场景——当单个 Agent 处理不了复杂工作流时，编排多个 Agent 协作。

通过 Harness Engineering 的方式把这些层整合起来，就能将 AI 能力产品化，实现商业价值（FDE）。

---

## 全文收束

```
                      ┌──────────────────────────┐
                      │       用户 Prompt          │
                      └───────────┬──────────────┘
                                  │
                                  ▼
                      ┌──────────────────────────┐
                      │   LLM Planning/Reasoning  │  ← 大脑：自主调度
                      └───────────┬──────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
          ▼                       ▼                       ▼
   ┌─────────────┐        ┌─────────────┐        ┌─────────────┐
   │   Memory    │        │    Tool     │        │     RAG     │
   │  记住上下文  │        │  动手执行    │        │  内部知识库  │
   └─────────────┘        └─────────────┘        └─────────────┘
          │                       │                       │
          │              ┌────────┴────────┐              │
          │              ▼                 ▼              │
          │      ┌────────────┐    ┌────────────┐        │
          │      │  MCP/第三方 │    │   Skills   │        │
          │      │   外部能力  │    │   组合技能  │        │
          │      └────────────┘    └────────────┘        │
          │                       │                       │
          ▼                       ▼                       ▼
                      ┌──────────────────────────┐
                      │      组装 Response         │
                      └──────────────────────────┘
```

**三句话概括我的全部思考：**

1. **Agent 的六个模块是对 LLM 五项短板的精确回应**——不是堆砌功能，是补全能力缺口，五组补丁覆盖了 LLM 从"聊天"到"干活"的全部缺失维度。
2. **Agent 的核心机制是 LLM 自主调度 Tool 的接力式消息循环**——LLM 自己判断、自己调用、靠 tool_call_id 对齐结果；Promise.all 并发独立 Tool 是将性能从"能用"拉到"好用"的关键。
3. **这个公式已经足够构建真正的产品**——Claude Code 就是 LLM + fs + CLI 的产物，技术栈 Node.js + LangChain + LangGraph + MCP/RAG/Skills 可以直接落地。

**把 LLM 从"能说会道"升级成"能说会做"——这就是 Agent 开发的核心命题。**

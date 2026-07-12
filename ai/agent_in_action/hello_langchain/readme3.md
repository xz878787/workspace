# 手写 AI 编程 Agent——以 Trae/Cursor 为例

## 核心结论（塔尖）

**编程 Agent 的本质是一个接力式消息循环：LLM 通过 `while` 循环自主调度 Tool，完成 Reason → Act → Observe 的闭环。Trae、Cursor、Claude Code 这些产品，内核完全一致——差异只在 Tool 的种类和深度。**

``` 
编程 Agent = LLM + while (tool_calls) { Promise.all(执行) + ToolMessage(id) + invoke }
```

下面用三个层层递进的论点来证明这个结论：**为什么必须用 Tool → Tool 怎么被调度 → 怎么从 demo 做到产品。**

---

## 论点一：Tool 是 LLM 从"能说"变成"能做"的唯一桥梁

### 1.1 LLM 存在一个硬边界——它不能执行

LLM 能告诉你"应该怎么做"，但到"真的去做"这一步，它碰到了两个无法逾越的限制：

| 限制 | 具体表现 | 后果 |
|---|---|---|
| **无状态（Stateless）** | 每次调用都是全新对话，上周聊过的事这周完全不记得 | 无法积累上下文，无法形成长期协作 |
| **无执行能力** | 不能读文件、不能调 API、不能执行命令——只能生成文本 | 永远停留在"建议"层面，无法产生实际价值 |

**这两个限制不是 LLM 不够聪明造成的，而是它的架构决定的。** LLM 本质上是一个函数 `f(prompt) → text`，它没有文件系统句柄，没有网络 socket，没有子进程——这些东西在它的沙箱外。

因此，要让 LLM 从"参谋"变成"士兵"，**必须给它装上能执行操作的工具，并且让它知道"什么时候该用什么工具"**。

### 1.2 Tool 的解法：LLM 声明意图，运行时负责执行

**Tool 机制的核心思想是分离"决策"和"执行"。** LLM 负责决策——判断什么时候需要调哪个工具、传什么参数；运行时负责执行——真正去读文件、调 API、跑命令。

```js
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import fs from 'node:fs/promises';

const readFileTool = tool(
  // ===== 执行侧（运行时负责）=====
  async ({ filePath }) => {
    const content = await fs.readFile(filePath, 'utf-8');
    console.log(`[工具调用] read_file(${filePath}) 成功读取 ${content.length} 字节`);
    return content;
  },
  // ===== 决策侧（LLM 依据）=====
  {
    name: 'read_file',
    description: `用此工具来读取文件内容，当用户要求读取文件、查看代码、分析文件内容时，调用此工具。`,
    schema: z.object({
      filePath: z.string().describe('要读取的文件路径'),
    }),
  }
);
```

**一个 Tool 的结构揭示了三条设计约束：**

- **处理函数必须是 async**：读文件、调 API、执行命令全是异步操作，同步阻塞会让整个 Agent 卡死。`async` 函数返回 Promise，调用方用 `await` 等结果，不阻塞事件循环。
- **description 决定调用准确率**：LLM 是读自然语言判断"该不该调这个工具"的。description 覆盖的场景越全面，LLM 误判率越低。这是纯自然语言的接口——没有类型系统帮你兜底。
- **schema 是调用契约**：LLM 必须按 Zod schema 约定的字段名和类型传参。如果 LLM 传了 `{ filename: "xxx" }` 但 schema 定义的是 `filePath`，Zod 校验直接拦截——错误参数不会进入处理函数。

### 1.3 bindTools：让 LLM 知道自己有哪些工具

有了 Tool 定义，下一步是让 LLM 感知到它们的存在：

```js
import { ChatOpenAI } from '@langchain/openai';

const model = new ChatOpenAI({
  modelName: 'deepseek-v4-flash',
  apiKey: process.env.DEEPSEEK_API_KEY,
  temperature: 0,
  configuration: { baseURL: 'https://api.deepseek.com/v1' },
});

const tools = [readFileTool];
const modelWithTools = model.bindTools(tools);
```

`bindTools` 把每个 Tool 的 `name`、`description`、`schema` 序列化为 LLM 能理解的格式（JSON Schema），注入后续每一次请求。**模型的基座可以是 DeepSeek、OpenAI 或任何兼容服务——`bindTools` 在上层屏蔽了这个差异。**

**到这里，答案链的第一步完成了：**

```
问题：LLM 不能执行 → 方案：Tool 分离决策与执行 → 实现：async 函数 + Zod schema + bindTools
```

下一步要回答的是：**LLM 什么时候调 Tool？调完之后怎么拿到结果继续推理？** 这就引出了 Agent 的核心引擎——while 循环驱动的消息接力。

---

## 论点二：while 循环是 Agent 的调度引擎——ReAct 模式的工程实现

### 2.1 消息循环的底层模型：四种 Message 的接力

Agent 和 LLM 之间的所有交互，通过一个 `messages` 数组承载。四种消息类型各司其职：

```js
import { SystemMessage, HumanMessage, AIMessage, ToolMessage } from '@langchain/core/messages';
```

它们的职责——以及职责之间的协作关系——如下：

```
┌─────────────────────────────────────────────────────────┐
│              Agent 消息接力模型                           │
│                                                         │
│  SystemMessage → "你是代码助手，可以读文件并解释代码"      │
│       │                                                 │
│       ▼                                                 │
│  HumanMessage → "帮我读 src/tool.mjs 并解释"              │
│       │                                                 │
│       ▼                                                 │
│  modelWithTools.invoke(messages)                         │
│       │                                                 │
│       ▼                                                 │
│  AIMessage {                                            │
│    content: null,          ← LLM 知道自己答不了，停住     │
│    tool_calls: [{                                      │
│      id: "call_001",       ← LLM 自己生成的工单号        │
│      name: "read_file",                                 │
│      arguments: { filePath: "src/tool.mjs" }            │
│    }]                                                  │
│  }                                                     │
│       │                                                 │
│       ▼ （运行时执行工具，不是 LLM 执行）                  │
│                                                         │
│  ToolMessage {                                          │
│    content: "import 'dotenv/config'...", ← 工具结果      │
│    tool_call_id: "call_001"             ← 对号入座       │
│  }                                                     │
│       │                                                 │
│       ▼                                                 │
│  modelWithTools.invoke(messages)  ← LLM 看到完整上下文    │
│       │                                                 │
│       ▼                                                 │
│  AIMessage {                                            │
│    content: "这段代码实现了Agent的Tool调用循环...",       │
│    tool_calls: []  ← 信息够了，任务完成                   │
│  }                                                     │
└─────────────────────────────────────────────────────────┘
```

**四种 Message 的职责划分是 MECE 的：**

| Message 类型 | 谁产生 | 职责 | 角色标签 |
|---|---|---|---|
| **SystemMessage** | 开发者 | 设定 Agent 的身份、能力边界、行为规范 | `system` |
| **HumanMessage** | 用户 | 提出任务——整个调用链的触发器 | `user` |
| **AIMessage** | LLM | 要么声明 tool_calls（需要工具），要么给 content（任务完成）| `assistant` |
| **ToolMessage** | 运行时 | 携带工具执行结果，通过 tool_call_id 回填到对应调用 | `tool` |

**关键设计点：AIMessage 的两种状态是互斥的。** 当 `tool_calls` 有值时，`content` 一定为空——LLM 不会一边编答案一边调工具。这是 LLM 的"自知之明"：当它判断自己信息不足时，它会停下来声明"我需要调用这些工具"，而不是硬编一个看起来合理但错误的答案。

### 2.2 while 循环——为什么不是 if

LLM 的一次 `invoke` 可能返回 tool_calls，运行时执行完工具后，把结果喂回去，LLM 可能还需要再调工具。**这个"执行→反馈→再判断"的过程天然是一个循环，不是一个单次判断。**

```
用户："对比 tool.mjs 和 index.mjs 的代码风格"

第 1 轮 Reason：LLM 发现自己需要 tool.mjs 的内容 → Act：read_file("tool.mjs") → Observe：拿到文件 A
第 2 轮 Reason：LLM 发现还需要 index.mjs 才能对比 → Act：read_file("index.mjs") → Observe：拿到文件 B
第 3 轮 Reason：两份文件都拿到了，可以生成对比分析 → 直接返回 AIMessage(content=分析, tool_calls=[])
循环终止
```

**如果这里用 `if` 而不是 `while`，第 2 轮永远不会发生。** LLM 读完第一个文件后想再读第二个，但 `if` 已经结束了。这就是 ReAct 模式的本质要求——Agent 必须在 Reason → Act → Observe 之间反复循环，直到 LLM 判断"信息够了"。

### 2.3 tool_call_id —— 异步场景下上下文对齐的唯一手段

**一次 invoke 可能返回多个 tool_call，多个 tool_call 异步执行的完成顺序是不确定的。** 如果没有 id 机制，LLM 根本分不清哪个结果属于哪个调用：

```
LLM 同时发出：[read_file("a.mjs"), read_file("b.mjs"), exec_command("npm test")]

异步完成顺序（网络/磁盘速度不同）：
  1. exec_command 先完成
  2. read_file("b.mjs") 接着完成
  3. read_file("a.mjs") 最后完成

没有 tool_call_id → LLM 拿到三个结果，完全不知道谁是谁
有 tool_call_id    → 每个 ToolMessage 带工单号，LLM 精准对应
```

**`tool_call_id` 由 LLM 自己生成**（存在 `AIMessage.tool_calls[].id` 中），运行时执行完工具后原样写入 `ToolMessage`。整条链路是：**LLM 发号 → 运行时保留工单号 → ToolMessage 回填工单号 → LLM 按号认领。**

### 2.4 容错：两层防线保证 Agent 不崩溃

```js
// 第一层：防止 LLM 幻觉出的工具名导致 crash
const tool = tools.find(t => t.name === toolCall.name);
if (!tool) {
  return `错误: 找不到工具 ${toolCall.name}`;
}

// 第二层：防止工具执行时异常导致 crash
try {
  const result = await tool.invoke(toolCall.args);
  return result;
} catch (err) {
  return `错误: ${err.message}`;
}
```

**两层防线的共同原则：错误也是信息。** 不抛异常让进程挂掉，而是把错误信息作为正常返回值交给 LLM。LLM 读到 `"错误: 找不到工具 xxx"` 后可以自我纠正；读到 `"错误: ENOENT: no such file"` 后可以尝试换一个路径。**把决策权留给 LLM 而不是让运行时替它决定"这错了，别干了"。**

---

## 论点三：Promise.all 并发 + CLI 工具扩展 = 从 demo 到产品

### 3.1 为什么 Promise.all 不是优化，而是必须

**论点一解决了"能调"，论点二解决了"怎么调"，但还有一个问题没回答：同一轮的多个 tool_call 之间如何执行？**

因为 `async` 函数的返回值自动包装为 Promise，而 `.map` 不等待每个回调完成——它立刻返回一个 Promise 数组：

```js
// .map 只负责遍历和创建 Promise，不负责等待
const promises = response.tool_calls.map(async (toolCall) => {
  const result = await tool.invoke(toolCall.args); // 这个 await 在 Promise 内部
  return result;
});
// 此时所有 Promise 已经启动（全部处于 Pending 状态）

// Promise.all 等待全部完成
const results = await Promise.all(promises);
```

**串行 vs 并行的差距不是"快一点"，而是"数量级"的：**

```
5 个独立的 Tool 调用（读 3 个文件 + 调 2 个 API）：

串行：t1 + t2 + t3 + t4 + t5 = 假设每个 500ms → 2500ms
并行：max(t1, t2, t3, t4, t5) = 500ms

差距：5 倍。且 tool 越多，差距越大。
```

**`Promise.all` 的前提是这些 Tool 之间没有数据依赖。** 如果 Tool B 需要 Tool A 的输出作为输入，那它们必须串行——但这种依赖由 LLM 自然处理：LLM 会在第一轮只调 A，拿到结果后第二轮再调 B。所以同一轮内的 tool_calls 天然是无依赖的，天然适合 `Promise.all`。

### 3.2 关键 Promise 知识点（内嵌于 Agent 执行流中）

以上论点已经用到了几个 Promise 核心概念。把它们从代码中提炼出来：

**Promise 三种状态——不可逆的单向转换：**

| 状态 | 触发 | 规则 |
|---|---|---|
| **Pending** | 初始 | — |
| **Pending → Fulfilled** | `resolve(value)` | 成功值绑定，不可变 |
| **Pending → Rejected** | `reject(error)` | 失败原因绑定，不可变 |

**关键规则：Fulfilled 和 Rejected 互斥，且状态一旦确定，永久锁定。** 这意味着一个异步操作的结果只有一次——不会有"先成功后来又失败"的诡异行为。Agent 中每个 Tool 执行都是独立的 Promise，状态锁定保证了上下文不乱。

**async/await 的本质：**

```js
async ({ filePath }) => {
  const content = await fs.readFile(filePath, 'utf-8');
  return content;  // 等价于 resolve(content)
}
```

`async` 函数返回 Promise，`return` 等价于 `resolve`，`throw` 等价于 `reject`。所以 `async` 函数可以直接放入 `Promise.all`——它的返回值天然是可并行的 Promise。

### 3.3 CLI 工具——编程 Agent 的最后一块拼图

文件读写只是开始。**让 Agent 能编程，必须给它 CLI 执行能力：**

```js
import { spawn } from 'node:child_process';

const execCommandTool = tool(
  async ({ command, cwd }) => {
    return new Promise((resolve, reject) => {
      const child = spawn(command, [], { shell: true, cwd });
      let stdout = '', stderr = '';
      child.stdout.on('data', (data) => { stdout += data; });
      child.stderr.on('data', (data) => { stderr += data; });
      child.on('close', (code) => {
        resolve(code === 0 ? stdout : `错误(exit ${code}): ${stderr}`);
      });
      child.on('error', reject);
    });
  },
  {
    name: 'exec_command',
    description: '执行 shell 命令。当需要创建项目、安装依赖、运行脚本、执行 git 操作时调用此工具。',
    schema: z.object({
      command: z.string().describe('要执行的 shell 命令'),
      cwd: z.string().optional().describe('工作目录'),
    }),
  }
);
```

**为什么用 spawn 子进程而不是在主进程里 exec？** 三个原因：

1. **隔离崩溃边界**：命令执行超时或异常不会把 Agent 主进程带挂
2. **不阻塞事件循环**：子进程独立运行，主进程继续处理其他任务
3. **IPC 解耦**：stdout/stderr 通过管道回传，主进程只需要监听事件

有了 fs Tool + CLI Tool，再配上开头的例子：

```
用户："用 vite 创建一个 react todolist 项目并运行"

第 1 轮：LLM 调 exec_command("npm create vite@latest my-todo -- --template react")
第 2 轮：LLM 调 write_file("src/App.jsx", <生成的组件代码>)
第 3 轮：LLM 调 exec_command("cd my-todo && npm run dev")
```

**三步，三次 Tool 调用，一条 while 循环串起来。** 这就是编程 Agent 的完整工作模型。

### 3.4 产品验证

把这个模型套到真实产品上，公式立刻成立：

| 产品 | = LLM | + while 循环 | + Tool 集合 |
|---|---|---|---|
| **Claude Code** | Claude | ReAct 循环 | fs + CLI + Grep/Glob + Edit |
| **Cursor** | GPT/Claude | ReAct 循环 | fs + CLI + LSP（跳转/重构/诊断）|
| **Trae** | 自研模型 | ReAct 循环 | fs + CLI + Browser（UI 预览）|

**内核完全一致，差异只在 Tool 的种类和深度。** 这不是巧合——这是"LLM + Tool 循环"这个架构模式的必然结果。

---

## 全文收束

```
                        ┌──────────────────────┐
                        │     用户 Prompt        │
                        └───────────┬──────────┘
                                    ▼
                        ┌──────────────────────┐
                        │   LLM Reason（推理）   │ ← 大脑：我要调工具吗？
                        └───────────┬──────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
        AIMessage {                        AIMessage {
          tool_calls: [...]    OR            content: "..."
        }                                   tool_calls: []
                  │                                   │
                  ▼                                   ▼
        ┌──────────────────┐                  ┌──────────────┐
        │  Act（运行时执行） │                  │  返回结果     │
        │  Promise.all 并发 │                  └──────────────┘
        │  + try/catch 容错 │
        └────────┬─────────┘
                 ▼
        ┌──────────────────┐
        │ Observe（观察）    │
        │ ToolMessage + id  │
        │ → 回到 Reason     │
        └──────────────────┘
```

**三句话记住全部：**

1. **Tool 是唯一的桥**——LLM 能说不能做，必须通过 `async 函数 + Zod schema + bindTools` 把"决策"和"执行"分离。
2. **while 循环是引擎**——`while (tool_calls)` 驱动 Reason → Act → Observe 反复循环；`tool_call_id` 保证异步场景下上下文不混乱；两层容错保证 Agent 不崩溃。
3. **Promise.all + CLI Tool 是产品化的关键**——`Promise.all` 把同轮无依赖 Tool 从串行变并行（sum → max）；CLI Tool 通过 spawn 子进程隔离执行；fs + CLI 两个 Tool 类型就足以构建 Claude Code 级别的编程 Agent。

```
Agent = LLM + while (tool_calls) { Promise.all(执行) + ToolMessage(id) + invoke }
```

**把 LLM 从"参谋"升级成"士兵"——这就是编程 Agent 的全部秘密。**

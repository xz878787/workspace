# Agent 工程化：当 4 个 Tool 一起工作时，问题才真正开始

## 核心结论（塔尖）

**单 Tool 让 Agent 能对话，多 Tool 协作让 Agent 能干活——从"调一个工具"到"完成一个端到端编程任务"，中间隔的不是代码量，而是 Tool 设计质量、Prompt 规则约束、循环安全控制和进程架构隔离四个维度的工程化。**

一个具体对比：

```
文章一的 Agent：1 个 read_file Tool → 能读代码并解释
文章二的 Agent：read_file + while 循环 → 能读多个文件并对比分析
本文的 Agent：   read + write + list + exec + for 循环 + 安全网 + 子进程隔离
                 → 能自动创建 React 项目、写组件、装依赖、跑起来
```

**能力跃迁的每一步，都对应着一个工程问题的解决。** 下面用 mini-cursor.mjs、all-tools.mjs、node-exec.mjs 三份代码，把这条工程化路径讲透。

---

## 论点一：多 Tool 场景放大了单 Tool 的设计要求——不再是"能用"，而是"不坑 LLM"

### 1.1 回顾基础约束

文章一和文章二已经建立了 Tool 的三条设计约束：

| 约束 | 目的 |
|---|---|
| 处理函数必须是 `async` | 不阻塞事件循环，返回 Promise 可被 `Promise.all` 并行 |
| `description` 覆盖全部触发场景 | LLM 靠自然语言判断"该不该调这个工具" |
| `schema` 用 Zod 定义参数契约 | LLM 按要求传参，Zod 校验拦截错误参数 |

**这三条是"单 Tool 能跑"的底线。** 当只有一个 `readFileTool` 时，满足这三条就够了。但当 Agent 同时持有读、写、列目录、执行命令四个 Tool 时，问题变复杂了。

### 1.2 新问题：LLM 在工具协作中会犯"组合错误"

看 `all-tools.mjs`，四个 Tool 各司其职：

```
read_file       → 读取文件内容
write_file      → 写入文件（自动创建父目录）
list_directory  → 列出目录内容
execute_command → 执行 shell 命令（可指定工作目录）
```

**LLM 不是程序员——它不知道"先创建目录再写入文件"是一个必须遵守的顺序。** 在单 Tool 场景下这不成问题（因为只有读操作），但多 Tool 场景下，LLM 可能会：

1. 调用 `write_file("a/b/c/App.tsx", code)` 但 `a/b/c/` 目录不存在
2. 调用 `execute_command("cd react-todo-app && pnpm install", { directoryPath: "react-todo-app" })` ——在已经切到的目录里再 cd 一次

**第一个问题的解法在 Tool 内部**，第二个问题的解法在 System Prompt 里——这就引出了论点二。

### 1.3 writeFileTool 的工程化处理：把"容错"前置到 Tool 内部

```js
const writeFileTool = tool(
  async ({ filePath, content }) => {
    try {
      const dir = path.dirname(filePath);     // 1. 提取父目录
      await fs.mkdir(dir, { recursive: true }); // 2. 递归创建（已存在则跳过）
      await fs.writeFile(filePath, content, 'utf-8'); // 3. 写入文件
      return `成功写入 ${filePath}`;
    } catch (err) {
      return `写入文件失败：${err.message}`;   // 4. 错误也是信息
    }
  },
  { name: 'write_file', /* ... */ }
);
```

**这里做了两件事是单 Tool 场景不会考虑的：**

- **`path.dirname` + `fs.mkdir recursive`**：LLM 不关心目录存在性，但 Tool 必须替它处理。这是"多 Tool 场景下，每个 Tool 要为 LLM 的调用习惯做适配"的典型案例。
- **`recursive: true`**：`/a/b/c/` 三级目录一次创建，不需要 Tool 分三次调用。**减少 Tool 调用次数 = 减少 LLM 决策负担 = 降低出错概率。**

**设计原则：Tool 内部越自完备，LLM 的协作压力越小。**

### 1.4 executeCommandTool 的设计决策：为什么要把 `directoryPath` 从 command 里拆出来

```js
const executeCommandTool = tool(
  async ({ command, directoryPath }) => {
    const cwd = directoryPath || process.cwd();
    // ...
    const child = spawn(cmd, args, { cwd, stdio: 'inherit', shell: true });
    // ...
  },
  {
    name: 'execute_command',
    schema: z.object({
      command: z.string().describe('要执行的命令'),
      directoryPath: z.string().optional().describe('工作目录(推荐指定)'),
    }),
  }
);
```

**注意这个设计：`directoryPath` 是独立参数，不是 command 字符串的一部分。**

为什么？回到文章二的 tool_call_id 原则——"分离关注点"。command 是"做什么"，directoryPath 是"在哪里做"。把目录嵌在 command 字符串里 `"cd x && npm install"` 有两个风险：

1. **LLM 会拼出错误的组合**：`"cd react-todo-app && cd react-todo-app && pnpm install"` ——当它不确定当前在哪个目录时，会"防御性地"多 cd 一次。
2. **Tool 无法校验路径合法性**：嵌在字符串里的路径对 Tool 是黑盒，`spawn` 的 `cwd` 参数则可以让 Node 提前验证。

**分离后，LLM 只需要回答两个正交的问题："执行什么命令？"和"在哪个目录执行？"——认知负担减半。**

---

## 论点二：System Prompt 在多 Tool 场景下，从"角色介绍"升级为"操作手册"

### 2.1 文章一二的 System Prompt vs 本文的 System Prompt

文章一的 System Prompt 只是定义了身份：
```
你是一个代码助手、可以使用工具读取文件并解释代码。
```

**这在单 Tool 场景下够了——因为只有一个工具，不会用错。**

mini-cursor.mjs 的 System Prompt 完全不同：

```js
new SystemMessage(`你是一个项目管理助手，使用工具完成任务。
  当前工作目录 ${process.cwd()}

  重要规则 - execute_command：
  - directoryPath 参数会自动切换到指定目录
  - 当使用 directoryPath 时，绝对不要在 command 中使用 cd
  - 错误示例: { command: "cd react-todo-app && pnpm install",
                directoryPath: "react-todo-app" }
    这是错误的！因为 directoryPath 已经在 react-todo-app 目录了，
    再 cd react-todo-app 会找不到目录
  - 正确示例: { command: "pnpm install", directoryPath: "react-todo-app" }
    这样就对了！directoryPath 已经切换到 react-todo-app，直接执行命令即可
`)
```

**这个 Prompt 不是"描述 Agent 是谁"，而是"教 Agent 怎么正确使用工具"。**

### 2.2 规则来自踩坑——为什么"不要 cd"这条规则必须写进 Prompt

这条规则不是凭空设计出来的——它是 LLM 反复犯同一个错误后，用规则写死的。

**LLM 的默认行为是"安全冗余"**：当它不确定自己是否已经在目标目录时，它会在命令前加 `cd`。"万一不在呢？cd 一下没错。"——但对带 `directoryPath` 的 Tool 来说，这恰恰是错的。

**这里揭示了一个 Agent 工程化的深层原则：**

> **LLM 的"过度安全"行为模式，在多 Tool 场景下会变成"过度危险"。System Prompt 的职责不是告诉 LLM 有什么工具，而是告诉它工具之间如何正确配合——哪些组合是合法的，哪些组合是看似合理但实际会出错的。**

类比：给新员工发工牌（bindTools）≠ 告诉他公司的内部流程和常见坑（System Prompt 规则）。**前者让 LLM 能进门，后者让 LLM 不犯错。**

### 2.3 动态信息注入：`process.cwd()` 写进 Prompt 的意义

```
当前工作目录 ${process.cwd()}
```

这行看似简单，但在多 Tool 场景下是关键信息。LLM 需要知道"我现在在哪"，才能正确决定：
- `write_file` 的相对路径应该怎么写
- `execute_command` 需不需要指定 `directoryPath`
- `list_directory` 应该列哪个目录

**把运行时状态注入 System Prompt，是让 LLM 做出正确决策的前提。** 这跟文章二中 `tool_call_id` 把执行结果回填到 messages 是同一个思路——信息不对称是决策错误的第一原因。

---

## 论点三：`for` + `maxIterations` 是 `while` 的工程安全版——给 Agent 装上"断路器"

### 3.1 从 while 到 for——一个微小变化背后的工程考量

文章一和文章二都在讲 `while (response.tool_calls && ...)` 循环。mini-cursor.mjs 用了一个不同的写法：

```js
async function runAgentWithTools(query, maxIterations = 30) {
  const messages = [new SystemMessage(/* ... */), new HumanMessage(query)];

  for (let i = 0; i < maxIterations; i++) {    // ← 不是 while(true)
    console.log(`正在等待第 ${i} 次 AI 思考...`);
    const response = await modelWithTools.invoke(messages);
    messages.push(response);

    if (response.tool_calls && response.tool_calls.length > 0) {
      for (const toolCall of response.tool_calls) {
        const foundTool = tools.find(t => t.name === toolCall.name);
        if (foundTool) {
          const toolResult = await foundTool.invoke(toolCall.args);
          messages.push(new ToolMessage({
            content: toolResult,
            tool_call_id: toolCall.id,
          }));
        }
      }
    } else {
      break;  // 没有工具调用，LLM 判断任务完成
    }
  }
  return messages[messages.length - 1].content;
}
```

**两个变化：**

| 维度 | 文章一二（while） | 本文（for + maxIterations） |
|---|---|---|
| 终止条件 | LLM 自主决定 + 无工具调用 | LLM 自主决定 + 迭代次数上限 |
| 并发策略 | `Promise.all` 并行执行同轮 Tool | 串行执行同轮 Tool（`for...of` 逐个调用） |
| 工程倾向 | 理论上的最优模式 | 生产环境的安全模式 |

### 3.2 为什么 `maxIterations` 是必须的

单 Tool 场景（只读文件），LLM 通常在 1-3 轮内完成。**多 Tool 场景（创建项目→写文件→装依赖→跑起来），一轮失败可能导致 LLM 反复尝试不同策略——如果没有上限，就是死循环。**

`maxIterations = 30` 不只是一个数字，它是 Agent 的"断路器"：
- 单次 Tool 调用失败 → LLM 看错误信息 → 调整策略 → 再试（正常流程）
- 但如果 LLM 陷入"反复尝试同一错误策略"的循环 → maxIterations 兜底

**这是从"Demo 能跑"到"生产能上线"的分水岭之一。** Demo 不需要断路器，因为你手动盯着，出问题就 Ctrl+C。生产环境的 Agent 在无人值守下运行，没有断路器就是定时炸弹。

### 3.3 串行 vs 并行：mini-cursor 为什么没用 `Promise.all`

mini-cursor 在同轮 Tool 执行时用了 `for...of` 串行而非 `Promise.all` 并行。这不是退步——**这是任务特性决定的。**

文章二的 `Promise.all` 适合"无依赖 Tool 并行执行"（同时读 3 个不相关的文件）。**但编程 Agent 的多 Tool 调用之间往往有隐式依赖：**

```
exec("创建 Vite 项目")
  → write("写 App.tsx")  // 依赖项目已创建，文件路径才存在
    → exec("pnpm install")  // 依赖 package.json 已存在
      → exec("pnpm run dev")  // 依赖依赖已安装
```

这四步必须串行——每一步依赖前一步的结果。**LLM 会自然地在不同轮次发出这些调用**（每轮一个 Tool），所以同轮之内没有并行需求。这种情况下 `Promise.all` 不会带来性能收益，而 `for...of` 让执行逻辑更清晰。

**选择串行还是并行，取决于 Task 的依赖结构，不取决于"哪个写法更高级"。**

---

## 论点四：node-exec 揭示的进程模型——Agent 的执行层为什么必须是"隔离的"

### 4.1 回到 node-exec.mjs——它不只是一个 demo

node-exec.mjs 看似简单，但它揭示了一个被前两篇文章忽略的问题：**Agent 的运行时架构长什么样。**

```js
import { spawn } from 'node:child_process';

const [cmd, ...args] = command.split(' ');
const child = spawn(cmd, args, {
  cwd,           // 继承当前工作目录
  stdio: 'inherit', // 输出直接显示在控制台
  shell: true,   // 支持 shell 语法（管道、重定向等）
});

child.on('error', (err) => { errorMsg = err.message; });
child.on('close', (code) => {
  if (code === 0) { process.exit(0); }
  else { process.exit(code || 1); }
});
```

**这三行 spawn 配置，每一行都在回答一个架构问题。**

### 4.2 Node 单线程 → Agent 不能在主线程执行命令

**Node.js 是单线程事件循环。** 如果 Agent 在主线程里同步执行 `npm install`（可能跑 30 秒），整个事件循环被阻塞——期间不能处理其他请求、不能响应心跳检测、不能被优雅关闭。

**`spawn` 解决的是"执行隔离"问题**：

```
┌─────────────────────────────┐     ┌──────────────────────┐
│   Agent 主进程（Node）        │     │   子进程（shell）      │
│                             │     │                      │
│  - LLM 推理调度              │ IPC │  - npm install        │
│  - Tool 路由与参数校验        │ ←──→│  - git clone          │
│  - Message 上下文管理         │     │  - pnpm run dev       │
│  - 错误处理与重试             │     │  - 任何 CLI 操作       │
│                             │     │                      │
│  单线程，不能阻塞              │     │  独立线程，可阻塞       │
└─────────────────────────────┘     └──────────────────────┘
```

**主进程负责"决策"（调哪个工具、传什么参数、解析结果），子进程负责"执行"（真正跑命令）。** 这跟文章二的"Tool 分离决策与执行"是同一个原则，只不过上升到了进程级别。

### 4.3 `stdio: 'inherit'` ——让 LLM 的"手"对用户可见

```
stdio: 'inherit'  →  子进程的输出直接打印到当前控制台
```

**这不是一个技术细节，这是一个用户体验决策。** Agent 在执行 `npm install` 时，用户能看到安装进度条；执行 `pnpm run dev` 时，用户能看到 Vite 的启动日志。如果 `stdio` 不是 inherit，所有输出都会被吞掉——用户看到一个黑盒，只知道"Agent 在干活"，不知道进展如何。

**这就是 Claude Code、Cursor、Trae 这些产品都在做的事——让 LLM 的"思考"和 Tool 的"执行"都对用户可见。** 可见性 = 信任。用户看不到执行过程，就不会信任 Agent 的结果。

### 4.4 `shell: true` ——能力边界与安全边界的矛盾

`shell: true` 让 Agent 能执行管道、重定向等 shell 语法——能力强了，但安全边界也模糊了。

**在 mini-cursor 这个 demo 中这不是问题**（本地运行、用户自己看得到），但在产品化时，它引出了 Agent 工程化最深层的矛盾：

> **Agent 的能力越强（能做的操作越多），安全风险越大（误操作的后果越严重）。能力边界和安全边界是同一条线，你把线往哪边推，另一边就会跟着动。**

Claude Code 的解决方案是"权限确认"——执行高风险命令前弹确认框。但这只是开始。**进程隔离（spawn 子进程）、权限收敛、命令白名单、执行日志审计——这些是 Agent 产品化时绕不过去的安全基础设施。**

---

## 全文收束

```
                           ┌────────────────────────────┐
                           │   Agent 工程化的四个维度      │
                           │   从"能调"到"能干活"          │
                           └──────────────┬─────────────┘
                                          │
        ┌─────────────┬─────────────┬─────┴─────┬─────────────┐
        ▼             ▼             ▼           ▼             ▼
  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
  │ Tool      │ │ Prompt    │ │ 循环      │ │ 进程      │ │ 安全      │
  │ 自完备性   │ │ 操作手册化 │ │ 断路器    │ │ 隔离      │ │ 可见性    │
  ├───────────┤ ├───────────┤ ├───────────┤ ├───────────┤ ├───────────┤
  │ mkdir -p  │ │ 不要 cd   │ │ for(i<30) │ │ spawn     │ │ stdio     │
  │ 递归创建   │ │ 反面示例   │ │ 防死循环   │ │ 子进程    │ │ inherit   │
  │ dirname   │ │ 动态注入   │ │           │ │ IPC       │ │           │
  ├───────────┤ ├───────────┤ ├───────────┤ ├───────────┤ ├───────────┤
  │ 文章一继承 │ │ 本文发现   │ │ 本文改进   │ │ 本文深入   │ │ 本文引出   │
  └───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘
```

**四句话概括全文——每一句对应一个论点：**

1. **多 Tool 场景下，单 Tool 的设计标准从"能用"升级为"不坑 LLM"**——`mkdir recursive` 替 LLM 兜底目录创建，`directoryPath` 独立参数避免 LLM 拼出错误的命令组合。Tool 内部越自完备，LLM 的协作压力越小。

2. **System Prompt 从"角色介绍"升级为"操作手册"**——在多 Tool 协作中，Prompt 的核心职责不是告诉 LLM 有什么工具（bindTools 已经做了），而是告诉它工具之间如何正确配合。反面示例比正面规则更重要——告诉 LLM"不要怎么做"比"要怎么做"更能防止幻觉错误。

3. **`for` + `maxIterations` 是 `while` 的工程安全版**——30 次迭代上限是 Agent 的"断路器"，防止多 Tool 复杂任务中的死循环。工程化的本质不是让 happy path 更快，而是让 bad path 不致命。

4. **进程隔离是把"决策-执行分离"原则从代码层推到了架构层**——`spawn` 子进程让 Agent 主进程不被 CLI 命令阻塞或带挂，`stdio: 'inherit'` 让用户看到执行过程（信任 = 可见性）。这是 Claude Code、Cursor 等产品在底层共同遵循的架构模式。

---

**三篇文章串成一条完整的 Agent 开发学习路径：**

```
文章一：Agent = LLM + Tool + Memory + RAG + MCP + Skills
        ↓ 知道了 Agent 是什么，为什么需要 Tool

文章二：Agent = LLM + while (tool_calls) { Promise.all + ToolMessage + invoke }
        ↓ 知道了 Tool 怎么被调度，消息循环怎么运转

文章三：多 Tool 协作 = 自完备 Tool + 操作手册级 Prompt + 断路器 + 子进程隔离
        ↓ 知道了当 Tool 变多时，工程化的四个维度怎么同步升级
```

**从"一个 Tool 能对话"到"四个 Tool 能自动创建项目"——这就是 Agent 从 demo 走向产品的完整工程路径。**

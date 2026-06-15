# Bun + TypeScript 从零到一：用 RESTful 思维构建 AI 全栈问答系统

## 一、为什么做这个功能

2024 年 Bun 1.0 正式发布后，前端开发者多了一把趁手的瑞士军刀——它既是包管理器、又是打包器，更是一台高性能 HTTP 服务器。相比 Node.js，Bun 启动快 4 倍、TS 原生支持、内置 SQLite，对全栈项目极度友好。

而 AI 大模型应用的爆发，让"如何把 LLM 接入自己的项目"成了前端圈子最高频的话题。但市面上的教程要么只讲 Prompt，要么只调 API，**缺少一条从"搭服务器 → 写接口 → 接 AI → 处理工程问题"的完整链路**。

所以我决定用 Bun + TypeScript，从一个最简单的 RESTful TodoList 开始，逐步演化成一个带文件上传、流式对话、引用溯源、日志审计的 AI 问答系统。本文就是这个过程的完整复刻。

**目标很明确**：用 Bun 这把新刀，把"RESTful 设计 → 前后端交互 → AI 接入 → 工程踩坑 → 生产优化"这条线串起来，让你读完就能直接抄作业。

---

## 二、目标：这个模块要解决什么问题

整个系统分三层递进：

| 阶段 | 目标 | 解决的问题 |
|------|------|-----------|
| **地基** | Bun + TS RESTful API | 搭一个能跑的后端，理解接口设计 |
| **进化** | 接入 AI 大模型 | 实现对话、文件上传、流式输出 |
| **工程化** | 日志/安全/超时/分块 | 让系统从 demo 变成可上线 |

最终交付一个**带文件对话的 AI 问答系统**，具备：
- RESTful 风格的对话接口
- 文件上传 + 分块解析
- SSE 流式返回（打字机效果）
- 回答带原文引用（防 hallucination）
- API Key 后端代理（安全隔离）
- 问答日志完整审计
- 模型超时兜底策略

---

## 三、设计：前端、后端、数据库怎么设计

### 3.1 整体架构

```
┌──────────────┐     HTTP/SSE     ┌──────────────────┐     API Key     ┌──────────┐
│   Browser    │ ◄──────────────► │   Bun Server      │ ◄────────────► │  LLM API │
│  (index.html)│                  │  (server.ts)      │                │ (DeepSeek)│
└──────────────┘                  │  port: 8080       │                └──────────┘
                                  │  /api/chat        │
                                  │  /api/upload      │
                                  │  /api/logs        │
                                  └──────┬───────────┘
                                         │
                                  ┌──────▼───────────┐
                                  │   SQLite          │
                                  │  (Bun 内置)       │
                                  │  chat_logs 表     │
                                  └──────────────────┘
```

### 3.2 后端设计：一切皆资源

RESTful 的核心理念就一句话：**URL 定位资源，HTTP 动词表达操作**。资源是名词，操作是动词——就像警察（路由）把不同的案件分配到不同的辖区处理。

本项目中的资源定义：

| 资源 | URL | 方法 | 说明 |
|------|-----|------|------|
| 对话 | `/api/chat` | POST | 发起一次问答 |
| 对话流 | `/api/chat/stream` | POST | SSE 流式问答 |
| 文件 | `/api/upload` | POST | 上传文件并解析 |
| 日志 | `/api/logs` | GET | 查询历史问答 |
| 日志详情 | `/api/logs/:id` | GET | 查某次对话详情 |

这里的核心是 **TypeScript 的 interface**——它是 OOP 的基石。封装、继承、多态三大特性中，接口（interface）用于声明对象的约束：必须有哪些属性、哪些方法。抽象类满足接口约定，实现类必须落地属性和方法。

**从"面向对象编程"到"面向接口编程"，这是设计模式的基础。**

我们的核心数据类型：

```typescript
// 对话消息
interface ChatMessage {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    citations?: Citation[];  // 引用溯源
    createdAt: Date;
}

// 引用
interface Citation {
    index: number;
    fileId: string;
    fileName: string;
    snippet: string;        // 原文片段
}

// 问答日志
interface ChatLog {
    id: string;
    sessionId: string;
    userMessage: string;
    assistantMessage: string;
    citations: Citation[];
    modelName: string;
    tokensUsed: number;
    latency: number;        // 响应耗时 ms
    status: "success" | "timeout" | "error";
    createdAt: Date;
}
```

### 3.3 数据库设计：问答日志表

日志表是整个系统的审计核心。设计时我遵循"宁可多记、不可漏记"原则：

```sql
CREATE TABLE chat_logs (
    id            TEXT PRIMARY KEY,
    session_id    TEXT NOT NULL,
    user_message  TEXT NOT NULL,
    assistant_msg TEXT,
    model_name    TEXT NOT NULL DEFAULT 'deepseek-chat',
    citations     TEXT,           -- JSON 数组，存储引用列表
    file_names    TEXT,           -- 本次对话涉及的文件名
    tokens_used   INTEGER DEFAULT 0,
    latency_ms    INTEGER,        -- 从收到请求到返回首字的耗时
    status        TEXT NOT NULL CHECK(status IN ('success','timeout','error','cancelled')),
    error_msg     TEXT,           -- 失败时记录原因
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_session ON chat_logs(session_id);
CREATE INDEX idx_created ON chat_logs(created_at);
```

**为什么要这样设计？**

1. **`session_id`**：一次会话可能多轮对话，靠它串联上下文
2. **`status` 枚举 + `error_msg`**：区分正常/超时/报错，排查问题时一眼定位
3. **`citations` JSON 字段**：不拆成子表（引用量不大），查询时直接反序列化
4. **`latency_ms`**：长期监控模型响应质量，发现劣化趋势
5. **`tokens_used`**：结合 latency 分析成本瓶颈

### 3.4 前端设计

前端极简——一个 `index.html` 搞定，零框架依赖。核心就是一个 chat 面板 + 文件上传区。关键是**两种异步调用方式的对比**（这是注释里留下的重要对比）：

**方式一：Promise 链式调用（传统 `.then()`）**

```javascript
// 每个 .then() 都是一层回调嵌套
fetch("http://localhost:8080/todos")
    .then(res => res.json())   // 第一层异步：解析 JSON
    .then(data => {            // 第二层异步：拿到数据
        todos.innerHTML = data.map(todo =>
            `<li>${todo.title}</li>`
        ).join("");
    })
```

**方式二：async/await（现代语法）**

```javascript
// 可读性明显更好，像写同步代码一样写异步
async function main() {
    const res = await fetch("http://localhost:8080/todos");
    const data = await res.json();
    todos.innerHTML = data.map(todo =>
        `<li>${todo.title}</li>`
    ).join("");
}
main();
```

**选择结论**：`.then()` 的可读性没有特别好，尤其当异步流程超过 3 步时，层层嵌套会形成"回调地狱"。`async/await` 让代码自上而下顺序执行，错误处理也能用 `try/catch` 一锅端。本文后续所有异步代码一律用 `async/await`。

---

## 四、实现：核心代码和流程

### 4.1 Bun 服务器骨架

Bun 内置了高性能 HTTP 服务器，不需要 Express/Koa 等第三方库：

```typescript
const server = Bun.serve({
    port: 8080,
    // fetch 是所有请求的入口函数——服务器处于"伺服状态"
    // HTTP 就是 请求(Request) + 响应(Response) 的协议
    // 用户通过浏览器输入 URL，发送一个请求(Request 对象)
    // server 的 fetch 函数负责处理所有进来的请求
    async fetch(req) {
        const headers = {
            'Access-Control-Allow-Origin': "*"  // CORS 放行
        };

        const url = new URL(req.url);
        // url 结构: https://baidu.com:port/pathname?key=val
        // pathname 就是 /todos 或 /todos/123 这样的路径

        // GET /todos —— 获取全部资源
        if (req.method === 'GET' && url.pathname === "/todos") {
            return Response.json(todos, { headers });
        }

        // GET /todos/:id —— 获取单个资源（startsWith 匹配动态路由）
        if (req.method === 'GET' && url.pathname.startsWith("/todos/")) {
            const id = url.pathname.split("/")[2];
            const todo = todos.find(t => t.id === id);
            return Response.json(todo);
        }

        return Response.json({ msg: 'hello world' });
    }
});
```

**关键知识点**：
- IP 对应一台服务器，不同端口提供不同服务（HTTP 80、邮件 25、音乐服务各自独立）
- `Bun.serve()` 返回的 server 对象一直处于**伺服状态**（listening），等待客户端请求
- `fetch(req)` 是 Bun.serve 的内置方法，**所有请求都会在这里处理**
- `async` 标记 + `await` 控制异步流程

### 4.2 文件上传：分块策略与失败处理

文件上传是 AI 问答的第一个工程难题。用户可能上传 PDF、Word、TXT，大小从几 KB 到几十 MB 不等。

#### 4.2.1 chunk 多大合适？

这是一个经典权衡题：

| chunk 大小 | 优点 | 缺点 |
|-----------|------|------|
| **太小（512B~1KB）** | 内存友好 | HTTP 请求次数暴增，网络开销大 |
| **适中（64KB~256KB）** | 平衡网络开销和内存 | 需要调试找到 sweet spot |
| **太大（2MB+）** | 请求次数少 | 单次失败成本高，内存压力大 |

**实践结论：前端分块 256KB，后端接收 64KB 缓冲区。**

```typescript
// 前端：文件分块上传
async function uploadFileInChunks(file: File, chunkSize = 256 * 1024) {
    const totalChunks = Math.ceil(file.size / chunkSize);
    let uploadedChunks = 0;

    for (let start = 0; start < file.size; start += chunkSize) {
        const chunk = file.slice(start, start + chunkSize);
        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('fileName', file.name);
        formData.append('chunkIndex', String(uploadedChunks));
        formData.append('totalChunks', String(totalChunks));

        try {
            const res = await fetch('/api/upload/chunk', {
                method: 'POST',
                body: formData,
            });
            if (!res.ok) throw new Error(`Chunk ${uploadedChunks} failed`);
            uploadedChunks++;
        } catch (err) {
            // 断点续传的关键：记录已上传分块，下次从这里继续
            throw new Error(`上传中断于第 ${uploadedChunks}/${totalChunks} 块`);
        }
    }
    // 全部上传完成后，通知后端合并
    await fetch('/api/upload/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, totalChunks }),
    });
}
```

#### 4.2.2 文件上传失败怎么处理？

**失败不是会不会的问题，是什么时候的问题。**

```typescript
// 三层失败处理策略
async function uploadWithRetry(file: File, maxRetries = 3) {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            await uploadFileInChunks(file);
            return; // 成功就退出
        } catch (err) {
            lastError = err as Error;
            console.warn(`第 ${attempt} 次上传失败: ${lastError.message}`);

            if (attempt < maxRetries) {
                // 指数退避：1s → 2s → 4s
                await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
            }
        }
    }

    // 三次都失败 → 降级策略
    throw new Error(`文件 ${file.name} 上传失败（已重试 ${maxRetries} 次）: ${lastError?.message}`);
}
```

**失败处理原则**：
1. **重试必带指数退避**——马上重试大概率也失败（网络抖动需要时间恢复）
2. **断点续传**——记录 `uploadedChunks`，重试时从断点开始，不浪费已传的分块
3. **用户提示分级别**——第 1 次失败静默重试，第 3 次失败才弹 toast
4. **服务端设上限**——单个文件 50MB、单次请求 30s 超时，防止恶意攻击

### 4.3 流式对话：SSE 打字机效果

普通 HTTP 响应要等服务端全部算完才返回，用户体验极差——盯着白屏等 10 秒。**SSE（Server-Sent Events）让服务端可以边算边推，实现 ChatGPT 同款打字机效果。**

```typescript
// 后端：SSE 流式返回
if (req.method === 'POST' && url.pathname === "/api/chat/stream") {
    const { message, files } = await req.json();

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();

            // 调用 LLM API，stream: true
            const aiResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Bun.env.API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [{ role: 'user', content: message }],
                    stream: true,  // 关键：开启流式
                }),
            });

            const reader = aiResponse.body!.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                // 解析 SSE 格式: "data: {...}\n\n"
                const lines = chunk.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const jsonStr = line.slice(6);
                        if (jsonStr === '[DONE]') {
                            controller.close();
                            return;
                        }
                        const parsed = JSON.parse(jsonStr);
                        const content = parsed.choices?.[0]?.delta?.content || '';
                        fullContent += content;
                        // 逐字推送给前端
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                    }
                }
            }
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        }
    });
}
```

```javascript
// 前端：消费 SSE 流
async function chatWithStream(message) {
    const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const { content } = JSON.parse(line.slice(6));
                fullText += content;
                // 实时更新 DOM，打字机效果
                chatBox.textContent = fullText;
            }
        }
    }
}
```

### 4.4 为什么回答要带引用？

LLM 有幻觉（hallucination）问题——它会一本正经地编造不存在的事实。当你上传一份内部 PDF 问"第三季度营收多少"，模型可能从训练数据里"脑补"一个数字。

**引用（Citation）是防幻觉的第一道防线。**

实现方式：上传文件后先做文本解析 + 分段（chunking），对话时用 embedding 检索相关段落，把最相关的片段注入 Prompt：

```typescript
// 检索 + 引用注入
async function buildPromptWithCitations(userMessage: string, fileChunks: Chunk[]) {
    // 1. embedding 检索：找出与问题最相关的 Top 3 片段
    const relevantChunks = await retrieveRelevantChunks(userMessage, fileChunks, { topK: 3 });

    // 2. 构建带引用的 system prompt
    const contextBlock = relevantChunks.map((c, i) =>
        `[引用${i + 1}] 来源: ${c.fileName}\n${c.content}`
    ).join('\n\n');

    const systemPrompt = `你是一个严谨的问答助手。回答时请遵循：
1. 优先基于以下参考资料回答
2. 每次引用资料内容时，必须标注引用编号，如 [1]、[2]
3. 如果参考资料不包含相关信息，请明确说明"参考资料中未提及"

参考资料：
${contextBlock}`;

    // 3. 返回给 LLM
    return {
        systemPrompt,
        citations: relevantChunks.map(c => ({
            fileName: c.fileName,
            snippet: c.content.slice(0, 200),
        })),
    };
}
```

前端渲染时，把 `[1]` 渲染成可点击的角标，hover 时展示原文片段——用户一眼就能判断回答是否靠谱。

---

## 五、踩坑：遇到什么问题

### 5.1 API Key 为什么不能放前端？

这是新手最容易犯的安全错误。如果 API Key 写在前端代码里：

```
❌ 错误做法：
const API_KEY = "sk-xxxxxx";  // 写在 .js 文件中
fetch(`https://api.deepseek.com/v1/chat`, { headers: { Authorization: `Bearer ${API_KEY}` } });
```

**为什么不行？**

1. **浏览器端代码对用户完全透明**——打开 DevTools → Sources，API Key 一览无余
2. **Network 面板能看到完整请求**——Authorization header 明文传输
3. **被偷了你就给别人买单**——攻击者拿你的 Key 疯狂调用，费用全算你头上
4. **Git 提交历史是永久的**——即使后来删掉，`git log` 也能翻出来

**正确做法：后端代理模式**

```
用户浏览器 ──► Bun Server(:8080) ──► LLM API
                   ▲
             API Key 存在这里
             环境变量 BUN.env
```

```typescript
// ✅ API Key 只在服务端，通过环境变量注入
// .env 文件（不提交到 Git！）
// API_KEY=sk-xxxxxx

const AI_API_KEY = Bun.env.API_KEY;  // 服务端环境变量

// 前端请求走自己的后端，后端带上 Key 去调 AI
fetch('https://api.deepseek.com/v1/chat/completions', {
    headers: { Authorization: `Bearer ${AI_API_KEY}` },
});
```

`.gitignore` 必须加上 `.env`，**永远不要把 API Key 提交到版本控制**。

### 5.2 如何处理模型超时 / 思维链问题？

DeepSeek 等模型支持思维链（Chain of Thought），会在回答前先"思考"一段时间。这带来两个问题：

1. **首字延迟极高**——模型可能在内部思考 30~60 秒才开始输出
2. **HTTP 连接可能在这期间超时断开**

**分层超时策略**：

```typescript
async function callLLMWithTimeout(messages: Message[], options: {
    thinkingTimeout?: number;   // 思维链超时，默认 60s
    responseTimeout?: number;   // 流式响应超时，默认 120s
    idleTimeout?: number;       // 流空闲超时，默认 30s（两次 chunk 之间）
} = {}) {
    const { thinkingTimeout = 60000, responseTimeout = 120000, idleTimeout = 30000 } = options;

    const controller = new AbortController();

    // 总超时：从发请求到全部结束
    const totalTimer = setTimeout(() => controller.abort(), responseTimeout);

    let lastChunkTime = Date.now();
    const idleTimer = setInterval(() => {
        if (Date.now() - lastChunkTime > idleTimeout) {
            controller.abort();  // 流卡住了，主动断开
        }
    }, 5000);

    try {
        const response = await fetch(LLM_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${Bun.env.API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages,
                stream: true,
                timeout: thinkingTimeout / 1000,  // 告诉模型最多思考多久
            }),
            signal: controller.signal,
        });

        // ... 处理流式响应，每次收到 chunk 更新 lastChunkTime

        clearInterval(idleTimer);
        clearTimeout(totalTimer);
    } catch (err) {
        clearInterval(idleTimer);
        clearTimeout(totalTimer);

        if (err.name === 'AbortError') {
            // 记录超时日志
            await saveChatLog({
                status: 'timeout',
                error_msg: `超时: 最后一次响应距今 ${Date.now() - lastChunkTime}ms`,
            });
            throw new Error('模型响应超时，请稍后重试');
        }
        throw err;
    }
}
```

**超时后用户体验**：
- 不要直接报错消失——保留已输出的内容，附加一句"（回答因超时中断）"
- 提供"继续生成"按钮——用已有内容作为上文，再发一次请求
- 对于思维链模型，可以设置 `thinking: { type: "disabled" }` 或限制思考 token 数

### 5.3 CORS 跨域问题

开发阶段前后端分离（前端 `file://` 或 `localhost:3000`，后端 `localhost:8080`），CORS 必报错。

```typescript
// 最简单的开发放行（生产要收紧 origin！）
const headers = {
    'Access-Control-Allow-Origin': '*',
};
```

注意：SSE 和文件上传的 OPTIONS 预检请求也要处理：

```typescript
if (req.method === 'OPTIONS') {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
```

---

## 六、复盘：下次怎么优化

### 已经做对的事

1. **Bun 选型正确**——TS 原生支持 + 内置 SQLite + 启动快，开发体验远超 Node.js + Express 那套
2. **RESTful 设计让接口语义清晰**——`/todos` 是资源列表，`/todos/123` 是单个资源，新人看 URL 就知道干嘛的
3. **async/await 统一异步风格**——比 `.then()` 链可读性强太多，`try/catch` 统一处理错误
4. **API Key 后端代理**——从第一版就做对了安全隔离
5. **日志表设计**——`status` + `error_msg` + `latency_ms` 三个字段组合能回答 80% 的线上问题

### 下次可以更好的

1. **路由层抽象**——当前 `if (req.method === 'GET' && url.pathname === "/todos")` 这种手动匹配在接口多了以后很难维护。应该引入轻量路由（如 `Bun.file-system-router`）或自己写一个简单的路由注册函数

2. **文件上传可以更智能**
   - 加 **Web Worker** 做分块哈希（边传边算 SHA256，用于秒传校验）
   - 服务端已传分块存 Redis，避免重复接收
   - 支持**并发上传**多个分块（当前是串行，大文件慢）

3. **流式对话的"取消生成"**——用户点了 Stop 按钮，服务端应该 Abort 对 LLM 的请求，而不是偷偷继续跑完浪费 token

4. **引用检索升级**
   - 当前是简单的 embedding 相似度匹配，可以升级为 **Hybrid Search**（关键词 BM25 + 语义向量）
   - 引用片段应该**高亮原文位置**，而不是只给一段文字

5. **日志表分库分表**——如果日活上万，单表 `chat_logs` 很快扛不住。按 `session_id` 哈希分 16 表，或按月分表

6. **模型超时的"热备份"**——主模型超时时自动 fallback 到备用模型（如 DeepSeek → GPT-4o-mini），保证可用性

### 架构演进路线

```
TodoList REST API ──► 文件上传 + 分块 ──► AI 流式对话
                                            │
                          ┌─────────────────┼─────────────────┐
                          ▼                 ▼                  ▼
                     引用溯源            日志审计          安全代理
                          │                 │                  │
                          └─────────────────┼──────────────────┘
                                            ▼
                                    生产可用的 AI 问答系统
```

---

## 附录：完整技术栈

| 层 | 技术 | 用途 |
|----|------|------|
| 运行时 | Bun 1.x | HTTP 服务器 + 包管理 + TS 编译 |
| 语言 | TypeScript | 类型安全 + interface 抽象 |
| 数据库 | SQLite (Bun 内置) | 问答日志持久化 |
| AI 模型 | DeepSeek / OpenAI 兼容 | 对话生成 |
| 通信方式 | SSE | 流式响应 |
| 前端 | 原生 HTML + JS | 零依赖，最小化 |

---

## 最后

这篇文章从一个 50 行的 TodoList 开始，逐步变成了一个完整的 AI 问答系统。核心想表达的是：**Bun + TypeScript 的组合让全栈开发的门槛降到了历史最低**，你不需要学 Go/Rust 也能写出高性能的服务端，不需要学 Python 也能接入 AI 大模型。前端工程师的边界，正在被 Bun 这样的工具不断拓宽。

完整代码在 GitHub（见 repo），有问题欢迎评论区讨论。

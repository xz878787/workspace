# 流式输出：AI 产品的第一个关键用户体验

> 当你的用户盯着空白屏幕等待回复时，每一秒都在消磨他们对产品的信心。流式输出不是锦上添花的动画效果——它是决定 AI 产品存亡的第一道体验关卡。

---

## 开篇：一个让你失去用户的真实场景

打开任何一个 AI 聊天应用，输入一个复杂问题，然后按下回车。

接下来会发生什么？

如果是**非流式**：屏幕一片空白。1 秒。2 秒。5 秒。10 秒。你没有得到任何反馈。你不知道系统是否收到了你的问题，不知道 AI 是否在思考，不知道网络是不是断开了。你开始焦虑，开始怀疑——"这个产品挂了？"，"我是不是该刷新一下？"。当你正准备关掉页面的时候，答案终于一次性跳了出来。

作为对比，再想象**流式输出**的感觉：你按下回车，几乎立刻（在第一个 token 生成后），第一个字就出现了。紧接着第二个字、第三个字……像打字机一样，一个字一个字地往外蹦。你的眼睛跟着文字走，你在**阅读**，你在**消费内容**。你完全没有在"等"——因为从你的视角看，系统一直在给你东西。

同样的 LLM 推理时长，两种感知完全不同。前者是"等了 10 秒什么也没发生"，后者是"我一按回车它就开始了"。**等待变成了观看，焦虑变成了期待。**

这就是为什么说流式输出是 AI 产品的**第一个**关键用户体验——不是第二个，不是锦上添花，而是用户在按下发送按钮后接触到的第一件事。这件事处理不好，后面的所有功能用户都看不到。

---

## 一、核心命题：为什么非流不可？

### 1.1 耗时的根源在哪里？

LLM 的推理，本质上是 **Transformer 架构的逐 token 自回归生成**。什么叫自回归？就是一次只生成一个 token，生成完毕后把这个 token 拼到上下文里，再用新的上下文预测下一个 token。循环往复，直到模型判定输出结束。

这个过程的耗时取决于两个变量：

- **问题的复杂度**：需要多少步推理、涉及多少知识点。一个"1+1 等于几"和一个"请详细分析中美 AI 政策的差异与趋势"，所需的计算量差了几个数量级。
- **回答的长度**：期望生成多少 token。一个"是/否"和一个 2000 字的长文，生成时间自然不同。

所以耗时不是 bug，是 LLM 工作的物理规律。你没有办法让一次生成 2000 个 token 的操作变成 0.1 秒——Transformer 每一层都要跑，每一轮自回归都要算。

### 1.2 核心洞察：不是"减少等待时间"，而是"消灭等待感"

问题既然无法消除，那就换个思路——**不改变等待的客观时长，改变等待的主观感受。**

这就是流式输出的底层逻辑：

| 方式 | 用户看到第一个字的时间 | 用户心理状态 |
|------|----------------------|------------|
| 非流式（一次性返回） | 全部 token 生成完毕后 | 空白 → 焦虑 → 怀疑 → 流失 |
| 流式输出 | 第 1 个 token 生成后（毫秒级） | 立刻阅读 → 持续消费 → 沉浸 |

差距不在技术上，在心理学上。**第一个 token 的到达，是"系统在响应我"的最强信号。** 人类对有反馈的系统天然信任，对无反馈的系统天然怀疑。这就是为什么进度条能让等待变得可忍受——即使进度条本身是假的（很多加载动画根本不反映真实进度），它也给了你一个心理锚点。

流式输出的本质，就是把 LLM 推理的**强制延迟**，包装成了**打字的自然节奏**。人类喜欢看打字——因为打字意味着"有人在写"，意味着内容是新鲜的、实时的、活的。

这就是金字塔的塔尖：**流式输出解决的不是技术问题，是用户心理问题。** 一种将"被动等待"转化为"主动消费"的体验设计。

---

## 二、协议层：一根管子，从服务器接到客户端

### 2.1 物理隐喻：水管，不是邮递员

传统的 HTTP 请求-响应模式像是**邮递员模型**：你发一封信，邮递员把完整的包裹送回来。一次一单，完结。

流式输出更像是**水管模型**：你在 LLM 服务器和 Chatbot 客户端之间接了一根管子。服务器那边每生成一个 token，就往管子里倒。客户端这边，水龙头开着，token 像水流一样源源不断地流过来。

这根管子在协议层是怎么实现的？

### 2.2 约定：两端都要"打开开关"

流式输出需要**客户端和服务器双方的配合**，缺一端都不行。

**第一步：客户端发送请求时，告诉服务器"我需要流式"。**

在我们的 demo 中，请求体里有一个关键的布尔值字段：

```json
{
  "model": "deepseek-chat",
  "messages": [
    { "role": "user", "content": "讲一个关于中国龙的故事" }
  ],
  "stream": true
}
```

`stream: true` 就是客户端对服务器说的暗号。这个字段的含义是：**"不要等全部生成完再返回我，每生成一个 token 就立刻给我。"**

如果 `stream: false`（或者不传），服务器会在内部生成完整个回答，把所有内容拼好，一次性作为一个完整的 JSON 响应返回。这就是"邮递员模型"。

**第二步：服务器切换行为模式。**

收到 `stream: true` 后，服务器的工作方式发生了根本改变：

- **不再一次性关闭连接**：HTTP 连接保持打开状态，`Content-Type` 被设置为 `text/event-stream`。
- **每生成一个 token 就 flush 一次**：不再在内部囤积，生成即发送。每一条消息都是一个独立的 SSE（Server-Sent Events）事件。
- **以 `[DONE]` 作为流的结束信号**：当模型判定输出结束时，服务器发送最后一条消息 `data: [DONE]`，然后关闭连接。

### 2.3 SSE：最简单的流式协议

SSE（Server-Sent Events）是 HTTP 协议原生的流式传输能力。它不需要升级为 WebSocket，不需要额外的握手，不需要帧协议。它就是**普通的 HTTP 响应，只是连接不关，数据持续写入**。

SSE 的数据格式极其简单，只有一条规则——每条消息以 `data: ` 开头，以换行符 `\n` 分隔：

```
data: {"choices":[{"delta":{"content":"中"}}]}

data: {"choices":[{"delta":{"content":"国"}}]}

data: {"choices":[{"delta":{"content":"龙"}}]}

data: {"choices":[{"delta":{"content":"是"}}]}

data: [DONE]
```

为什么 LLM API 不用 WebSocket？因为没必要。流式输出是**单向的**——数据只从服务器流向客户端。SSE 内置在 HTTP 中，不需要额外库，任何能发 HTTP 请求的环境都能用。而且 SSE 天然支持 HTTP/2 的多路复用，性能和兼容性都优于 WebSocket。

### 2.4 一次性返回 vs 流式返回：响应的结构差异

**非流式响应（`stream: false`）**：一个完整的 JSON 对象，包含全部内容：

```json
{
  "choices": [
    {
      "message": {
        "content": "中国龙是中华文化中最具代表性的神兽..."
      }
    }
  ]
}
```

**流式响应（`stream: true`）**：多条 SSE 消息，每条只包含增量（delta），不是全量：

```
data: {"choices":[{"delta":{"content":"中"},"index":0}]}

data: {"choices":[{"delta":{"content":"国"},"index":0}]}

data: {"choices":[{"delta":{"content":"龙"},"index":0}]}

data: {"choices":[{"delta":{},"index":0,"finish_reason":"stop"}]}

data: [DONE]
```

注意三个关键区别：

1. **字段名变了**：非流式用的是 `message.content`，流式用的是 `delta.content`。`delta` 是增量，每次只给你**新增**的那一个 token，不是前面所有 token 的重复。
2. **不再是一次性 JSON**：你不能用 `response.json()` 来解析——因为响应体不是一个合法的 JSON 对象，而是一连串以 `data:` 开头的文本行。
3. **结束信号**：`finish_reason: "stop"` 和最后的 `[DONE]` 标记，告诉客户端"到此为止，你可以停止读取了"。

### 2.5 深入理解：真正发送的是什么？

为了彻底理解，我们来看一次真实的流式请求。用 `curl` 模拟客户端发出请求：

```bash
curl https://api.deepseek.com/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DEEPSEEK_API_KEY" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "你好"}],
    "stream": true
  }'
```

你会看到终端里不是一次性打印完，而是一个字一个字往外蹦——因为 `curl` 在收到每个 SSE chunk 时就会立即输出到终端。这就是流的最原始形态。

---

## 三、前端实现：逐行拆解，不留死角

前面讲了协议和原理。现在进入正题——前端工程师拿到 `stream: true` 的响应后，怎么处理？

非流式只需要一行：

```js
const data = await response.json();
content.value = data.choices[0].message.content;
```

但流式不行，因为响应体不是一个合法的 JSON。它是一个**二进制流（ReadableStream）**，里面装着 SSE 文本。前端要做的是：读取二进制 → 解码为文本 → 解析 SSE 格式 → 提取 token → 拼接显示。

下面我们逐行拆解 demo 中的完整实现。

### 3.1 构造请求

```js
const endpoint = 'https://api.deepseek.com/chat/completions';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
};

const response = await fetch(endpoint, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    model: 'deepseek-chat',
    messages: [{ role: 'user', content: question.value }],
    stream: stream.value,
  }),
});
```

逐行解释：

- **`endpoint`**：DeepSeek API 的 Chat Completions 端点。所有的 LLM API（OpenAI、Anthropic、DeepSeek）都遵循这个 `POST /chat/completions` 的路径约定——这是 OpenAI 最早制定的行业事实标准，各家都兼容。
- **`headers`**：
  - `Content-Type: application/json`：告诉服务器，我发过来的是一个 JSON 请求体。
  - `Authorization: Bearer <API_KEY>`：Bearer Token 认证。`Bearer` 在英文中是"持有者"的意思——持有这个 token 的人即拥有调用权限。不要写成 `Bearer` 之外的格式，空格要紧跟。
- **`fetch` 的 `method: 'POST'`**：用 POST 而不是 GET，因为请求体里包含完整的问题和历史消息。GET 请求体受限于 URL 长度，且不够安全（参数暴露在 URL 中）。POST 请求体加密传输，支持任意长度。
- **`stream: stream.value`**：这是 `ref(false)` 的响应式变量，由模板中的 checkbox 控制。用户可以勾选"流式输出"，这个值就变成 `true`。

### 3.2 流式分支 vs 非流式分支

```js
if (stream.value) {
  // 流式输出逻辑——下面详细展开
} else {
  // 非流式输出：直接用 response.json() 获取完整结果
  const data = await response.json();
  content.value = data.choices[0].message.content;
}
```

非流式分支很简单，一行 `response.json()` 就解决。但请注意：在非流式模式下，`response.json()` 会等待整个响应体接收完毕，然后一次性解析。这就是用户需要等待全部 token 生成完毕的原因——没收到全部数据之前，`response.json()` 不会返回。

### 3.3 流式分支：四件套

进入流式分支后，首先要做的是清空之前的内容，然后准备"四件套"：

```js
content.value = '';  // 清空旧内容，为流式输出做准备

const reader = response.body?.getReader();  // ① 读取器
const decoder = new TextDecoder();           // ② 解码器
let done = false;                             // ③ 完成标志
let buffer = '';                              // ④ 缓冲区
```

**`reader`——读取器**

`response.body` 是一个 `ReadableStream` 对象。什么叫 `ReadableStream`？它是 WHATWG Streams API 定义的标准接口，代表一个**可读的二进制数据流**。你可以把它想象成一个传送带——上面隔一段放一个装着二进制数据的箱子。数据在传送带上不断到达，你需要一个"取货员"把箱子一个个取下来。

`getReader()` 就是这个取货员。它返回一个 reader 对象，核心方法是 `reader.read()`，每次调用返回传送带上的下一个箱子。

这里写了 `response.body?.getReader()` 而不是 `response.body.getReader()`，加了一个**可选链操作符 `?.`**，是为了防御 `response.body` 为 `null` 的情况（虽然正常不会，但防御性编程永远值得做）。

**`decoder`——解码器**

你从传送带上取下来的箱子是 **Uint8Array**——二进制字节数组。为什么是二进制？因为 HTTP 协议在底层传输的就是字节。不管你的内容是文本、图片还是视频，在传输层都是 0 和 1。

`TextDecoder` 是浏览器内置的 API，专门负责把二进制字节数组解码为 JavaScript 字符串。给它二进制，它给你文本。

**`done` 和 `buffer`——状态管理**

`done` 是循环的终止条件。当读到流的末尾（`reader.read()` 返回 `done: true`）或者读到 `[DONE]` 标记时，设为 `true`。

`buffer` 是整段代码里**最微妙的设计**。先记住这个变量的存在，下面会详细解释为什么需要它。

### 3.4 主循环：不停读，直到结束

```js
while (!done) {
  const { value, done: isDone } = await reader.read();
  done = isDone;
  if (value) {
    const chunk = decoder.decode(value, { stream: true });
    buffer += chunk;

    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const jsonStr = line.slice(6);
        if (jsonStr === '[DONE]') {
          done = true;
          break;
        }
        try {
          const data = JSON.parse(jsonStr);
          const delta = data.choices[0]?.delta?.content || '';
          content.value += delta;
        } catch (e) {
          console.error('解析错误:', e);
        }
      }
    }
  }
}
```

这段代码是整个流式输出的核心。我们逐行拆解。

### 3.5 `reader.read()`——读一个箱子

```js
const { value, done: isDone } = await reader.read();
done = isDone;
```

`reader.read()` 返回一个 Promise，resolve 后得到一个对象 `{ value, done }`：

- **`value`**：一个 `Uint8Array`，即本次读到的二进制数据块。如果流已结束，`value` 为 `undefined`。
- **`done`**：一个布尔值，表示流是否已经读完（EOF）。当 `done` 为 `true` 时，`value` 一定是 `undefined`。

这里使用了解构赋值并重命名：`done: isDone`，然后把 `isDone` 赋给外层的 `done` 变量。两个 `done` 虽然同名但不冲突——解构出来的是局部的，赋值的目标是外层的，JavaScript 的块作用域保证了这点。

注意：并不是每次 `reader.read()` 都恰好拿到一个 token。TCP 传输是以**数据块（chunk）**为单位的，一块可能包含完整的多个 token 行，也可能只包含半个 token 行（被从中间截断了）。这就是 buffer 存在的原因。

### 3.6 `decoder.decode(value, { stream: true })`——解码二进制

```js
const chunk = decoder.decode(value, { stream: true });
```

`decoder.decode()` 的参数含义：

- **第一个参数 `value`**：Uint8Array 二进制数据。
- **第二个参数 `{ stream: true }`**：这是一个关键配置。当 `stream: true` 时，decoder 知道还会有后续数据，所以它不会假设当前字节数组构成完整的字符。例如，一个中文字符在 UTF-8 编码下占 3 个字节，如果当前 chunk 只包含前 2 个字节，decoder 会保留这 2 个字节，等下一次 decode 时和新数据拼接起来，再完整输出这个汉字。如果设 `stream: false`（默认），decoder 会直接输出不完整的乱码字符（`�`，即 �）。

这层设计保障了**多字节字符不会在 chunk 边界处断裂**。

### 3.7 buffer 的精妙设计——解决黏包与断包

```js
buffer += chunk;
const lines = buffer.split('\n');
buffer = lines.pop() || '';
```

这是整段代码中最容易被忽视、却最精妙的三行。先讲问题：

**SSE 协议规定一行就是一条消息。** 但 TCP 传输不认"行"。它在传输层把数据切成任意大小的 chunk，你收到的 chunk 有以下几种可能：

```
情况 A：一个 chunk 包含多个完整的 SSE 行
chunk = "data: ...\ndata: ...\ndata: ...\n"

情况 B：一个 chunk 只包含一个不完整的行
chunk = "data: {\"choices\":[{\"delta\":{\"co"  ← 后半截在哪？

情况 C：一个 chunk 包含一个完整的行 + 另一个不完整的行
chunk = "data: ...\ndata: {\"choices\":[{\"d"  ← 第二行缺了一半
```

buffer 就是用来解决这个问题的。来看它怎么工作：

**第一步**：`buffer += chunk`——把新收到的文本追加到 buffer 末尾。buffer 里的内容可能包含上次没处理完的半行。

**第二步**：`const lines = buffer.split('\n')`——按换行符切割。完整的行被切出来了，最后"一行"（split 的最后一个元素）可以是不完整的。

**第三步**：`buffer = lines.pop() || ''`——这是关键中的关键。`pop()` 移除数组的最后一个元素，并把它**存回 buffer**。如果是完整行末尾的换行导致 split 产生空串则为 `''`。

举个具体例子：

```
第 1 次收到的 chunk:
"data: {\"choices\":[{\"delta\":{\"content\":\"中\"}}]}\ndata: {\"choices\":[{\"delta\":{\"con"

buffer += chunk 后 → 完整字符串
split('\n') 后 → [
  'data: {"choices":[{"delta":{"content":"中"}}]}',   // 完整行 ✓
  'data: {"choices":[{"delta":{"con"'                   // 不完整 ✗
]
lines.pop() → 'data: {"choices":[{"delta":{"con"'  ← 存回 buffer
剩余 lines = ['data: {"choices":[{"delta":{"content":"中"}}]}']  ← 可以安全处理

第 2 次收到的 chunk:
"tent\":\"国\"}}]}\n"

buffer += chunk 后 → 'data: {"choices":[{"delta":{"content":"国"}}]}\n'
split('\n') 后 → ['data: {"choices":[{"delta":{"content":"国"}}]}', '']
lines.pop() → ''  ← 空字符串，因为末尾是 \n，切割后最后一个元素为空
剩余 lines = ['data: {"choices":[{"delta":{"content":"国"}}]}']  ← 完整了！✓
```

buffer 的设计原则可以总结为：**行被换行符分界，但网络不认行——所以必须自己拼行。** 不理解这个细节，你的流式输出就会随机丢字，而且极难排查（因为它只在特定的 chunk 切分位置才出现）。

### 3.8 逐行处理：data: 前缀识别

```js
for (const line of lines) {
  if (line.startsWith('data: ')) {
    const jsonStr = line.slice(6);
```

只有以 `data: ` 开头的行才包含有效数据。SSE 协议允许空行和注释行（以 `:` 开头），我们需要过滤掉。

`line.slice(6)` 去掉前 6 个字符（`data: ` 正好 6 个字符），留下纯 JSON 字符串。

### 3.9 结束判断：`[DONE]` 标记

```js
if (jsonStr === '[DONE]') {
  done = true;
  break;
}
```

当模型完成生成，服务器发送 `data: [DONE]`。这不是 JSON，而是一个纯文本标记。如果直接 `JSON.parse('[DONE]')` 会抛异常，所以必须**先判断，再解析**。

### 3.10 提取 delta 并追加到界面

```js
try {
  const data = JSON.parse(jsonStr);
  const delta = data.choices[0]?.delta?.content || '';
  content.value += delta;
} catch (e) {
  console.error('解析错误:', e);
}
```

`JSON.parse(jsonStr)` 把 JSON 字符串转为 JavaScript 对象。然后通过可选链 `?.` 依次访问：

- `data.choices[0]`——第一个选择（流式每次只有一个 choice）
- `?.delta`——增量对象（非流式用的是 `message`，流式用的是 `delta`，注意区别）
- `?.content`——新增的 token 文本内容

任何一个链路为 `undefined` 或 `null`，最终结果就是空字符串 `''`，不会抛异常。

最后把它拼接到响应式变量 `content` 上：

```js
content.value += delta;
```

**这一行是整个循环的最终目的。** 每一次循环，拿到一个新的 token 文本，追加到 `content` 上。因为 `content` 是 Vue 的响应式变量（`ref`），只要它的值变了，Vue 的响应式系统就会自动触发界面的重新渲染——用户就能立刻看到新出现的字。

### 3.11 try-catch 的意义

SSE 流传输过程中，极少数情况下可能出现格式损坏的数据行。如果不加 try-catch，一次 JSON 解析失败就会导致整个循环崩溃，用户看到一半的流式输出戛然而止——比不看还难受。try-catch 让程序在单个坏行面前保持健壮，跳过坏行，继续处理后续数据。

### 3.12 完整代码回顾

把上面的每一处细节拼在一起，就是 demo 中 `App.vue` 的完整流式处理逻辑：

```js
if (stream.value) {
  content.value = '';
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let done = false;
  let buffer = '';

  while (!done) {
    const { value, done: isDone } = await reader.read();
    done = isDone;
    if (value) {
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6);
          if (jsonStr === '[DONE]') {
            done = true;
            break;
          }
          try {
            const data = JSON.parse(jsonStr);
            const delta = data.choices[0]?.delta?.content || '';
            content.value += delta;
          } catch (e) {
            console.error('解析错误:', e);
          }
        }
      }
    }
  }
} else {
  const data = await response.json();
  content.value = data.choices[0].message.content;
}
```

这就是从 HTTP 协议层到浏览器 API 层再到 UI 层的完整数据管道。四件套（reader、decoder、done、buffer）各司其职，配合 while 循环和 buffer 切行逻辑，实现了一个健壮的 SSE 流式客户端。

---

## 四、Vue 的响应式系统：为什么流式输出在 Vue 里这么简单

### 4.1 传统 DOM 编程 vs 数据驱动

如果不使用现代框架，你想实现"每次拿到一个 token 就在页面上追加显示"这个效果，你需要这样写：

```js
const outputDiv = document.getElementById('output');
outputDiv.textContent += delta;  // 手动操作 DOM
```

这只是追加文本，很简单。但如果还需要：

- 显示加载状态（"思考中..."）
- 区分用户消息和 AI 消息的样式
- 支持 Markdown 渲染
- 支持代码高亮
- 滚动到底部

你需要手动管理每一个 DOM 节点的状态：新建、更新、删除、移动。代码很快会变成一团乱麻——因为你既要管数据（token 内容是什么），又要管界面（DOM 节点长什么样），两者耦合在一起。一个改了，另一个忘了改，bug 就来了。

这就是**命令式编程**在处理复杂 UI 时的根本问题：**你需要同时维护数据和界面的同步，而手工保证两者一致性是极其脆弱的。**

### 4.2 Vue 的解法：响应式数据

Vue 的答案是一个核心概念——**响应式数据（Reactive Data）**。你的 JavaScript 数据是"活的"，它变化时，所有依赖它的界面元素自动更新。

```js
import { ref } from 'vue';

const content = ref('');  // 创建一个响应式引用
```

`ref()` 做了什么？它创建了一个**被追踪的数据容器**。当你读取 `content.value` 时，Vue 在背后记录"谁在读这个数据"。当你写入 `content.value = xxx` 时，Vue 通知所有之前记录的"读者"——"数据变了，你们更新一下"。

在模板中：

```html
<div>{{ content }}</div>
```

模板中的 `{{ content }}` 在渲染时就自动向 Vue 注册为 content 的"读者"。当 content 改变时，Vue 精确地知道只需要重新渲染这个 `<div>` 的文本内容，页面的其他部分（输入框、按钮、样式）完全不受影响。

这就是**数据驱动（Data Driven）**的核心：**你只需要关心数据本身，不用管 DOM。** 数据变了，界面自动变。

### 4.3 为什么流式输出是响应式的最佳展示场景

流式输出的循环体中，你最核心的逻辑只有一行：

```js
content.value += delta;
```

就这么一行。没有手动操作 DOM，没有创建元素，没有计算偏移量。你拿到了一个新的 token 文本，追加到已有的 `content` 上。仅此而已。

每个 token 到达 → `content.value += delta` → Vue 检测到变化 → 页面自动更新 → 用户看到新字出现。

这个循环运行几百次，每次都是相同的一行代码。复杂度被 Vue 完全吸收了。

### 4.4 单向绑定 vs 双向绑定：`{{ }}` 与 `v-model`

Vue 有两种数据绑定方式，理解它们的区别很重要。

**单向绑定 `{{ }}`**：数据 → 界面。数据变了，界面跟着变。但界面的变化（比如用户在输入框中打字）不会反向传给数据。

```html
<div>{{ content }}</div>  <!-- content 变了 → div 自动更新 -->
```

**双向绑定 `v-model`**：数据 ↔ 界面。在单向绑定的基础上，用户的修改也能传回数据。

```html
<input v-model="question">  <!-- question 变了 → input 显示更新 -->
                            <!-- 用户输入 → question 自动更新 -->
```

为什么需要两种方式？因为大多数 UI 元素只需要单向绑定——展示数据。但表单元素（输入框、选择框、文本框）是例外：**用户要和它们交互、修改它们的值。** 这些用户输入的值必须反向同步回 JavaScript 变量，否则你的代码拿到的永远是旧数据。

在我们的 demo 中，两种绑定各司其职：

```html
<input v-model="question">         <!-- 用户输入 → question 更新（双向） -->
<div>{{ content }}</div>            <!-- content 变了 → 界面更新（单向） -->
<input type="checkbox" v-model="stream">  <!-- 用户勾选 → stream 更新（双向） -->
```

`question` 和 `stream` 都是用户的控制信号，需要 v-model。`content` 是 AI 的输出，只需要单向展示。

### 4.5 `<script setup>` 语法糖

Vue 3 引入了 `<script setup>`，这是 Composition API 的语法糖——写在 `<script setup>` 里的变量和函数**自动暴露给模板**，不需要手动在 `setup()` 函数中 return。

```vue
<script setup>
const question = ref('讲一个关于中国龙的故事');
const stream = ref(false);
const content = ref('');

const update = async () => {
  // 可以直接用 question.value, stream.value, content.value
};
</script>

<template>
  <!-- question, stream, content 可以直接用，不需要 return -->
  <input v-model="question">
  <div>{{ content }}</div>
</template>
```

对开发者来说，`<script setup>` 消除了样板代码，让 Vue 组件写起来更像是"增强版 HTML"，而不是"JS 框架配置"。

---

## 五、组件化：为什么一个 `.vue` 文件就是最小的工程单元

### 5.1 传统 Web 开发的三座孤岛

在没有组件化之前，前端开发的三个维度是分离的：

```
index.html      ← 结构（一堆标签）
style.css       ← 样式（一堆 CSS 规则）
script.js       ← 行为（一堆 DOM 操作）
```

它们在物理上是三个不同的文件，靠类名和 ID 松散耦合。当一个页面有几十个功能模块时，你无法把"聊天输入框"这个完整概念定位到**一个地方**——它的 HTML 在 `index.html` 第 500 行，CSS 散落在 `style.css` 好几个地方，JS 逻辑混在一个几千行的 `app.js` 里。改一个功能，需要在三个文件中反复横跳。

### 5.2 组件的核心思想：把乐高做成积木

**组件（Component）是把一个功能单元的 HTML、CSS、JS 封装在一起的独立模块。**

类比乐高：一块积木内部是什么结构你不需要知道，你只需要知道它的接口（上面的凸点和下面的凹槽）。把多块积木拼在一起，就搭成了城堡。

一个 `.vue` 文件就是一块积木。它内部包含三部分：

| 部分 | 英文 | 职责 |
|------|------|------|
| `<template>` | Template | 动态 HTML 结构，可以绑定数据，数据变了页面自动更新 |
| `<script setup>` | Script | JavaScript 逻辑，定义响应式状态、处理事件、调用 API |
| `<style>` | Style | 组件级的 CSS，默认只作用于当前组件，不会污染其他组件 |

三部分合在一起，形成了一个**功能的完整封装**。你可以把它从一个项目复制到另一个项目，只要接口匹配，直接就能用。

Facebook 的网页由**超过一万个组件**组成——不是因为工程师喜欢拆文件，而是因为一万人同时改一个文件是不可能的。组件化让**并行开发**和**局部维护**成为可能。

### 5.3 我们 demo 的组件结构

```
src/
├── main.js              ← 入口：创建 Vue 应用，挂载到 #app
├── App.vue              ← 根组件：聊天界面的全部逻辑
└── components/
    └── HelloWorld.vue   ← 子组件（Vite 脚手架默认生成的示例）
```

`main.js` 是所有 Vue 应用的入口：

```js
import { createApp } from 'vue';
import App from './App.vue';

createApp(App).mount('#app');
```

三行代码，做了三件事：引入 Vue → 引入根组件 → 把根组件挂载到 `index.html` 中的 `<div id="app">` 上。之后的整个世界，就是组件套组件。

---

## 六、工程化：Vite 与 API Key 管理

### 6.1 Vite 是什么，为什么要用它

Vite（法语"快"的意思）是新一代前端构建工具。和 Webpack 相比，Vite 的核心优势在于开发体验：

- **极速冷启动**：Vite 使用原生 ES Module，不需要打包就能直接启动。因为背后用了 esbuild（Go 写的）预构建依赖，快 10-100 倍。
- **HMR（热模块替换）**：修改代码后，浏览器瞬间更新，不需要整页刷新，应用状态不丢失。
- **开箱即用**：Vite 内置了对 Vue、React、TypeScript、CSS 预处理器的支持。

在我们的 demo 中，Vite 的配置文件极其简洁：

```js
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
});
```

三行配置，接入 Vue SFC（单文件组件）编译。`@vitejs/plugin-vue` 负责把 `.vue` 文件拆解为浏览器能理解的 HTML、CSS、JS 并注入到页面中。

### 6.2 环境变量：API Key 的正确存放方式

API Key 是你的"数字身份"。如果泄露，别人可以用你的额度调用 API，而你买单。所以：

**❌ 绝对不要在代码里硬编码 API Key：**

```js
const apiKey = 'sk-xxxxxx';  // 噩梦：提交到 Git 后全网可见
```

**✅ 使用环境变量文件 `.env.local`：**

```
VITE_DEEPSEEK_API_KEY=sk-xxxxxx
```

Vite 会自动读取 `.env.local`，将 `VITE_` 前缀的变量注入到客户端代码中，通过 `import.meta.env` 访问：

```js
const headers = {
  'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
};
```

**两条安全准则：**

1. **只有 `VITE_` 前缀的变量暴露给前端**：其他前缀的变量即使写在 `.env.local` 里，客户端代码也访问不到。这是 Vite 有意设计的隔离层——防止你不小心把数据库密码这类服务端私密信息暴露到浏览器。
2. **`.env.local` 必须加到 `.gitignore`**：这个文件包含真实的 API Key，永远不要提交到版本控制系统。

### 6.3 `.env` 文件的层级

Vite 支持多个不同优先级的 `.env` 文件：

```
.env                  # 所有模式都会加载（可以提交到 Git，放默认值）
.env.local            # 所有模式都会加载（不提交 Git，放真实密钥）
.env.development      # 仅 dev 模式加载
.env.production       # 仅 production 模式加载
```

优先级：`.env.local` > `.env.development` > `.env`。同名变量，高优先级覆盖低优先级。

---

## 七、金字塔总结

从塔尖到塔基，流式输出的完整认知链条是这样的：

```
用户不会等待，空白的屏幕制造焦虑（心理学事实）
    ↓
必须让用户看见生成过程，等待变观看（体验策略）
    ↓
stream: true → SSE → 服务器逐 token flush（协议约定）
    ↓
response.body.getReader() → ReadableStream 读取器（浏览器 API）
    ↓
TextDecoder + buffer + 逐行切分 → 处理黏包断包（健壮的解析逻辑）
    ↓
data: 行识别 → [DONE] 判断 → JSON.parse(delta)（SSE 协议解析）
    ↓
content.value += delta → Vue 响应式自动刷新界面（数据驱动 UI）
    ↓
.vue 组件化封装 → Vite 构建 → .env.local 安全管理（工程化闭环）
```

每一层都是下一层的必要前提，少一层，整个体验链就断裂。这不是一个简单的"加个参数就行"的功能——它是从前端工程到用户体验的完整范式。

**再次重申金字塔原则中的核心洞见：** 流式输出本质上是一个心理学解决方案，披着技术实现的外衣。它的底层是 HTTP SSE 协议，中层是 ReadableStream + buffer 的健壮解析，上层是 Vue 响应式系统带来的开发效率。三层叠加，才构成了 AI 产品不可妥协的第一道体验门槛。

---

## 展望

流式输出正在成为 AI 应用的标配，但它远不是终点。下一个正在发生的演变：

**多模态流式**：不只是文本 token。图片扩散模型的去噪步骤、语音合成的波形生成、视频生成的逐帧输出——都可以流式展示中间态。用户看到的不再是"生成中..."的转圈，而是图片从噪声到清晰的渐变过程，是声音从模糊到清晰的实时演进。Latent Preview 将成为新的 UX 范式。

**结构化流式**：不再只流纯文本。一个 JSON 对象可以被边生成边解析——花括号打开时显示骨架，字段逐个出现时实时渲染。一份代码可以被边写边做语法高亮。一个函数调用（Function Call）的参数可以被逐个展示和验证。

**双向流式**：当前流式是单向的（服务器 → 客户端）。未来用户可以在 AI 输出过程中插入新的指令——"停，换个角度"、"继续，但更详细一点"——而 AI 能够动态调整正在生成的 token 序列。这需要从 SSE 升级为全双工协议（WebSocket 或 WebRTC Data Channel）。

对于前端工程师而言，流式输出不是一道可选题。它是 AI 产品用户体验的**第一道门槛**——跨不过去，用户在第一秒就流失了；跨过去了，用户才可能留下来体验你的产品到底有多聪明。

---

*本文严格基于 `stream-demo` 项目中的文章素材（`readme.md`）与代码实现（`src/App.vue`）撰写。Demo 技术栈：Vue 3（Composition API + `<script setup>`）+ Vite + DeepSeek API（deepseek-chat 模型）。*

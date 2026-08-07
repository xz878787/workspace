# React useRef + Web Worker：当持久可变遇到多线程——前端耗时计算的最优解

## 核心结论（金字塔塔尖）

**useRef 是 React 声明式编程体系中的"逃生舱口"——它让你在不破坏组件响应式契约的前提下，安全地持有 DOM 节点、Web Worker 实例等"非响应式可变对象"。而 Web Worker 是浏览器给 JS 单线程开的一扇侧门——主线程的 event loop 机制不变，但耗时的纯计算任务可以被卸货到独立后台线程并行执行。useRef 持久化持有 Worker 引用，useEffect 控制其生命周期，三者组合构成了 React 处理 CPU 密集型任务的最优范式。**

---

## 第一层：为什么 React 不让你直接碰 DOM？

### 1.1 两个引擎、一座桥——DOM 编程的性能原罪

先理解一个底层事实：

```
┌──────────────┐         ┌──────────────────┐
│   V8 引擎     │  ◄──►  │   渲染引擎        │
│  (JavaScript) │  桥接   │  (DOM / CSSOM)   │
└──────────────┘         └──────────────────┘
```

JS 活在 V8 里，DOM 活在渲染引擎里。**每次 JS 操作 DOM，都要跨过这座桥。** 这座桥不是免费的——频繁过桥就是性能灾难。

原生 JS 时代，开发者手动 `document.getElementById()`、`appendChild()`、`innerHTML`，代码写得像操作说明书。简单页面能跑，页面一复杂，大量的 DOM 增删改查让桥上的交通彻底堵塞。

### 1.2 React 的解法：你描述 UI，我来操作 DOM

React 做了一件革命性的事：**把"怎么做"变成"是什么"。**

```jsx
// 原生 JS 思维：一步一步指挥 DOM
const div = document.getElementById('result');
div.textContent = loading ? '计算中...' : '结果：' + sum;

// React 思维：声明状态，框架负责 DOM
{loading ? <span>计算中...</span> : <h3>计算结果：{result}</h3>}
```

`useState` 是这套体系的核心齿轮——你改数据，React 自动算出最小 DOM 变更并批量执行。开发者不再和 DOM 打交道，而是在和数据流打交道。

**这就是"声明式编程"代替"命令式编程"的本质。**

---

## 第二层：但总有非直接操作 DOM 不可的时候

### 2.1 useRef——React 声明式合约中的"例外条款"

React 的哲学很明确：数据驱动视图。但现实中有两类场景绕不开"引用"：

| 场景 | 为什么不能用 useState | 为什么用 useRef |
|------|---------------------|----------------|
| 拿到一个 `<input>` DOM 节点，调用 `input.focus()` | focus 不是"状态"，是"操作" | `ref.current.focus()`，直接但可控 |
| 持有一个 Web Worker 实例 | Worker 对象是外部资源，不需要触发渲染 | `ref.current` 随渲染持久存在，变更无渲染开销 |

### 2.2 useRef 和 useState 的边界——一个关键区分

```jsx
const [state, setState] = useState(0);   // 改了 → 重新渲染
const ref = useRef(0);                   // 改了 → 不渲染
```

二者的共同点：**都能在多次渲染之间保持值不变。**

二者的分水岭：**setState 触发渲染，ref.current = xxx 不触发。**

这个区别看起来小，实际上决定了整个 React 渲染模型的行为：

- `useState` 是**响应式**的——值变了，UI 必须跟着变。它是 React 数据流的"管道"。
- `useRef` 是**非响应式**的——值变了，但这不是 UI 关心的变化。它是 React 数据流的"储藏室"。

**把不该触发渲染的东西放进 useState，组件就会做无意义的 re-render；把本该驱动 UI 的东西放进 useRef，页面就永远不会更新。** 选对容器，和选对算法一样重要。

### 2.3 一句定义

> useRef 是 React 提供的一个**持久可变**的 Hook 函数。它返回一个带有 `current` 属性的普通 JS 对象，这个对象在组件的整个生命周期中保持不变，你可以往 `current` 里存任何值或对象，修改它**不会触发组件重新渲染**。

---

## 第三层：单线程之困——当复杂计算撞上 event loop

### 3.1 为什么 JS 是单线程的？

这是一个历史选择，也是一个合理的设计。

假设 JS 是多线程的：线程 A 正在往 DOM 里添加一个节点，线程 B 同时要删除同一个节点。结果是什么？谁也说不准。**对于一门为 UI 交互而生的语言，"确定性"比"并发能力"更重要。** 单线程避免了锁、竞态条件、原子操作——这些后端程序员天天与之搏斗的概念，在前端被彻底消灭。

代价是：**一个任务卡住，整个页面都卡住。**

### 3.2 event loop 的极限

JS 的 event loop 机制很聪明——异步任务不阻塞主线程：

```
同步代码 → 微任务队列(Promise) → 宏任务队列(setTimeout/I/O) → 渲染
    ↑___________________________________________________________|
```

但这里有一个铁律：**event loop 不能让你并行计算。** 一个耗时 10 秒的 `for` 循环，不管放在同步代码里还是 `setTimeout` 里，它都要完整跑完 10 秒。区别只是——放在 `setTimeout` 里，至少前面还能先渲染一帧。

看看下面这段代码，如果它在主线程跑会怎样：

```js
// 5 亿次循环——主线程直接冻结
for (let i = 0; i < 500000000; i++) {
    sum += num * i;
}
```

用户点击按钮后，页面会**完全卡死**——滚动不了、输入不了、按钮没反应。JS 正在拼命算加法，没空去处理用户事件。这就是"阻塞主线程"。

**event loop 解决的是"等待"的问题（等网络、等定时器），解决不了"计算"的问题。**

---

## 第四层：Web Worker——浏览器的"侧门"

### 4.1 Worker 是什么？

HTML5 给出的答案是 Web Worker：**在 JS 主线程之外，由浏览器（C++ 层的多线程能力）开辟一个独立的 JS 运行环境。**

```
┌──────────────────────┐        postMessage        ┌──────────────────────┐
│     主线程            │ ◄──────────────────────► │     Worker 线程       │
│  DOM ✓   UI ✓        │    消息通道（序列化）      │   DOM ✗   UI ✗        │
│  交互事件 ✓  渲染 ✓   │                          │  纯计算 ✓             │
└──────────────────────┘                          └──────────────────────┘
```

几个关键事实：

1. **Worker 跑在独立的 JS 运行时里**——它有自己的内存空间，和主线程的变量互不共享。
2. **Worker 不能访问 DOM**——这很合理。DOM 不是线程安全的，设计上就不该让多个线程碰它。
3. **通信靠消息**：`postMessage` 发送，`onmessage` 接收。数据会被**序列化拷贝**（structured clone），不是共享引用。
4. **JS 单线程的本质没有变**——主线程仍然只有一个，UI 渲染和事件处理仍然只在主线程。Worker 只是一个"外包工人"，它帮你算结果，但从不碰页面。

### 4.2 适合交给 Worker 的任务

| 场景 | 为什么适合 Worker |
|------|------------------|
| 加密/解密大量数据 | 纯计算，不碰 DOM，算完返回结果 |
| 大数运算 / 斐波那契 / 素性测试 | CPU 密集，时间不可预测 |
| 游戏引擎的物理碰撞检测 | 每帧都要算，性能敏感 |
| LLM 推理（浏览器端） | 模型权重加载 + 矩阵运算，耗时巨大 |
| 图片 / 视频处理 | 像素级操作，数据量大 |

---

## 第五层：useRef + useEffect + Worker 的三角协作（代码实战）

### 5.1 架构全景

现在把三样东西拼在一起，看看我们项目 `App.jsx` 里的完整设计：

```
useRef ─── 持久化持有 Worker 实例（不受 re-render 影响）
    │
useEffect ─── 组件挂载后创建 Worker、绑定 onmessage、卸载时 terminate
    │
Worker ─── 接收 postMessage → 执行 5 亿次循环 → postMessage 返回结果
```

### 5.2 App.jsx 逐段拆解

**第一步：用 useRef 声明一个持久容器**

```jsx
const workerRef = useRef(null);  // 贯穿组件整个生命周期，永不重置
const [result, setResult] = useState(null);  // 计算结果 → 要展示 → 用 state
const [loading, setLoading] = useState(false);  // loading 状态 → 要展示 → 用 state
```

这里有一个精妙的**选型逻辑**：

- `workerRef` → useRef：Worker 实例**不需要驱动 UI**，但需要在组件卸载时销毁。用 useRef 刚好——持久持有，修改不渲染。
- `result`、`loading` → useState：这两个值**必须驱动 UI 更新**（显示结果、按钮 disabled 状态），必须用 useState。

**第二步：useEffect 控制 Worker 完整生命周期**

```jsx
useEffect(() => {
    // ① 创建：组件挂载后，new Worker 在独立线程启动
    workerRef.current = new Worker(
        new URL("./worker.js", import.meta.url)
    );

    // ② 监听：收到 Worker 的消息 → 更新 UI 状态
    workerRef.current.onmessage = (e) => {
        const { result } = e.data;
        setResult(result);   // 触发渲染，展示结果
        setLoading(false);   // 触发渲染，按钮恢复可点击
    };

    // ③ 销毁：组件卸载时 → terminate() 释放线程 → 置 null 防止内存泄漏
    return () => {
        workerRef.current.terminate();
        workerRef.current = null;
    };
}, []);  // 空依赖 = 只在挂载/卸载时执行，Worker 实例全程稳定
```

**为什么不在组件顶层直接 `new Worker()`？**

```jsx
// ❌ 错误做法：组件顶层直接 new
const App = () => {
    const worker = new Worker(...);  // 每次渲染都 new 一个新 Worker！
    // ...
};
```

React 的函数组件每次渲染都会重新执行函数体。如果在顶层直接 `new Worker()`，每次 re-render 就创建一个新线程，旧线程没销毁——内存泄漏 + 僵尸线程满天飞。

**useEffect 空依赖数组确保只创建一次，return 的清理函数确保销毁一次。**

**第三步：发送消息给 Worker**

```jsx
const startHeavyCalc = () => {
    setLoading(true);  // 立即反馈：按钮变 disabled，显示"正在后台计算..."
    workerRef.current.postMessage({ num: 88 });  // 发给 Worker
};
```

**第四步：Worker 端接收并计算**

```js
// worker.js —— 独立的 JS 文件，运行在 Worker 线程
self.onmessage = (e) => {
    const { num } = e.data;
    let sum = 0;
    for (let i = 0; i < 500000000; i++) {  // 5 亿次！
        sum += num * i;
    }
    self.postMessage({ result: sum });  // 算完了，通知主线程
};
```

### 5.3 时序图：一次完整交互的数据流

```
用户点击按钮
    │
    ▼
setLoading(true) ──────────────────────► UI 更新：按钮变灰 + 文案"正在后台计算..."
    │
    ▼
workerRef.current.postMessage({num:88})
    │
    ▼
┌─── Worker 线程 ──────────────────────────────────────────────────┐
│  收到 {num:88}                                                   │
│  for (i=0; i<5亿; i++) sum += 88*i;   ← 疯狂计算中...            │
│  主线程此时完全不阻塞，用户可以正常滚动、点击、打字              │
│  计算完成                                                        │
│  self.postMessage({result: 9.68e17})                             │
└──────────────────────────────────────────────────────────────────┘
    │
    ▼
主线程 onmessage 回调触发
    │
    ▼
setResult(9.68e17)
setLoading(false)
    │
    ▼
UI 更新：显示计算结果 + 按钮恢复可点击
```

---

## 第六层：更深一层的思考

### 6.1 不是在"打破"单线程，而是在"绕开"它

很多人会问：用了 Worker，JS 是不是就成多线程语言了？

**不是。** 这是一个精准的概念区分：

- **JS 作为语言规范**（ECMAScript）从未定义过多线程模型。V8 的 JS 运行时依然是单线程的。
- **浏览器作为宿主环境**（C++ 写的多进程多线程软件）可以额外开辟 Worker 线程，每个 Worker 有自己独立的 JS 运行时。
- **页面渲染、组件更新、用户交互事件**依然只在主线程的 JS 运行时里处理。

所以准确的说法是：**浏览器是多线程的 C++ 程序，它给 JS 提供了多个互相隔离的单线程运行时。JS 主线程没有改变单线程本质，Worker 是浏览器的能力，不是 JS 的能力。**

### 6.2 useRef 的真正本质：逃逸出 React 的声明式范式

React 声明式模型的核心约束是：**状态变化必须经过 setState → re-render → 新 UI 这条路径。** 这是 React 保证 UI 一致性的前提。

但有些东西天然不属于这个模型：

- **DOM 节点引用**（`input.focus()` 不需要新的渲染）
- **外部非 React 对象**（WebSocket 连接、Worker 线程、Chart.js 实例）
- **跨渲染的"暂存值"**（上次的滚动位置、动画帧 ID）

useRef 就是给这些"不属于 React 模型的东西"留的一个口袋。它说：**"你把这些放我这儿，React 保证每次都给你同一个口袋（同一个 {current} 对象），至于口袋里装了什么，React 不管。"**

这是一种深思熟虑的设计，不是漏洞。因为如果 React 试图管理一切——包括 Worker 的生命周期、DOM 节点的 focus 状态——它就会变得臃肿、缓慢、且反直觉。

### 6.3 设计模式总结：资源持有 + 生命周期绑定的通用范式

`useRef + useEffect` 的组合形成了一个可以复用的模式：

```
useRef   →  持有"逃逸出 React 声明式模型"的外部资源
useEffect → 资源创建 + 销毁（componentDidMount + componentWillUnmount）
useState → 把外部资源产生的事件"翻译"回 React 的响应式世界
```

这套模式不仅适用于 Worker，也适用于：

- `new WebSocket(url)` → ref 持有连接 → onmessage 回调里 setState
- `new IntersectionObserver(cb)` → ref 持有观察者 → 回调里 setState
- `new Chart(canvas, config)` → ref 持有图表实例 → 交互回调里 setState

---

## 总结（塔基——完整知识体系回顾）

```
                    ┌──────────────────────────────┐
                    │  useRef + Web Worker         │
                    │  = 持久持有 + 并行计算        │
                    │  不阻塞 UI + 结果回写 state   │
                    └──────────┬───────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
     ┌────────▼────────┐ ┌────▼─────┐ ┌────────▼────────┐
     │   useRef         │ │ useEffect│ │  Web Worker     │
     │   持久可变        │ │ 生命周期  │ │  独立线程        │
     │   不触发渲染      │ │ 挂载/卸载│ │  消息通信        │
     │   持有"外部资源"  │ │ 正确时机 │ │  纯计算无 DOM    │
     └────────┬────────┘ └────┬─────┘ └────────┬────────┘
              │               │                │
     ┌────────▼────────┐ ┌────▼─────┐ ┌────────▼────────┐
     │  React 声明式    │ │ React    │ │  JS 单线程       │
     │  数据驱动视图    │ │ 函数组件 │ │  event loop      │
     │  useState 核心   │ │ 渲染周期 │ │  浏览器多线程     │
     │  DOM 操作委托    │ │ 副作用   │ │  主线程隔离      │
     └─────────────────┘ └──────────┘ └─────────────────┘
```

**一句话收束全文**：React 用声明式模型帮我们告别了手动 DOM 操作；useRef 是这个模型的"例外条款"，用来安全持有逃逸出响应式体系的外部对象；Web Worker 是浏览器给 JS 主线程开的后门，让耗时计算不会冻住页面；而 `useRef + useEffect + Worker` 的三件套，就是 React 应对 CPU 密集场景的标准姿势——你只需要描述"数据从哪来、算完放哪去"，React 和浏览器帮你处理剩下的一切。

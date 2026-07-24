# React 状态管理核心原理：从批量 DOM 到派生状态

## 核心结论（金字塔塔尖）

React 的状态管理遵循三条铁律，理解它们就能避开 90% 的初学者陷阱：

1. **状态的初始化只应在「挂载时」执行一次**，昂贵计算必须用惰性初始化
2. **状态的更新是异步且批量的**，依赖旧值时必须使用 updater 函数
3. **能算出来的东西永远不要存成状态**——派生状态是消除 bug 的最有效手段

下面自顶向下，逐层拆解。

---

## 第一层：惰性初始化——别在每次渲染时重复计算

### 问题：你的初始化逻辑跑了几次？

看下面这段代码：

```jsx
const [users] = useState(heavyComputation());  // ❌ 每次渲染都执行
```

直觉上，`useState` 的初始值只在「第一次渲染」时被使用。**但 JavaScript 在调用函数前，会先对所有实参求值。** 这意味着 `heavyComputation()` 会在**每次渲染**时被调用——React 只是忽略了除第一次之外的结果。

对于生成 10000 条用户数据的 `heavyComputation()`，这意味着每敲一个字符触发重渲染，就白白跑了 10000 次循环。

### 解法：传函数，别传值

```jsx
const [users] = useState(() => heavyComputation());  // ✅ 只在挂载时执行
```

当你传入一个**函数**（而非函数的调用结果）时，React 将其视为「惰性初始化器」——**只在组件挂载时调用一次**。后续重渲染中，这个函数被完全跳过。

### 什么时候需要惰性初始化？

| 场景 | 直接传值 | 惰性函数 |
|------|---------|---------|
| 简单字面量 `useState(0)` | ✅ 无开销 | 不必要 |
| 读取 localStorage | ❌ 每次都读磁盘 | ✅ 只读一次 |
| 大数据预处理 | ❌ 每次渲染浪费 | ✅ 只算一次 |
| 复杂对象构造 | ❌ 每次 new | ✅ 只构造一次 |

**一句话规则**：如果初始值的计算涉及函数调用且不是 O(1)，惰性化它。

---

## 第二层：异步更新与批量合并——setState 不是 setter

### 直觉陷阱

这是 React 新手最容易踩的坑。看这段代码，你预期 `count` 变成多少？

```jsx
const [count, setCount] = useState(0);

const addCount = () => {
  setCount(count + 3);   // count = 0，期望变成 3
  setCount(count + 3);   // count = 0，期望变成 6
  setCount(count + 3);   // count = 0，期望变成 9
};
```

**实际结果：点击后 count 变成 3，不是 9。**

### 为什么？

React 的状态更新是**异步且批量**的：

1. `count` 在当前闭包中的值是**本次渲染的快照**，不会在函数执行中途改变
2. 三次 `setCount(count + 3)` 都在**同一个快照**上计算：`0 + 3 = 3`
3. React 把三次更新合并为一次：最终 state = 3

这背后的设计原因和 `test.html` 中的 DocumentFragment 如出一辙：

```javascript
// test.html —— 原生 DOM 的批量更新思想
const fragment = document.createDocumentFragment();
for (const task of data) {
  const item = document.createElement('li');
  item.innerText = task;
  fragment.appendChild(item);   // 先挂到「在内存中、不可见」的片段上
}
oList.appendChild(fragment);    // 一次性插入真实 DOM，只触发一次回流
```

**React 的批量更新就是这个思想的框架级实现**——多次 setState 被收集起来，在适当的时机一次性地重新渲染。如果你每调一次 setState 就立即重渲染，性能将不可接受。

### 正确做法：updater 函数

当新状态**依赖旧状态**时，传函数而不是值：

```jsx
setCount(prevCount => prevCount + 3);  // prev = 0 → 返回 3
setCount(prevCount => prevCount + 3);  // prev = 3 → 返回 6
setCount(prevCount => prevCount + 3);  // prev = 6 → 返回 9
```

每次 updater 函数拿到的 `prevCount` 是**前一次更新后的最新值**，而不是闭包中的快照。React 保证 updater 函数按调用顺序依次执行，前一个的结果作为后一个的输入。

### 决策规则

```
新状态是否依赖旧状态？
  ├── 否 → setState(newValue)
  └── 是 → setState(prev => newValue)
```

**建议：当你不确定时，一律用 updater 函数。它的行为是确定的，不会引入闭包陷阱。**

---

## 第三层：派生状态——能算出来的别存

### 一个反直觉的事实

你在应用中维护的状态越多，引入 bug 的概率越高。原因很简单：

> 每个新增的状态都引入了一个「保持同步」的责任——当 A 变了，B 必须跟着变。忘掉一次，就是 bug。

所以最高级的 state 管理是**不管理 state**。

### 看 App.jsx 的实践

```jsx
const [users] = useState(() => heavyComputation());   // 唯一的数据源
const [filterText, setFilterText] = useState('');      // 唯一的控制信号

// 不建第三个 state，直接算
const filteredUsers = users.filter(user => user.name.includes(filterText));
```

这里的关键设计决策：**`filteredUsers` 不是状态，而是派生值**。

为什么这样做？
- 如果 `filteredUsers` 是一个独立状态，每次 `users` 或 `filterText` 变了，你都必须记得去 `setFilteredUsers(...)`。忘一次，数据和 UI 就不一致。
- 作为派生值，它是**声明式的**——「filteredUsers 永远等于 users 按 filterText 过滤后的结果」。不存在「忘记更新」的可能。

### 识别「伪状态」的三问法

在你写 `useState` 之前，问自己：

1. **这个值能不能从已有的 state/props 算出来？** → 如果能，直接算，别建状态
2. **这个值变了之后，是不是另一个状态必须跟着变？** → 如果是，大概率后一个是派生值
3. **这个值有没有独立的生命周期？** → 如果没有（它只是别的东西的投影），它就是派生值

### 典型案例

```jsx
// ❌ 伪状态：三处状态互相依赖，容易出现不一致
const [items, setItems] = useState([]);
const [totalPrice, setTotalPrice] = useState(0);    // 可从 items 算
const [itemCount, setItemCount] = useState(0);       // 可从 items 算

// ✅ 单一数据源 + 派生
const [items, setItems] = useState([]);
const totalPrice = items.reduce((sum, i) => sum + i.price, 0);  // 派生
const itemCount = items.length;                                   // 派生
```

---

## 金字塔全景图

把三层串起来，React 状态管理的完整心智模型是：

```
┌─────────────────────────────────────────────┐
│  第一层：初始化                              │
│  useState(() => expensiveWork())  —— 只算一次  │
├─────────────────────────────────────────────┤
│  第二层：更新                                │
│  setState(prev => ...)  —— 异步、批量、可靠   │
├─────────────────────────────────────────────┤
│  第三层：消费                                │
│  const derived = compute(state) —— 不存冗余   │
└─────────────────────────────────────────────┘
```

这三条原则的底层驱动力来自同一个东西：**性能**。

- 惰性初始化 → 避免无效计算
- 异步批量更新 → 避免无效渲染（就像 DocumentFragment 避免无效回流）
- 派生状态 → 避免无效同步

React 的本质是什么？**用声明式的写法，让框架帮你在「数据变」与「DOM 变」之间找到最短路径。** 这三条原则，就是在帮 React 帮你。

---

## 附：代码文件完整对照

本文分析基于以下三个演示文件：

| 文件 | 核心知识点 |
|------|-----------|
| `test.html` | DocumentFragment 批量 DOM 操作——理解 React 批量更新的前置知识 |
| `App.jsx` | 惰性初始化 `useState(fn)` + 派生状态 `filteredUsers` + `performance.now()` 性能测量 |
| `App2.jsx` | `setState(prev => ...)` updater 函数 vs 直接传值的闭包陷阱 |

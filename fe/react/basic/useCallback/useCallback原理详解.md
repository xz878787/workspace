# useCallback 深度解析：React 性能优化的核心利器

---

## 一句话结论

**useCallback 通过缓存函数引用，配合 `React.memo` 阻断子组件的无效重渲染，从而解决"父组件更新导致所有子组件级联渲染"的性能问题。**

---

## 一、问题根源：为什么需要 useCallback？

### 1.1 直观现象

看 `App.jsx` 中的代码：

```jsx
function App() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('少林队');

  return (
    <>
      <button onClick={() => setCount(count + 1)}>点击计数{count}</button>
      <button onClick={() => setName('峨眉队')}>点击姓名</button>
      <RegularChild name={name} />
      <MemoChild name={name} />
    </>
  );
}
```

**现象：** 点击"点击计数"按钮时，`count` 变了，但 `name` 没变——然而 `RegularChild` 依然重新渲染了。

### 1.2 根因分析

React 的渲染机制决定了：**父组件重新渲染时，其所有子组件默认都会重新渲染**。这不是 bug，而是 React 的保守策略——它不知道子组件是否依赖了父组件中某个变化的状态。

这里的逻辑链是：

```
count 变化
  → App 函数重新执行
    → 所有 JSX 重新生成
      → RegularChild 重新渲染（即使 name 没变）
```

### 1.3 `memo` 出场——但并不够

`React.memo` 通过浅比较 props 来跳过无变化子组件的渲染：

```jsx
const MemoChild = memo(({ name }) => {
  console.log('MemoChild 组件渲染');
  return <h1>{name}</h1>;
});
```

对于**原始值** props（如字符串 `name`），`memo` 完美工作——`name` 没变就不渲染。

**但**当 props 包含**函数**时，问题复现：

```jsx
// 如果传一个内联函数给 MemoChild
<MemoChild name={name} onChange={() => setName('新队名')} />
```

每次 `App` 渲染，`() => setName('新队名')` 会**创建一个全新的函数引用**。`memo` 做浅比较时发现 `onChange` 变了 → 子组件仍然重渲染。

**这就是 useCallback 的用武之地。**

---

## 二、useCallback 是什么？——本质定义

### 2.1 一句话

**useCallback 是一个缓存函数引用的 Hook，只在依赖项变化时才重新创建函数。**

### 2.2 基本语法

```jsx
const memoizedFn = useCallback(fn, [deps]);
```

| 要素     | 含义                                               |
| -------- | -------------------------------------------------- |
| `fn`     | 要缓存的函数                                       |
| `deps`   | 依赖数组，只有当依赖变化时才重新创建 `fn`            |
| 返回值   | 缓存后的函数引用（依赖不变时，引用不变）              |

### 2.3 核心机制图解

```
首次渲染:  创建 fn_v1 → useCallback 缓存 → 返回 fn_v1 引用
          ↓
更新渲染 (deps 未变):  跳过创建 → 直接返回 fn_v1 引用（同一个引用！）
          ↓
更新渲染 (deps 变了):  创建 fn_v2 → 更新缓存 → 返回 fn_v2 引用
```

对比普通写法：

```
普通写法:  每次渲染都创建新函数 → 引用每次不同 → memo 失效
useCallback: 依赖不变时返回同一个引用 → memo 生效 → 子组件跳过渲染
```

---

## 三、完整工作流：memo + useCallback 协作

### 3.1 问题 → 方案映射

```
问题链路:
  父组件渲染 → 函数引用变化 → memo 浅比较失败 → 子组件无效渲染

解决办法:
  父组件渲染 → useCallback 保住函数引用 → memo 浅比较通过 → 子组件跳过渲染
```

### 3.2 改造示例

基于 `App.jsx` 的演进版本：

```jsx
import { useState, memo, useCallback } from 'react';

function App() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('少林队');

  // ✅ 用 useCallback 缓存回调，依赖 [name] 不变时引用保持不变
  const handleChangeName = useCallback(() => {
    setName('峨眉队');
  }, []); // 空依赖：这个函数永远不变

  // ❌ 没有 useCallback：每次渲染都是新函数
  // const handleChangeName = () => setName('峨眉队');

  console.log('APP 组件渲染');
  return (
    <>
      <button onClick={() => setCount(count + 1)}>点击计数{count}</button>
      <button onClick={handleChangeName}>点击姓名</button>
      <RegularChild name={name} />
      <MemoChild name={name} onAction={handleChangeName} />
    </>
  );
}

const MemoChild = memo(({ name, onAction }) => {
  console.log('MemoChild 组件渲染');
  return <h1>{name}</h1>;
});
```

**效果：** 点击"点击计数"时，`handleChangeName` 引用不变 → `MemoChild` 的 props 整体不变 → `memo` 跳过渲染。

---

## 四、金字塔总结：从现象到本质

```
                    ┌──────────────────────────────────┐
                    │  useCallback 解决函数引用漂移问题  │
                    │  让 memo 真正发挥作用               │
                    └──────────────────────────────────┘
                                    ▲
              ┌─────────────────────┴─────────────────────┐
              │                                           │
    ┌─────────────────┐                         ┌─────────────────┐
    │  memo 不够用      │                         │  useCallback     │
    │  函数 props 导致  │                         │  缓存函数引用    │
    │  浅比较总是失败   │                         │  deps 不变则     │
    │                   │                         │  引用不变        │
    └─────────────────┘                         └─────────────────┘
              ▲                                           ▲
              │                                           │
    ┌─────────────────┐                         ┌─────────────────┐
    │  React 渲染机制  │                         │  闭包与依赖追踪  │
    │  父组件渲染 →    │                         │  使用 deps 数组  │
    │  子组件默认渲染  │                         │  决定何时刷新缓存 │
    └─────────────────┘                         └─────────────────┘
```

### 关键认知跃迁

1. **承认现实：** React 默认"宁可多渲染，不可漏渲染"
2. **第一道防线：** `memo` 用浅比较拦截 props 不变的情况
3. **防御缺口：** 函数的引用天然不稳定，memo 防不住
4. **终极补丁：** `useCallback` 让函数引用稳定下来，缝合防线

### 使用准则

- **什么时候用：** 函数作为 prop 传给 `memo` 包裹的子组件时
- **什么时候不用：** 函数只传给原生 DOM 元素（`<button onClick={fn}>`），因为 DOM 元素没有 memo 比较机制
- **灵魂之问：** 不用 useCallback 会导致用户可见的卡顿吗？如果不会，别过早优化

---

## 五、延伸：useMemo 与 useCallback 的关系

| Hook         | 缓存什么   | 本质等价                        |
| ------------ | ---------- | ------------------------------- |
| useCallback  | 函数引用   | `useMemo(() => fn, deps)`       |
| useMemo      | 计算结果   | `useCallback(() => value, deps)`() |

它们是一体两面：**useCallback 是 useMemo 的语法糖**，都是用来稳定引用、配合 memo 实现精准渲染控制。

---

> **核心思想：React 性能优化的本质不是"让渲染变快"，而是"让不该发生的渲染不要发生"。memo 负责判断"该不该渲染"，useCallback 负责让 memo 的判断条件不被破坏。二者是一对共生体。**

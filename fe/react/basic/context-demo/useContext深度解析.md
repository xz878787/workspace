# React Context 与自定义 Hooks：从「传话筒地狱」到「虫洞通信」

> 基于 `context-demo` 项目源码的架构级拆解，涵盖 `createContext` → `Provider` → `useContext` 三部曲，以及 `useTheme` / `useMouse` 两个自定义 Hook 的封装思想。

---

## 一、先上结论（金字塔塔尖）

**React Context 的本质，是在组件树中建立了一条「虫洞」——数据提供者在顶层注入，消费者在任意深度直接读取，中间组件完全无感。**

如果你只想记住一件事，记住这个三段式公式：

```
① createContext("默认值")        → 开挖虫洞入口
② <Context.Provider value={…}>  → 在入口注入数据
③ useContext(Context)           → 在任意深度取出数据
```

自定义 Hooks（如 `useTheme`）则是把第 ③ 步**封装成一个语义化的函数接口**，让消费者只需一行 `const theme = useTheme()` 即可拿到数据，不必关心底层是 Context、Redux 还是别的什么机制。

本文用 `context-demo` 项目中的两个完整案例，从**架构视角**、用**金字塔结构**逐层拆解这套模式。

---

## 二、为什么需要 Context？—— 从组件通信的四种关系说起

### 2.1 React 组件树的四种关系

一个 React 页面本质上是一棵**组件树**。树上任意两个节点之间的关系，只有四种：

| 关系 | 示例 | 传统通信方式 |
|------|------|-------------|
| **父子** | `<Parent>` 直接包裹 `<Child>` | props 下传数据，回调函数上传事件 |
| **兄弟** | 同一个 Parent 下的两个 Child | 状态提升到公共 Parent，再由 Parent 通过 props 分发给二者 |
| **爷孙** | 跨越多层（如 App → Page → Header → Avatar） | **逐层转发 props（prop drilling）** |
| **陌生人** | 树的两根不同分支，毫无层级关联 | 全局状态管理库（Redux、Zustand 等）或 Context |

前两种关系用 props 足够。**真正麻烦的是后两种——尤其是爷孙关系。**

### 2.2 痛点：Prop Drilling——「传话筒地狱」

假设我们的组件树长这样：

```
App          ← 拥有 theme 状态
 └─ Page     ← 不关心 theme，但必须接收并转发
     └─ Child  ← 不关心 theme，但必须接收并转发
         └─ Avatar  ← 真正需要 theme 的组件
```

传统做法是**逐层传递 props**：

- `App` 把 `theme` 传给 `Page`
- `Page` 再传给 `Child`
- `Child` 再传给 `Avatar`

**比喻——办公楼送快递：**

一栋 20 层的办公楼，1 楼前台要给 20 楼的员工送一个包裹。如果规则是「每层必须经手一次」：

- **每一层的员工都要开门、接手、再往上送** → 代码冗余（每层都要写 `props.theme` 并转发）
- **任何一层忘了传递，包裹就丢了** → 维护成本高（中间加一个组件，要同步修改多个文件）
- **中间层员工很烦**：「我又不用这玩意儿，凭什么让我传？」 → 职责不清晰（`Page` 和 `Child` 不需要 theme，却被迫知道了它的存在）

当一个项目有几十个组件、五六层嵌套时，prop drilling 会成为**维护噩梦**——加一个参数，链路从头改到尾。

### 2.3 Context 的解法：拉一条直达管道

**与其每层经手，不如在 1 楼和 20 楼之间拉一根直达管道。** 前台把包裹丢进管道，20 楼直接从出口取。

这就是 Context 的核心思想——**跨越中间层级，提供者与消费者直连。**

---

## 三、Context 三部曲——虫洞是怎么建成的

`context-demo` 项目展示了 Context 最精简的用法。我们从源码出发，逐一拆解三个 API。

整个 demo 的文件结构：

```
context-demo/src/
├── main.jsx              ← 入口
├── App.jsx               ← useMouse demo（独立演示自定义 Hook）
├── App2.jsx              ← Context demo（Provider + 消费者）
├── ThemeContext.jsx       ← ① createContext：创建虫洞入口
├── hooks/
│   ├── useTheme.js       ← ③ useContext 封装后的自定义 Hook
│   └── useMouse.js       ← 自定义 Hook 的独立案例（非 Context 相关）
└── components/
    ├── Page.jsx          ← Context 直接消费者（用原生 useContext）
    └── Child.jsx         ← Context 间接消费者（用封装好的 useTheme）
```

### 3.1 第一步：`createContext`——开挖虫洞入口

```javascript
// src/ThemeContext.jsx
import { createContext } from 'react';

export const ThemeContext = createContext("light");
```

**这一行代码做了什么？**

`createContext("light")` 在 React 的运行时中**创建了一块共享数据通道**。参数 `"light"` 是默认值——当组件树的**上方没有 Provider 提供数据时**，`useContext` 将返回这个默认值。

**比喻**：你在办公楼里申请了一条**专用的垂直管道井**，并设定如果上面没人供水，系统默认流出「light」这个温度的水。管道已立好，但还没接入水泵（Provider），所以目前只有默认值可用。

**一个关键认知**：`ThemeContext` 是一个对象，它本身不存数据。它就像一个**频道编号**——Provider 往这个频道发数据，useContext 从这个频道收数据。频道号和频道内容是两个独立的概念。

### 3.2 第二步：`Provider`——在管道顶端装上水泵

```javascript
// src/App2.jsx
import { useState } from 'react';
import { ThemeContext } from './ThemeContext.jsx';
import Page from './components/Page.jsx';

function App() {
  const [theme, setTheme] = useState('light');

  return (
    <>
      <ThemeContext.Provider value={theme}>
        <Page />
        <button onClick={() => setTheme('dark')}>按键dark</button>
        <button onClick={() => setTheme('light')}>按键light</button>
      </ThemeContext.Provider>
    </>
  );
}

export default App;
```

**逐行拆解：**

| 代码 | 解析 |
|------|------|
| `const [theme, setTheme] = useState('light')` | 用 `useState` 管理 theme 状态，初始为 `'light'` |
| `<ThemeContext.Provider value={theme}>` | 将 theme 的**当前值**泵入 Context 管道 |
| `<Page />` | 子树中的任何组件都可以通过 `useContext` 读到 `value` 的当前值 |
| `setTheme('dark')` / `setTheme('light')` | 点击按钮 → state 更新 → Provider 的 value 变化 → **所有消费者自动重渲染** |

**三个重要细节：**

**① Provider 不是「全局变量」**

注意 `<ThemeContext.Provider>` 只包裹了 `<Page />` 和两个按钮，没有包整个应用。**Provider 的覆盖范围就是它的子树**——没有被 Provider 包裹的组件，`useContext` 只能拿到默认值 `"light"`。

这意味着 Context 的**粒度完全可控**：你可以只在一个弹窗、一个表单区域、甚至一个独立的 feature 里使用 Provider。它不是 Redux 那样的全局 store，而是一**段组件树的局部共享内存**。

**② `value` 是响应式的**

`value={theme}` 传入的不是一个静态值，而是一个**随时变化的 state**。一旦 `theme` 变化，React 会自动通知管道下游的每一个消费者：「数据更新了，请重渲染。」这个流程完全由 React 内部调度，你不需要手动通知任何人。

**③ Provider 可以嵌套**

如果你写了：

```jsx
<ThemeContext.Provider value="dark">
  <Page />                    {/* 这里读到 "dark" */}
  <ThemeContext.Provider value="light">
    <Child />                 {/* 这里读到 "light"——最近的 Provider 优先 */}
  </ThemeContext.Provider>
</ThemeContext.Provider>
```

React 会取**组件树上最近的 Provider** 的值。这就像每个楼层都可以有自己的「本地水泵」，把管道里的水温调成自己想要的。

### 3.3 第三步：`useContext`——在任意深度打开水龙头

有两种写法，demo 里都展示了。

**写法 A：直接用 `useContext`（`Page.jsx`）**

```javascript
// src/components/Page.jsx
import { useContext } from 'react';
import { ThemeContext } from '../ThemeContext';

const Page = () => {
  const theme = useContext(ThemeContext);
  console.log(theme);   // 'light' 或 'dark'

  return <>Page {theme}</>;
};

export default Page;
```

**写法 B：通过自定义 Hook 间接调用（`Child.jsx`）**

```javascript
// src/components/Child.jsx
import { useTheme } from '../hooks/useTheme';

function Child() {
  const theme = useTheme();
  console.log(theme);

  return (
    <>
      Child
      <button className={theme}></button>
    </>
  );
}

export default Child;
```

两种写法本质一样——都是调用 `useContext(ThemeContext)` 从管道里取值。区别在于写法 B 多做了一层封装，这是我们下一章要展开的内容。

**关键结论**：无论 `Page` 或 `Child` 嵌套在第几层，`useContext` 都能直接拿到 Provider 提供的值。**中间的组件不需要写一行 props 转发代码。** 这就是「虫洞」——入口和出口在逻辑上直连，组件层级的物理距离被完全忽略。

---

## 四、自定义 Hooks——把「取数据」封装成「功能积木」

### 4.1 为什么要封装？—— `useTheme` 的设计逻辑

如果你有 10 个组件要读 theme，难道在 10 个文件里都这么写吗？

```javascript
import { ThemeContext } from '../ThemeContext';
import { useContext } from 'react';
const theme = useContext(ThemeContext);
```

三行样板代码不算多，但有三层隐患：

**① 耦合**：每个消费者都必须知道 `ThemeContext` 来自 `'../ThemeContext'` 这个文件。某天你重构文件结构，把 `ThemeContext.jsx` 移到了别处——10 个文件的 import 路径全得改。

**② 暴露实现细节**：`useContext(ThemeContext)` 告诉消费者「这是用 Context 实现的」。万一你将来换成 Redux 或 Zustand？所有消费端代码都得改。好的设计应该让消费者**只关心「我要拿数据」**，不关心「数据从哪来、怎么来的」。

**③ 不够语义化**：`useContext(ThemeContext)` 不是一个业务语言。你写代码时的思维是「我要拿主题」，对应的代码应该是 `useTheme()`，而不是「我要从 ThemeContext 上下文里取值」。

**`useTheme` 的解法：**

```javascript
// src/hooks/useTheme.js
import { ThemeContext } from '../ThemeContext';
import { useContext } from 'react';

export function useTheme() {
  return useContext(ThemeContext);
}
```

然后所有消费者都变成了：

```javascript
const theme = useTheme();
```

一行。语义清晰。底层实现变了只改 `useTheme.js` 一个文件。

**比喻**：`useTheme` 就像房间里的**水龙头**。你拧开水龙头就有水，你不需要知道水是来自楼顶水箱还是地下管道。某天后勤把水箱换了，你家的水龙头不用换——这就是封装的价值。

### 4.2 不止于 Context：`useMouse`——自定义 Hooks 的通用威力

demo 里另一个文件 `useMouse.js` 和 Context 完全无关，但它展示了自定义 Hooks 的真正威力——**把响应式状态 + 副作用 + 生命周期，封装成一个可复用的「功能积木」。**

```javascript
// src/hooks/useMouse.js
import { useState, useEffect } from 'react';

export const useMouse = () => {
  const [x, setX] = useState(null);
  const [y, setY] = useState(null);

  const handleMouseMove = (e) => {
    setX(e.clientX);
    setY(e.clientY);
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      // 函数组件销毁后不会主动回收事件监听
      // 定时器、Worker、事件都需要手动回收
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return { x, y };
};
```

**拆解这个 Hook 做了什么：**

| 步骤 | 代码 | 属于什么 |
|------|------|---------|
| 声明状态 | `const [x, setX] = useState(null)` | **响应式数据**——x、y 变化时自动触发使用方重渲染 |
| 注册副作用 | `document.addEventListener('mousemove', ...)` | **副作用**——与浏览器 API 交互 |
| 清理副作用 | `return () => document.removeEventListener(...)` | **生命周期管理**——组件卸载时自动解绑，防止内存泄漏 |

这三者——响应式数据、副作用、生命周期——正是 React 组件最核心的三个维度。普通函数**做不到这些**：

```javascript
// ❌ 普通工具函数——不能用 useState、useEffect
function getMousePosition() {
  // 无法在这里跟踪鼠标、响应式更新 UI
  return { x: null, y: null };
}

// ✅ 自定义 Hook——完整拥有 React 能力
function useMouse() {
  // 可以 useState、useEffect，拥有完整的 React 运行时能力
}
```

**使用者只需一行：**

```javascript
// src/App.jsx
import { useMouse } from './hooks/useMouse';

function App() {
  const { x, y } = useMouse();

  return (
    <div style={{ height: '100vh', display: 'flex',
                  alignItems: 'center', justifyContent: 'center' }}>
      <h2>鼠标坐标：X: {x}, Y: {y}</h2>
    </div>
  );
}
```

**这就是自定义 Hooks 的核心价值**：它不像普通函数那样只封装「计算逻辑」，它封装的是**「一段完整的 React 运行时行为」**——状态、副作用、生命周期，统统打包进一个函数，对外只暴露最简单的接口。

**比喻**：`useMouse` 像一个**黑盒传感器**。你把它装在组件上，它就源源不断地输出 `{x, y}` 坐标。你不需要知道它内部是如何监听 DOM 事件、何时绑定何时解绑的——你只需要读它的输出。

### 4.3 自定义 Hooks 的架构意义

综合 `useTheme` 和 `useMouse`，我们可以总结自定义 Hooks 在项目架构中的角色：

```
src/hooks/   ← 项目架构层，而非业务组件
├── useTheme.js    ← 封装 Context 消费逻辑，向上对接数据层
├── useMouse.js    ← 封装浏览器交互，向下对接 DOM/API 层
└── …              ← 更多的「功能积木」
```

它们处于**数据层和 UI 层之间**——向上吸收数据（Context、state、外部 API），向下驱动组件渲染。这种中间层设计在大型项目中至关重要：

- **UI 组件负责「长什么样」**（JSX + CSS）
- **自定义 Hooks 负责「数据从哪来、怎么变」**（state + effect + context）
- **两层各司其职，互不污染**

---

## 五、架构全景图——两套模式，一张图

### 5.1 Context 模式（`App2.jsx` → ThemeContext 链路）

```
                    createContext("light")          ← ① 在虚空中开辟管道
                         │
                    ThemeContext                      ← 频道对象（不存数据，只是频道号）
                         │
              ┌──────────┼──────────┐
              │                     │
    <ThemeContext.Provider    (无 Provider 包裹的
      value={theme}>              组件只能拿到默认值)
              │
         ┌────┴────┐
        Page    <button>          ← 按钮改变 theme state
         │                         → value 变化 → 所有消费者重渲染
      [useContext 写在 Page 内部]
         │
        Child                       ← 用 useTheme() 取数据
         │
    useTheme() ──── useContext(ThemeContext) ──── 直达 Provider，完全跳过中间层级
```

**数据流向**：单向。从 Provider → Context 管道 → 各个 useContext 消费点。不可逆。

### 5.2 自定义 Hook 模式（`App.jsx` → useMouse 链路）

```
    useMouse()                          ← 自定义 Hook（黑盒传感器）
        │
  ┌─────┼─────┐
  │     │     │
useState  useEffect   cleanup          ← 内部封装：状态 + 副作用 + 生命周期
  │        │
  x,y    mousemove                     ← 响应式输出
  │
  └──→  App 组件消费 {x, y} 渲染        ← UI 层：数据驱动视图
```

**数据流向**：浏览器事件 → Hook 内部 state → 返回值 → 组件渲染。hook 是中间的**数据加工厂**。

### 5.3 两层架构叠在一起

如果把整个应用的架构看作一个三层模型：

```
┌─────────────────────────────────────────┐
│             UI 层（组件）                  │
│   Page.jsx  /  Child.jsx  /  App.jsx     │
│   「长什么样」—— JSX + CSS                 │
├─────────────────────────────────────────┤
│          逻辑层（自定义 Hooks）             │
│   useTheme.js  /  useMouse.js            │
│   「数据从哪来、怎么变」—— state + effect   │
├─────────────────────────────────────────┤
│           数据层（Context / State）         │
│   ThemeContext.jsx（createContext）       │
│   「数据存在哪、怎么分发」                   │
└─────────────────────────────────────────┘
```

- **数据层**只管「存什么、怎么分发」，不碰 UI。
- **逻辑层**（hooks）负责连接数据层和 UI 层，做数据转换和副作用管理。
- **UI 层**只管渲染，通过调用 hooks 拿到加工好的数据。

三层各司其职，这就是 React Hooks + Context 架构最优雅的地方。

---

## 六、总结：记住一个模板

每次你需要「跨越多个层级共享数据」时，按照以下模板走：

```javascript
// ─── 步骤 1：创建 Context（数据层）───
// 文件：src/contexts/XxxContext.jsx
import { createContext } from 'react';
export const XxxContext = createContext(defaultValue);

// ─── 步骤 2：在合适的范围挂 Provider（数据注入）───
// 文件：src/App.jsx 或任意父组件
import { XxxContext } from './contexts/XxxContext';
<XxxContext.Provider value={dynamicValue}>
  {children}
</XxxContext.Provider>

// ─── 步骤 3：封装自定义 Hook（逻辑层）───
// 文件：src/hooks/useXxx.js
import { useContext } from 'react';
import { XxxContext } from '../contexts/XxxContext';
export function useXxx() {
  return useContext(XxxContext);
}

// ─── 步骤 4：在任意组件中使用（UI 层）───
// 任何被 Provider 包裹的组件，无论嵌套多深
import { useXxx } from '../hooks/useXxx';
const data = useXxx();
```

三步走完，组件树**任何一个角落**，一行 `const data = useXxx()`，数据到手。

**核心心法**：

| 要诀 | 说明 |
|------|------|
| **Context 解决的是「距离」问题，不是「范围」问题** | Context 让深层组件跳过中间层拿数据，但 Provider 包多大范围、哪些组件能访问，完全由你控制 |
| **Provider 不是全局状态** | 它是组件树某一段的局部共享内存，粒度由你定义 |
| **自定义 Hook 是 Context 的最佳拍档** | 直接用 `useContext` 暴露了实现细节；用 `useXxx()` 封装，换实现方案只需改一个文件 |
| **Hook 封装的不只是逻辑，是 React 运行时能力** | 普通函数无法使用 `useState`、`useEffect`——Hook 把这个门槛抹平了，让你把「一段完整的响应式行为」打包复用 |

没有逐层传递，没有中间商赚差价。这就是 React Context + 自定义 Hooks 的架构之道。

---

> **项目源码**：`d:\workspace\sw_ai\fe\react\basic\context-demo\context-demo\src\`
>
> 包含文件：
> - `ThemeContext.jsx` —— createContext 创建上下文，默认值 `"light"`
> - `App2.jsx` —— Provider 注入动态 theme，两个按钮切换 light/dark
> - `components/Page.jsx` —— 用原生 `useContext` 消费上下文
> - `components/Child.jsx` —— 用自定义 `useTheme` Hook 消费上下文
> - `hooks/useTheme.js` —— 封装 `useContext(ThemeContext)` 为语义化接口
> - `hooks/useMouse.js` —— 自定义 Hook 通用案例：监听鼠标坐标，封装响应式 + 副作用 + 生命周期管理
> - `App.jsx` —— useMouse 的消费端，展示鼠标实时坐标

# 从 Progress 到 App：用 React 组件化思想搭建 DeepSeek-R1 的加载与交互界面
## ——逐行拆解 progress.tsx 和 App.tsx 的设计与实现

---

> **一句话结论：Progress 组件封装了「如何展示一个下载进度条」的全部逻辑，App 组件则负责编排「什么时候加载模型、加载到哪了、加载完能干什么」。一个管微观，一个管宏观，两者通过 Props 对接，恰好诠释了 React 组件化开发的核心范式。**

---

## 金字塔第一层：核心问题——这两个文件在项目中分别承担什么角色？

在上一篇文章里，我们聊了为什么要用 React、Tailwind CSS 和 WebGPU 把一个大模型塞进浏览器。那些是「为什么」和「选什么」的问题。现在我们要进入「怎么做」——具体到代码层面，到底怎么写？

整个项目的 UI 代码集中在 `src/` 目录下的三个核心文件：

```
src/
├── main.tsx                  # 入口：把 App 组件挂到页面上
├── App.tsx                   # 主组件：管理所有数据状态，编排整个界面
└── components/
    └── progress.tsx           # 子组件：负责渲染单条进度条
```

**main.tsx 只做一件事**——找到 HTML 里的 `<div id="root">`，把 `<App />` 塞进去。就像一个剧院经理，打开大门，让主角（App）上台。它的代码只有 7 行，但每一行都在践行 React 18 的并发渲染思想（`createRoot` 替代了旧的 `ReactDOM.render`）。

**剩下的所有活，都在 App.tsx 和 progress.tsx 里。**

这两个文件的关系可以用一个比喻说清楚：

> **App 是建筑总设计师，progress 是标准化的预制板材。** 设计师决定要建几层楼、每层什么功能、什么时候开工。板材则把所有跟「展示进度」有关的样式、计算、渲染逻辑封装在内部，只暴露出三个接口（text、progress、total）。设计师不需要知道板材内部的构造细节，只需要知道「给它什么数据，它就渲染出什么样子」。

用 React 的术语来说，这就是 **「Props 向下传递，状态向上管理」** 的单向数据流模型。接下来我们逐层拆开这两个文件。

---

## 金字塔第二层：progress.tsx——一个标准 React 组件的完整解剖

progress.tsx 只有 44 行，但它是一个「麻雀虽小五脏俱全」的 React + TypeScript 组件标准模板。我们从外到里把它拆成四层。

### 第一层：TypeScript 接口——组件与外部世界的「合同」

```tsx
interface ProgressProps {
  text: string;
  progress: number;
  total: number;
}
```

这 4 行代码的重要性远超它看起来的样子。它定义了一份**类型合同**。任何使用 Progress 组件的地方，都必须遵守这份合同：

| 属性 | 类型 | 含义 | 示例值 |
|------|------|------|--------|
| `text` | `string` | 文件名 | `"model.onnx"` |
| `progress` | `number` | 当前进度百分比 | `50` |
| `total` | `number` | 文件总大小（字节） | `34353543453` |

为什么这很重要？考虑一个没有 TypeScript 的世界——如果有人不小心写成了 `<Progress text={123} progress="half" />`，这个错误会一路潜伏到浏览器运行时才暴露。你看到的是一条奇怪的报错或一片空白界面，你完全不知道是哪个地方传错了数据。

有了 TypeScript，VSCode 会在你**敲代码的那一刻**就把这行标红，并在鼠标悬停时告诉你：「`text` 期望 `string`，但你给了 `number`。」这种「编译时发现错误」的能力，是大型前端项目可维护性的基石。

**一个设计技巧：接口的命名。** 如果你叫它 `IProgressProps`（加个 `I` 前缀），这是 C# 的遗产风格。React 社区的主流实践是不加前缀，就叫 `ProgressProps`——因为 TypeScript 的类型推断已经足够聪明，你不需要靠命名来区分类型和变量。React 官方文档和 DefinitelyTyped 的类型定义都遵循这个惯例。

### 第二层：`formatBytes`——一个纯函数的数学之美

```tsx
function formatBytes(size: number): string {
  const i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
  return (
    +(size / Math.pow(1024, i)).toFixed(2) * 1 +
    ["B", "kB", "MB", "GB", "TB"][i]
  );
}
```

这是整个组件里最「有技术含量」的工具函数。让我们一步步拆开来看。

**为什么不能简单用 if-else？**

你可能会想，为什么不这样写：

```tsx
if (size >= 1024 * 1024 * 1024 * 1024) return `${(size / TB).toFixed(2)} TB`;
if (size >= 1024 * 1024 * 1024)       return `${(size / GB).toFixed(2)} GB`;
if (size >= 1024 * 1024)               return `${(size / MB).toFixed(2)} MB`;
if (size >= 1024)                      return `${(size / KB).toFixed(2)} KB`;
return `${size} B`;
```

当然可以。但 `formatBytes` 的做法更优雅——**它用一个数学公式替代了一串 if-else。**

**核心原理：对数（logarithm）用于「量级定位」。**

对数的本质是回答一个问题：「把一个数除以基数，要除多少次才能得到 1？」对 1024 取对数，就是在问：「这个字节数在 1024 的量级阶梯上排第几级？」

| 字节数 | `Math.log(size) / Math.log(1024)` | `Math.floor(...)` | 索引 i | 单位 |
|--------|-----------------------------------|-------------------|---------|------|
| `500` | ~0.89 | 0 | 0 | B |
| `2048` | ~1.11 | 1 | 1 | kB |
| `1048576` | ~2.00 | 2 | 2 | MB |
| `34353543453` | ~4.99 | 4 | 4 | GB |

数字越大，i 就越大。i 精确地告诉我们该用哪个单位。

**逐句拆解 `return` 语句：**

```tsx
+(size / Math.pow(1024, i)).toFixed(2) * 1
```

看起来像在打哑谜，拆开来看：

1. `Math.pow(1024, i)` — 1024 的 i 次方，比如 i=2 时是 1048576（1MB 的字节数）。
2. `size / Math.pow(1024, i)` — 把原始字节数缩放到对应单位，比如 `34353543453 / 1099511627776 ≈ 31.24`（31.24 GB）。
3. `.toFixed(2)` — 保留两位小数，变成字符串 `"31.24"`。
4. `* 1` — 把字符串乘 1，JavaScript 隐式转换回数字 `31.24`。这个技巧等价于 `Number("31.24")` 或 `parseFloat("31.24")`，但更短。
5. 最前面的 `+` — 和 `* 1` 同理，又是一次隐式转数字。**这里确实有冗余**——`+(...).toFixed(2) * 1` 做了两次类型转换。这其实是实际项目代码中常见的「多写了一道保险」，不影响结果，你可以直接写成 `+(size / Math.pow(1024, i)).toFixed(2)`。

然后是 `+ ["B", "kB", "MB", "GB", "TB"][i]`——用数组下标取单位名称，直接拼在数字末尾。比如最终结果是 `"31.24GB"`。

**一个细节：为什么是 size == 0 而不是 !size？**

```tsx
const i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
```

`Math.log(0)` 返回 `-Infinity`，所以必须特殊处理。但为什么用 `size == 0`（宽松相等）而不是 `size === 0`（严格相等）？因为在 TypeScript 里 `size` 的类型已经声明为 `number`，不存在 `"0"` 字符串的情况。用 `==` 或 `===` 在这里没有实际区别，用 `===` 会是更严谨的写法。

**这个函数为什么值得单独拆出来？**

它满足「纯函数」的三个条件：
- 同样的输入永远返回同样的输出（确定性）
- 不修改任何外部变量（无副作用）
- 不依赖任何外部状态（自包含）

这意味着它非常好测试——你可以写 `formatBytes(0) === "0B"`、`formatBytes(1024) === "1kB"`，不需要 mock 任何东西。而且将来如果要在别的地方显示文件大小，直接 import 就能复用。

### 第三层：组件函数本体——解构、默认值、JSX

```tsx
const Progress = ({ text, progress, total }: ProgressProps) => {
  const percentage = progress ?? 0;
  return (
    <div className="w-full bg-gray-100 text-left rounded-lg overflow-hidden mb-0.5">
      <div 
        style={{ width: `${percentage}%` }}
        className="bg-blue-400 whitespace-nowrap px-1 text-sm"
      >
        {text}
        {percentage.toFixed(2)}%
        {isNaN(total) ? "" : ` of ${formatBytes(total)}`}
      </div>
    </div>
  )
}
```

**解构语法：从「传进来一整个对象」到「只取需要的属性」**

```tsx
const Progress = ({ text, progress, total }: ProgressProps) => {
```

这是 ES6 的参数解构。等价于：

```tsx
const Progress = (props: ProgressProps) => {
  const text = props.text;
  const progress = props.progress;
  const total = props.total;
```

解构的好处不只是少写几个字。它向阅读代码的人传递了一个清晰的信号：**「这个组件只关心这三个属性，忽略其他一切。」** 这是「最少知识原则」的体现。

**空值合并运算符 `??`：防御性编程的优雅表达**

```tsx
const percentage = progress ?? 0;
```

`??`（Nullish Coalescing）和 `||` 看起来很像，但有本质区别：

| 表达式 | `0 \|\| 50` | `0 ?? 50` |
|--------|-----------|----------|
| 结果 | `50`（因为 0 是 falsy） | `0`（因为 0 不是 null/undefined） |

如果进度真的到了 `0%`，我们想显示的就是 `0%`，而不是悄悄变成了 `50%`。`??` 只在值为 `null` 或 `undefined` 时启用默认值，对 `0`、`""`、`false` 这些合法的假值不予处理。在进度条这个场景下，这是更正确的防御策略。

**JSX 结构：外层容器 + 内层进度条**

```tsx
<div className="w-full bg-gray-100 text-left rounded-lg overflow-hidden mb-0.5">
  <div 
    style={{ width: `${percentage}%` }}
    className="bg-blue-400 whitespace-nowrap px-1 text-sm"
  >
```

这里有两个 div，分别承担不同的职责：

- **外层 div（灰色背景条）**：`w-full`（宽度 100%）+ `bg-gray-100`（浅灰底色）+ `rounded-lg`（圆角）+ `overflow-hidden`（裁剪超出部分）。它是「轨道的底板」，决定了进度条的最大宽度和外观形状。
- **内层 div（蓝色进度条）**：`bg-blue-400`（蓝色填充）+ `whitespace-nowrap`（文字不换行）+ `px-1`（水平内边距）+ `text-sm`（小字号）。它显示在轨道之上，宽度由 `style` 动态控制。

**为什么同时用 className 和 style？**

```tsx
style={{ width: `${percentage}%` }}
```

这是 React 中一个非常经典的区分：
- **静态样式用 `className`**：颜色、圆角、字号、内边距——这些在设计时就知道，不会在运行时改变。
- **动态样式用内联 `style`**：`width` 随 `percentage` 实时变化——这是运行时的数据，无法在编译时确定。

Tailwind 能处理大多数场景，但它不能生成「宽度 = 当前进度值%」这样的动态 CSS 类名。你必须用内联 style 来补上 Tailwind 覆盖不到的部分。

**`overflow-hidden` + `rounded-lg` 的组合妙用**

当进度条宽度从 0% 变到 100% 的过程中，内层 div 的宽度在动态变化。如果外层 div 没有 `overflow-hidden`，内层 div 的圆角边缘可能在某些宽度下溢出外层。加上 `overflow-hidden` 配合 `rounded-lg`，内层 div 的边缘就会干净利落地被裁切——进度条从头到尾都保持对外层圆角的遵守。

**文本内容的三段拼接：**

```tsx
{text}
{percentage.toFixed(2)}%
{isNaN(total) ? "" : ` of ${formatBytes(total)}`}
```

最终在进度条上显示的内容可能是：`model.onnx 31.24% of 31.99GB`

- `{text}` — 文件名，直接展示
- `{percentage.toFixed(2)}%` — 进度百分比，保留两位小数，拼上百分号
- `{isNaN(total) ? "" : " of ..."}` — 如果 total 是有效数字，显示格式化后的文件大小；否则不显示。`isNaN` 检查应对了 total 可能是 `NaN` 或 `undefined` 的边界情况。

### 第四层：export——组件如何被外部使用

```tsx
export default Progress;
```

用的是 `export default`（默认导出）。这意味着在 App.tsx 里可以这样导入：

```tsx
import Progress from './components/progress.tsx';
```

而如果用命名导出（`export { Progress }`），导入就得写成 `import { Progress } from '...'`。两种方式没有绝对的好坏，但默认导出的语义是——**「这个文件的主要产出就是这个组件」**。这让文件职责一目了然。

---

## 金字塔第三层：App.tsx——数据状态驱动的界面编排引擎

如果 progress.tsx 是一块精致的预制板，那 App.tsx 就是把无数块预制板拼成一栋楼的施工总图。它有 213 行，包含了状态管理、条件渲染、事件处理、列表循环、双向绑定等几乎所有 React 核心概念。我们从上到下，分七个模块拆解。

### 模块一：import——从依赖看项目架构

```tsx
import { useState, useEffect } from 'react';
import Progress from './components/progress.tsx';
```

只引入了两个 React Hook 和一个子组件。**导入列表越短，说明依赖越少，架构越干净。**

`useState` 和 `useEffect` 是 React Hooks 的「双子星」——一个管数据状态，一个管组件生命周期。90% 的 React 组件只需要这两个 Hook 就够了。

### 模块二：状态设计——App 组件的「数据骨架」

```tsx
const [status, setStatus] = useState<null | 'loading' | 'ready'>(null);
const [error, _setError] = useState(null);
const [loadingMessage, setLoadingMessage] = useState("开始加载");
const [progressItems, setProgressItems] = useState([
  { text: 'model.onnx', percentage: 0, total: 34353543453 },
  { text: 'model2.onnx', percentage: 10, total: 14353543453 }
]);
const [input, setInput] = useState('');
```

这 5 个 `useState` 定义，**构成了整个 App 的「数据骨架」**。每一个状态变量都在回答一个特定的业务问题：

| 状态变量 | 回答的问题 | 类型与初始值 | 驱动的界面区域 |
|---------|-----------|-------------|-------------|
| `status` | 「模型加载到哪一步了？」 | `null` → `'loading'` → `'ready'` | 按钮禁用、加载区域显示、聊天框可用 |
| `error` | 「加载出错了没？什么错？」 | `null`（没出错）或错误消息字符串 | 红色错误提示区域 |
| `loadingMessage` | 「正在干什么，该告诉用户什么？」 | `"开始加载"`→更新为进度信息 | 进度条上方的状态文字 |
| `progressItems` | 「哪些文件在下载，各下载了多少？」 | 包含两个文件的数组 | 每条进度条的 text、percentage、total |
| `input` | 「用户在聊天框里打了什么字？」 | `""`（空字符串） | textarea 的内容显示 |

**一个命名变化值得关注：**

```tsx
const [error, _setError] = useState(null);
```

注意看——不是 `setError`，而是 `_setError`。前面的下划线是 JavaScript 社区的约定：**「这个函数存在，但当前阶段暂不使用。」** 这样做一方面避免了 TypeScript 的「声明但未使用」警告，另一方面也向代码读者传递了明确的信号：「错误处理的 setter 已经准备好了，等后续接入真实模型加载逻辑时用，现在先留着接口。」

如果你写 `const [error] = useState(null)`（不取 setter），虽然也是合法的，但将来要加 setError 调用的地方就得回头改——不如一开始就留着。`_` 前缀是一种务实的半成品标记。

**progressItems 的初始值设计：**

```tsx
const [progressItems, setProgressItems] = useState([
  { text: 'model.onnx', percentage: 0, total: 34353543453 },
  { text: 'model2.onnx', percentage: 10, total: 14353543453 }
]);
```

初始值的两个对象包含了 `text`、`percentage`、`total` 三个字段，恰好匹配 Progress 组件的 Props 接口。这不是巧合——**子组件的 Props 接口反向约束了父组件的数据结构设计。** 这就是 TypeScript 驱动开发（TDD 的另一个含义）的实际表现：先定义接口，数据结构自然跟上。

### 模块三：WebGPU 检测——一句代码的「是」与「否」

```tsx
const IS_WEBGPU_AVAILABLE = !!(navigator as any).gpu;
```

这行代码包含了三层知识：

**第一层：`navigator.gpu` 是什么？**  
`navigator` 是浏览器暴露给 JavaScript 的全局对象，包含了浏览器和操作系统的信息。`navigator.gpu` 是 WebGPU API 的入口——如果浏览器支持 WebGPU（Chrome 113+、Edge 113+），这个属性返回一个 GPU 对象；如果不支持，它就是 `undefined`。

**第二层：`!!` 双重否定。**  
- `navigator.gpu` → GPU 对象（真值）或 `undefined`（假值）
- `!navigator.gpu` → 取反：`false`（本来是对象）或 `true`（本来是 undefined）
- `!!navigator.gpu` → 再取反：`true`（支持）或 `false`（不支持）

任何值经过 `!!` 之后，一定是干净的布尔值 `true` 或 `false`。这比 `Boolean(navigator.gpu)` 更短，比 `navigator.gpu !== undefined && navigator.gpu !== null` 更优雅。它是 JavaScript 社区的经典 idiom。

**第三层：`as any` 类型断言。**
```tsx
(navigator as any).gpu
```

`navigator.gpu` 目前在 TypeScript 的默认类型定义中尚未作为标准属性声明（WebGPU 的 TypeScript 类型支持还在完善中）。直接写 `navigator.gpu` 会触发 TS 类型检查报错——「gpu 不在 navigator 上」。`as any` 告诉 TypeScript：「我知道我在做什么，把这个值当作 any 类型，跳过检查。」

`as any` 是一把双刃剑——用得好是灵活的逃生舱，用多了是类型安全的灾难。这里的使用场景是合理的，因为它处理的是类型定义缺位而非代码逻辑问题。

**这行代码决定了整个 App 渲染哪条分支。** 如果 `IS_WEBGPU_AVAILABLE` 是 `false`，后面的所有界面都不会渲染，用户只会看到「您的浏览器还不支持 WebGPU」——一条命中的防线。

### 模块四：事件处理——`onClick` 里的异步状态编排

这是整个 App 最核心的交互逻辑。用户点击「Load Model」按钮后，发生了什么？

```tsx
onClick={async () => {
  setStatus("loading");
  const newProgress = progressItems.map(item => ({ ...item, percentage: 0 }));
  setProgressItems([...newProgress]);

  for (let step = 0; step <= 100; step += 2) {
    await new Promise(resolve => setTimeout(resolve, 50));
    newProgress[0] = { ...newProgress[0], percentage: step };
    if (step > 30) {
      newProgress[1] = { ...newProgress[1], percentage: Math.min((step - 30) * 100 / 70, 100) };
    }
    setProgressItems([...newProgress]);
    setLoadingMessage(`正在下载模型... ${step}%`);
  }

  setLoadingMessage('模型加载完成！');
  setStatus('ready');
}}
```

我们在参考文章里已经聊过这段代码的基本逻辑。这里我们聚焦于**细节中容易踩的坑和设计思想**。

**坑一：展开运算符 `...` 为什么要出现这么多次？**

```tsx
const newProgress = progressItems.map(item => ({ ...item, percentage: 0 }));
//                                               ^^^^^^^^
```

这一行做了两件事：
1. `.map()` 遍历数组，对每个元素执行操作，返回一个新数组。
2. `{ ...item, percentage: 0 }` 利用对象展开语法创建了一个新对象 —— 复制 `item` 的所有属性，再覆盖 `percentage` 为 0。

为什么要创建新数组和新对象？**因为 React 的渲染机制依赖「引用对比」。**

React 用 `Object.is()` 来判断状态有没有变（内部等价于 `===` 浅比较）。如果你直接写 `progressItems[0].percentage = 0` 然后 `setProgressItems(progressItems)`，React 看到同一个数组引用，认为「没变化」，就不触发重新渲染。**你必须传入一个新引用**——不论是新数组（`[...newProgress]`）还是新对象（`{ ...item }`）——React 才会说「哦，状态变了，重绘界面」。

这是 React 开发者最容易犯的错之一，也是面试高频考点。记住一条铁律：**`setState` 的参数必须是一个全新的引用，不能是原地修改的同一个对象。**

**坑二：为什么不直接 `await new Promise(resolve => setTimeout(resolve, 50))`？**

```tsx
await new Promise(resolve => setTimeout(resolve, 50));
```

`setTimeout` 本身是回调风格的异步函数，不返回 Promise。把这行包在 `new Promise` 里，相当于给它「加了一层 async/await 适配器」——把回调风格的 API 转成 Promise 风格，让它可以被 `await`。

50 毫秒是一个微妙的数字——它让进度条看起来有「Loading」的感觉，但又不会慢到让人烦躁。在真实项目中，这里会被替换为 Transformers.js 的 `pipeline` 函数，它会根据实际的模型下载速度回调进度更新。

**坑三：两个文件下载的时序设计**

```tsx
newProgress[0] = { ...newProgress[0], percentage: step };
if (step > 30) {
  newProgress[1] = { ...newProgress[1], percentage: Math.min((step - 30) * 100 / 70, 100) };
}
```

这段代码模拟出了一种真实的下载感受——第一个文件（`model.onnx`）从头到尾在下（0-100%），第二个文件（`model2.onnx`）**在前者到了 30% 后才开始下载**。为什么是 30%？因为在实际场景中，模型文件可能有依赖关系（比如 graph 文件要在权重文件下载完毕后才加载），不是同时开始的。

`(step - 30) * 100 / 70` 这个公式让第二个文件在 step 从 30 到 100 的 70 个档次中，把自己 0 到 100 的比例映射进去。`Math.min(..., 100)` 确保最后不会超过 100%。

**坑四：按钮的 `disabled` 逻辑**

```tsx
disabled={status !== null || error !== null}
```

当 `status` 不是 `null`（即已经处于 `"loading"` 或 `"ready"` 状态），或者 `error` 存在时，按钮不可点击。这个设计防止了重复加载——如果模型正在下载（loading）或已经加载完成（ready），用户再怎么点按钮也没反应。

配合 Tailwind 的 `disabled:cursor-not-allowed` 和 CSS 的 `select-none`，整个交互体验是完整的：
- 视觉上：按钮变灰
- 交互上：点击无效，鼠标变为禁止符
- 文字上：不可被选中

**五个状态转换的全貌：**

```
null ──[点击按钮]──→ loading ──[下载完成]──→ ready
 │                      │
 │                      └──[下载失败]──→ error（展示红色错误信息）
 └──[不支持WebGPU]──→ 不渲染任何内容，只显示提示
```

每一个状态之间的箭头都是一个**业务事件**，每一次事件触发都会调用对应的 `setXxx`，然后 React 自动重绘界面。你一行 DOM 操作代码都不用写。

### 模块五：条件渲染——同一个界面，四种不同的面孔

App 组件用 JSX 里的条件表达式，实现了四类界面的切换：

**面孔一：不支持 WebGPU**

```tsx
IS_WEBGPU_AVAILABLE ? (/* 完整的 AI 加载界面 */) : (
  <div>您的浏览器还不支持WebGPU</div>
)
```

这是最外层的大判断。三元运算符在这里很合适，因为只有两种互斥可能——要么能用，要么不能用。如果用 `&&` 短路运算符，逻辑会变得很难读。

**面孔二：加载出错（红色错误提示）**

```tsx
error && (
  <div className="text-red-500 text-center mb-2">
    <p className="mb-1">Unable to load model due to the following error:</p>
    <p className="text-sm">{error}</p>
  </div>
)
```

`&&` 短路求值在这里比三元更合适——要么显示错误提示（error 有值时），要么什么都不显示（error 为 null 时）。用三元就得写成 `error ? <div>...</div> : null`，多余且噪声大。

**面孔三：正在加载（进度条区域）**

```tsx
status === "loading" && (
  <div className="w-full max-w-[500px] ...">
    <p className="text-center mb-1">{loadingMessage}</p>
    {progressItems.map(({ text, percentage, total }, i) => (
      <Progress key={i} text={text} progress={percentage} total={total} />
    ))}
  </div>
)
```

这里有两个关键点：

- **`key={i}`**——React 要求 `map` 生成的每一条子元素都有唯一的 key，用于高效对比 Virtual DOM 的差异。用数组下标 `i` 作为 key 在这里是可以接受的，因为 progressItems 不会在运行时增删元素（文件数量是固定的）。但如果列表会动态增删，用下标作为 key 就是 bug 的来源——元素顺序变了会导致 React 错误地复用 DOM 节点。
- **Progress 组件的 Props 和 state 的字段名不完全一致**——状态里的字段叫 `percentage`，但 Progress 的 Props 叫 `progress`。这个命名不一致是实际代码中的小瑕疵，但功能不受影响。更好的做法是保持命名一致，减少读者心智负担。

**面孔四：聊天输入框（任何状态的常驻区域）**

```tsx
<div className="mt-2 border border-gray-300 rounded-lg w-[600px] max-w-[80%] ...">
  <textarea
    className="w-[550px] ..."
    placeholder="Type your question here..."
    value={input}
    onInput={(e) => { setInput((e.target as HTMLTextAreaElement).value); }}
    onKeyDown={(e) => {
      if (input.length > 0 && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onEnter();
      }
    }}
    title={status == "ready" ? 'Model is ready' : 'Model is not loaded.'}
  />
</div>
```

聊天输入框常驻在页面底部（`mb-3`），不受 status 控制。但它有自己的交互逻辑：

- **`value={input}` + `onInput={...}` = 受控组件（Controlled Component）。** React 管数据源（`input` 状态变量），textarea 只负责展示和触发事件。用户每敲一个键，`onInput` 触发，`setInput` 更新状态，React 重新渲染 textarea。**React 是唯一的数据真相来源（Single Source of Truth）。**
- **`onKeyDown` 判断了三样**：`input.length > 0`（不是空的）、`e.key === 'Enter'`（按了回车）、`!e.shiftKey`（没有同时按 Shift——Shift+Enter 用于换行）。三样都满足才发送。`e.preventDefault()` 阻止了浏览器的默认换行行为。
- **`title` 属性**在鼠标悬停时提示模型状态——一个小巧思，不用额外 UI 就让用户知道能不能聊。

### 模块六：`useEffect`——组件生命周期的出入点

```tsx
useEffect(() => {
  console.log('组件已经挂载完成');
}, [])
```

这个 `useEffect` 目前只做了一件事——在组件挂载后打印一条日志。但它是你将来添加真实逻辑的「插槽」：

```tsx
useEffect(() => {
  // TODO: 初始化 WebGPU 上下文
  // TODO: 从 IndexedDB 读取缓存的模型
  // TODO: 检查模型版本，决定是否需要重新下载
}, [])
```

`useEffect` 的第二个参数 `[]`（空依赖数组）意味着「只在组件第一次出现时执行一次」。如果写了 `[status]`，就是「当 status 变化时重新执行」。这是 React 副作用管理的核心机制。

**console.log 的位置之谜：**

你可能注意到，组件函数体里也有一行：

```tsx
console.log('组件函数执行');
```

这两条 log 的执行顺序是：
1. **`'组件函数执行'`**——在每次 render 的时候都执行。React 调用函数组件 = 执行函数体 = render。
2. **`'组件已经挂载完成'`**——在首次 render 完成后，`useEffect` 回调被执行。

render 和 effect 的时间差是理解 React 工作流程的关键。render 是纯计算（输入 props/state → 输出 JSX），不产生副作用。effect 是在 render 结果被提交到 DOM 后才运行——此时你可以安全地操作 DOM、发起请求、设置订阅。

### 模块七：`onEnter`——等待真实业务逻辑接入的「接口桩」

```tsx
const onEnter = () => {
  console.log(input);
}
```

当前只打印用户输入的内容到控制台。这是一个**接口桩（Stub）**——告诉你「这里将来会有业务逻辑」。在实际项目中，这里会被替换为：

```tsx
const onEnter = async () => {
  const response = await pipeline(input);  // Transformers.js 推理
  setMessages([...messages, { role: 'user', content: input }, { role: 'assistant', content: response }]);
  setInput('');  // 清空输入框
}
```

**代码里有 `onEnter` 在 ready 和非 ready 状态都能调用的设计问题吗？** 确实——`onEnter` 没有检查 `status`，用户在任何时候按回车都会触发。但这是有意的：`title` 属性已经给了用户提示（模型是否 loaded），而且 `console.log` 本身是无害的。后续接入真实逻辑时加上守卫判断即可。

---

## 金字塔塔尖：从这两个文件看 React 的组件化思维模型

回到开头我们说的那个比喻——Progress 是预制板材，App 是建筑总图。这篇文章我们几乎逐行拆开了这两个文件，现在让我们把视角拉回来，总结几条可以带走的原则。

### 原则一：组件是「数据 → UI」的纯函数

```
Props/State → 组件函数 → JSX
```

你不需要关心 DOM 怎么更新（React 替你做了），你不需要关心 CSS 怎么注入（Tailwind 替你做了），你只需要关心：**输入哪些数据，输出什么界面。** 这让你可以像写纯函数一样写 UI，测试、调试、重构都变得可预测。

### 原则二：子组件封装「怎么做」，父组件决定「做什么」

Progress 组件封装了：
- `formatBytes`——字节换算的数学细节
- `rounded-lg overflow-hidden`——进度条外观的 CSS 细节  
- `{percentage.toFixed(2)}%`——百分比格式化的展示细节

App 组件不需要知道这些。它只关心：
- 有哪些文件要下载（`progressItems`）
- 现在每个文件下载到多少了（`percentage` 更新）
- 什么时候显示进度条（`status === "loading"`）

**这就是关注点分离（Separation of Concerns）在组件层面的体现。** 每一层做好自己的事，通过接口（Props/TypeScript 类型）对接。

### 原则三：数据状态是界面的唯一真相来源

App 里的 5 个 `useState` 变量，联合起来完整描述了一个时刻的全部界面状态。**你在浏览器里看到的任何东西——按钮的颜色、进度条的宽度、文字的内容、输入框的值——都是这些状态变量的投影。**

你永远不需要写 `document.getElementById("progress-bar").style.width = "50%"`。你只需要 `setProgressItems(...)` 让 percentage 变成 50，React 自动完成剩下的工作。这就是声明式 UI 的终极形态。

### 原则四：TypeScript 接口是组件之间的法律合同

`ProgressProps` 定义了使用 Progress 组件时必须遵守的规则。违反规则？（比如传了错误类型）→ 编辑器标红 → 编译不通过 → 不会到达用户的浏览器。

这种「编译时保障」是前端工程从「手工作坊」走向「工业化生产」的关键一步，对于需要团队协作的大型项目来说是不可或缺的。

---

## 附录：完整的组件树

```
App (主组件)
├── [IS_WEBGPU_AVAILABLE === true 分支]
│   ├── <div> 标题区域
│   │   ├── <h1> DeepSeek-R1 WebGPU
│   │   └── <h2> 副标题描述
│   ├── <p> 项目说明（HuggingFace、Transformers.js 链接）
│   ├── [error 存在时]
│   │   └── <div> 红色错误提示
│   ├── <button> Load Model（disabled 受 status/error 控制）
│   ├── [status === "loading" 时]
│   │   ├── <p> loadingMessage 状态文字
│   │   ├── <Progress> model.onnx 进度条
│   │   └── <Progress> model2.onnx 进度条
│   └── <div> 聊天输入区域
│       └── <textarea> （value 绑定 input 状态，onKeyDown 处理回车发送）
│
└── [IS_WEBGPU_AVAILABLE === false 分支]
    └── <div> 您的浏览器还不支持WebGPU
```

---

*本文是 DeepSeek-R1 WebGPU 系列文章的第四篇，聚焦于 progress.tsx 和 App.tsx 两个核心文件的逐行解析。第一篇介绍了项目动机与技术选型，第二和第三篇分别讨论了另外的关键模块。核心代码位于 `webGPU-demo/src/` 目录下。*

# 在浏览器里跑一个推理大模型，到底是怎么回事？
## ——用 React + WebGPU 搭建 DeepSeek-R1 端侧 AI 应用的完整思考

---

> **一句话结论：我们不再需要把数据发给远程服务器才能用 AI。借助 WebGPU、Transformers.js 和 React 组件化思想，一个 15 亿参数的推理大模型可以直接在你的浏览器里下载、运行、推理——离线也能用，数据不出电脑。**

---

## 金字塔第一层：核心问题——为什么要把 AI 装进浏览器？

### 你也许已经习惯了这样的体验：

打开 ChatGPT 或 DeepSeek 官网，在输入框里打字，等几秒钟，回答就出来了。你感觉很快、很方便。但如果你停下来想一想，这背后发生了什么——

你打的每一个字，都会被包装成一个网络请求，穿越无数路由器和光纤，最终到达某个远在千里之外的机房。那里有成百上千张显卡正在全速运转，消耗着惊人的电力。它们计算完之后，再把结果打包成网络数据，原路返回你的屏幕。

这像什么？**就像你每说一句话，都要先打一个国际长途到美国，等对方翻译完再回拨给你。** 贵、慢、而且你说的每一句话都被对方听得一清二楚。

### 三个痛点：

| 痛点 | 云端 API 模式 | 端侧模型模式 |
|------|-------------|------------|
| **成本** | 每次对话都在烧 GPU，按 token 计费 | 模型下载一次，本地推理零费用 |
| **隐私** | 你的上下文（context）随着每次请求发送到服务器 | 数据永远不离开你的设备 |
| **可用性** | 没有网络 = 彻底瘫痪 | 模型加载完就能离线使用 |

所以一个自然的想法产生了：**能不能把模型直接搬到用户自己的设备上？**

这就是「端侧模型」的核心思想——LLM 不放在远程，而是放在用户端。

你的手机、你的汽车、你的浏览器，都可以各司其职地运行专门的小参数模型。手机上的模型帮你整理短信，汽车上的模型帮你规划导航，浏览器里的模型帮你做本地推理——不需要把数据发给任何人。

而 WebGPU，就是让浏览器拥有「接近原生 GPU 算力」的那把钥匙。

---

## 金字塔第二层：技术栈怎么选？——React + TypeScript + Tailwind CSS

有了目标（浏览器里跑 AI），下一步就是选工具。这个项目选择了以下技术组合，每一个选择背后都有原因。

### 为什么是 React，不是 Vue？

Vue 确实更好上手。一个 `.vue` 文件，`<template>` 写结构、`<script>` 写逻辑、`<style>` 写样式，三明治一样叠在一起，一目了然。

但 React 有一个 Vue 难以比拟的优势：**在 AI 时代，React 的训练数据更多。**

这是什么意思？

像 Claude、GitHub Copilot 这样的 AI 编程助手，它们的代码生成能力很大程度上取决于训练时「见过」多少类似的代码。全球范围内，React 的大型开源项目、企业级应用的代码量远超 Vue。这就导致一个正向循环：AI 更擅长写 React → 更多人用 React → 更多 React 代码被训练 → AI 更擅长写 React。

另外，React 的组件本质上就是**一个返回 HTML 的 JavaScript 函数**。没有额外的模板语法，没有自定义指令。对于一个已经会 JavaScript 的人来说，React 的学习路径更短——你只是在写函数。

### 「函数就是组件」——React 组件思想的精髓

让我们用一个比喻来理解：

**传统的前端开发像是手工打造家具。** 你要亲自去木材市场选料（HTML），自己调配油漆（CSS），自己画图纸（JS），然后把它们一件一件拼起来。

**React 组件化像是玩乐高。** 每个组件是一块标准化的积木，有自己的形状（HTML）、颜色（CSS）和行为（JS），三者封装为一体。你搭页面的时候，不需要关心每块积木内部是怎么做的，只要知道它「长什么样」和「能做什么」，然后一块一块拼上去就行。

用代码来看，就是这样：

```tsx
// 一个组件就是一个函数，返回一段 HTML
function Progress({ text, progress, total }) {
  return (
    <div>
      <span>{text}</span>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
```

这个函数名叫 `Progress`，它接收数据（text、progress、total），返回一段描述进度条的 HTML。你可以在任何地方像使用 HTML 标签一样使用它：`<Progress text="model.onnx" progress={50} total={34353543453} />`。

**这就是 React 最骄傲的发明——JSX。** 它让你在 JavaScript 代码里直接写 HTML 标签。JSX 的全称是 JavaScript XML，因为 HTML 本质上就是一种 XML。编译之后，这些标签会变成原生的 JavaScript DOM 创建代码。

### 一个容易踩的坑：为什么是 `className` 而不是 `class`？

你可能会注意到，在 HTML 里我们写 `<div class="container">`，但在 React 里写的是 `<div className="container">`。

原因很简单：**`class` 在 JavaScript 里是保留关键字**（用于声明类），而 React 组件是在 JS 函数里写 JSX。如果你写了 `class="container"`，JavaScript 引擎会认为你要声明一个 OOP 类，而不是给 HTML 元素指定样式类名。所以 React 用了 `className` 来避开这个冲突。

这只是一个小细节，但它揭示了 React 的设计哲学：**能不发明新概念就不发明。** `className` 直接对应原生 DOM 的 `element.className` 属性，对熟悉原生 JavaScript 的人来说没有额外学习成本。

### Tailwind CSS：你几乎不再需要写 CSS

如果说传统 CSS 是「用汇编语言写样式」，那 Tailwind CSS 就是「用高级语言写样式」。

**比喻时间：**

想象你要装修一面墙。传统 CSS 的做法是：
1. 给这面墙起个名字（选择器，比如 `.my-wall`）
2. 写一张详细的装修清单（CSS rules）：「颜色：白色；宽度：100%；高度：200px；圆角：8px；阴影：...」
3. 把这个名字贴到墙上

Tailwind 的做法是：**直接把装修要求写在墙上。** 你不需要起名字，不需要写选择器，不需要在 CSS 文件和 HTML 文件之间来回跳转。你直接在 HTML 标签上写 `bg-white w-full h-[200px] rounded-lg shadow-md`——每一个类名都是一个原子的样式声明，像英语单词一样好读。

它的底层原理很聪明：Tailwind 是一个 Vite 插件，在编译时会扫描你代码里用到的所有原子类名，然后把对应的 CSS 规则提取出来，注入到最终代码里。你没用到的样式，一行都不会出现在产物里。

**这就是为什么 Tailwind 成为了「Vibe Coding UI」的基本构成——它特别适合自然语言编程。** 你对 AI 说「给我一个蓝色圆角按钮」，AI 大概率会生成 `bg-blue-500 rounded-lg px-4 py-2`，因为这种原子类名的组合方式，就像是在用高度语义化的英语描述样式，而不是在写底层的 key:value 规则。

---

## 金字塔第三层：把理论变成代码——逐行拆解项目实现

### 第一步：搭建工程骨架

```bash
# React + TypeScript + ESLint 一键创建
npm create vite@latest webGPU-demo -- --template react-ts
```

为什么要配 ESLint？把它想象成一个严格的代码管家——你的团队可能有 10 个人，每个人写代码的习惯不一样。有人用双引号，有人用单引号；有人加分号，有人不加。没有约束的话，代码仓库最终会变成一锅大杂烩，后来的人根本不敢改。ESLint 强制执行一套统一的代码风格（比如这个项目里引号、分号的规则），让 10 个人的代码看起来像一个人写的。

### 第二步：用数据状态驱动界面——React Hooks 的魔法

这是 React 最关键的心智模型转变。以前我们用 jQuery 写界面，思维模式是：「当用户点击按钮 → 找到那个 DOM 元素 → 修改它的内容」。这叫**命令式编程**——你告诉计算机每一步该做什么。

React 的思维模式是：「我声明一个数据状态，界面就是这个状态的映射。状态变了，界面自动跟着变。」这叫**声明式编程**——你只声明「界面应该长什么样」，React 负责让它发生。

用川剧变脸来比喻：**数据就是演员的脸谱，状态就是当前戴的是哪张脸谱。换一张脸谱，观众看到的脸就变了——你不需要手动去「修改观众眼睛里看到的东西」。**

来看代码：

```tsx
// useState 返回一对值：[当前状态, 修改状态的函数]
const [status, setStatus] = useState(null);
//      ↑        ↑              ↑
//    当前值   改值函数      初始值(null = 还没开始)

const [loadingMessage, setLoadingMessage] = useState("开始加载");
const [error, _setError] = useState(null);
```

`useState` 是 React 最核心的 Hook。它做了什么？它在 React 内部注册了一个「响应式数据节点」。当你调用 `setStatus('loading')` 时，React 会：
1. 更新这个节点的值
2. 自动重新执行组件函数
3. 自动对比新旧界面差异
4. 自动更新浏览器里需要改变的那部分 DOM

你一行 DOM 操作代码都不需要写。这就是「数据驱动视图」。

### 第三步：WebGPU 检测——一句代码判断浏览器的能力

```tsx
const IS_WEBGPU_AVAILABLE = !!(navigator as any).gpu;
```

这行代码可能看起来有点奇怪，拆开来看就清楚了：

- `navigator.gpu`：如果浏览器支持 WebGPU，这个属性存在，返回一个 GPU 对象；如果不支持，返回 `undefined`。
- 第一个 `!`：取反。`!undefined` → `true`，`!GPU对象` → `false`。
- 第二个 `!`：再取反。`!true` → `false`，`!false` → `true`。

**双重否定等于肯定。** 无论 `navigator.gpu` 返回的是对象还是 `undefined`，经过 `!!` 之后，最终一定是一个干净的布尔值 `true` 或 `false`。这是一个 JavaScript 里非常常见的小技巧。

如果浏览器不支持 WebGPU，组件直接渲染一行提示：「您的浏览器还不支持 WebGPU」。如果支持，就展示完整的 AI 加载界面。**数据状态直接决定了界面渲染哪条分支——这就是 React 条件渲染的力量。**

### 第四步：`useEffect`——组件生命周期的「副作用管家」

```tsx
useEffect(() => {
  console.log('组件已经挂载完成');
}, []);
```

`useEffect` 的名字听起来有点学术，但你把它理解为「**在组件挂载到页面上之后，附带做什么事情**」就很好懂了。

第二个参数 `[]`（空数组）表示：这个副作用只在组件第一次出现时执行一次。如果填了变量（比如 `[status]`），那就是「当 status 变化时，重新执行副作用」。

常见的副作用包括：发起网络请求、设置定时器、监听浏览器事件、操作本地存储等——总之，跟「渲染界面」无关，但组件运行必需的那些事。

### 第五步：React 合成事件——`onClick` 的背后

当你写 `<button onClick={handler}>` 时，你可能以为这就是原生的鼠标点击事件。实际上，React 在底层做了一层封装，叫做**合成事件（SyntheticEvent）**。

来看一段 DOM 标准演进的小历史，这会帮你理解 React 的设计选择：

| DOM 级别 | 事件绑定方式 | 时代背景 |
|---------|-----------|--------|
| DOM 0 级 | `<button onclick="handler()">` | 上古时代，HTML、CSS、JS 全部耦合在一起写在标签上 |
| DOM 1 级 | — | 这个版本没有更新事件相关内容 |
| DOM 2 级 | `element.addEventListener('click', handler)` | 模块化思想崛起，JS 和 HTML 彻底分离 |

React 的设计者显然有「代码洁癖」。Vue 的做法是发明一个新语法 `@click`，而 React 说：「何必呢？原生 JS 里早就有 `onclick` 这个概念了，我把它改成驼峰式 `onClick`，熟悉 JS 的人一看就懂。」

但 React 的 `onClick` 背后并不是原生的 `click` 事件，而是 React 自己实现的**合成事件系统**。这样做的好处是：
- **跨浏览器兼容**：不同浏览器的事件行为可能不同，React 帮你抹平了差异。
- **性能优化**：React 使用事件委托机制，不会在每个元素上单独绑定事件，而是在顶层统一管理。
- **与组件生命周期协调**：组件卸载时自动清理事件绑定，不会造成内存泄漏。

### 第六步：封装进度条组件——抽离独立的、可复用的业务模块

看完整的 Progress 组件代码：

```tsx
interface ProgressProps {
  text: string;      // 文件名，比如 "model.onnx"
  progress: number;  // 当前进度 0-100
  total: number;     // 文件总大小（字节）
}

function Progress({ text, progress, total }: ProgressProps) {
  // 把字节数格式化为人类可读的大小
  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${bytes} B`;
  };

  return (
    <div className="mb-2">
      <div className="flex justify-between text-sm mb-1">
        <span>{text}</span>
        <span>{progress}% ({formatSize(total)})</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default Progress;
```

来拆解这个组件的每一层：

1. **TypeScript 接口（interface）** 定义了组件的「合同」——使用这个组件时必须传入哪些数据，每个数据是什么类型。如果有人传了错误的类型，编辑器会在编译时就标红，而不是等到浏览器里才崩溃。

2. **`formatSize` 工具函数** 把 `34353543453` 这样的字节数变成 `"31.99 GB"` 这样人类一眼能看懂的文本。这是组件内部的「私有方法」，外界不需要知道它的存在。

3. **Tailwind 原子类** 构成了整个 UI：
   - `w-full` = 宽度 100%
   - `bg-gray-200` = 灰色背景（未完成部分）
   - `rounded-full` = 完全圆角（胶囊形状）
   - `h-2` = 高度 2 单位（8px）
   - `transition-all duration-300` = 所有属性变化时都有 300ms 的过渡动画
   
4. **内联 style** 用 `width: ${progress}%` 动态控制蓝色进度条的宽度。`progress` 从 0 变到 100，进度条就从 0% 宽变到 100% 宽。`transition-all` 让这个变化是平滑的，而不是瞬间跳过去的。

在父组件 App 里，用 `map` 循环渲染多个进度条：

```tsx
{
  progressItems.map(({ text, percentage, total }, i) => (
    <Progress key={i} text={text} progress={percentage} total={total} />
  ))
}
```

**这就是组件树的本质。** 传统的前端开发，你的心智模型是「DOM 树」——一个页面由一层层的 div、p、span 嵌套而成。React 把心智模型提升到了「组件树」——整个页面是由组件嵌套而成的：

```
App
├── 标题区域（内联）
├── Load Model 按钮（内联）
└── 加载区域（条件渲染）
    ├── Progress (model.onnx)
    └── Progress (model2.onnx)
```

有了组件树，你一眼就能看出页面的组件化程度和粒度。**组件成为了开发的最小单元**——团队里不同的人可以并行开发不同的组件，组件之间通过明确的 interface（TypeScript 类型）来对接。好协作、好复用、好维护。

### 第七步：模拟模型下载——用异步循环驱动进度更新

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

这段代码模拟了从 HuggingFace 社区下载两个模型文件的进度。在实际项目中，这部分会被替换为 Transformers.js 的真实模型加载逻辑——它会通过 ONNX Runtime Web 加载 DeepSeek-R1 的蒸馏版本（基于 Qwen 架构，15 亿参数），然后利用 WebGPU 在浏览器本地进行推理。

注意一个重要的细节：`setProgressItems([...newProgress])` 为什么要用展开运算符创建一个新数组？

这是 React 的响应式更新机制要求的。React 通过比较「新旧引用是否相同」来判断状态是否变化。如果你直接 `newProgress[0].percentage = step` 然后 `setProgressItems(newProgress)`，React 发现引用没变，就不会触发重新渲染。**必须传入一个新数组（新引用），React 才会认为状态发生了变化，从而更新界面。**

---

## 金字塔塔尖：回看全局——我们到底做了什么？

回到开头那句结论：「**我们不再需要把数据发给远程服务器才能用 AI。**」

这一个项目串联起了前端开发最核心的几个概念：

| 层次 | 技术 | 解决的问题 |
|-----|------|----------|
| **AI 能力** | WebGPU + Transformers.js + ONNX Runtime Web | 让浏览器拥有运行大模型的算力，数据不出设备 |
| **工程架构** | React + TypeScript | 用组件化和类型安全搭建可维护的大型前端项目 |
| **样式方案** | Tailwind CSS | 抛弃手写 CSS，用语义化原子类极速构建 UI |
| **数据管理** | React Hooks (useState, useEffect) | 用声明式数据驱动界面，告别手动 DOM 操作 |
| **组件设计** | 接口定义 + 函数封装 | 把独立的业务模块抽成可复用的组件，搭积木式开发 |

**从前端新手的视角来看，这个项目是一条陡峭但高效的学习曲线。** 你同时在学 React 的组件思想、TypeScript 的类型约束、Tailwind 的原子化 CSS、Hooks 的响应式数据流、以及 WebGPU 的浏览器端 AI 推理。每一样都是一块积木，最终拼成了一个能在浏览器里本地运行推理大模型的应用。

**从技术趋势的视角来看，端侧 AI 是不可逆的方向。** 贵的对面是免费，不安全的对面是隐私，需要网络的对面是离线可用。当这三重推力叠加在一起，「把 AI 装进浏览器」就不再是炫技，而是必然。

---

*本文涵盖了从项目动机、技术选型、到逐行代码解析的完整思考过程。核心代码位于 `webGPU-demo/src/` 目录下，包括 App.tsx（主组件）、components/progress.tsx（进度条组件）、main.tsx（入口文件）等。*

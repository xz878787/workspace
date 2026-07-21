# 从零构建 DeepSeek R1 WebGPU 浏览器推理应用：一次现代前端工程与端侧 AI 的深度碰撞

## 顶层结论

**仅用四个核心文件——`index.html`、`main.tsx`、`App.tsx`、`index.css`，我们构建了一个在浏览器中本地运行 15 亿参数推理模型的 WebGPU 应用。这件事的本质意义是：浏览器正在成为 AI 推理的第一方运行时，而现代前端工程体系（Vite + React + TypeScript + TailwindCSS）恰好为这件事提供了最低门槛的实现路径。**

下面自顶向下，分层拆解。

---

## 一、这个项目在做什么？——readme.md 开篇的"超燃"定位

`readme.md` 的第一句话就定调了：

> 简历中的超燃项目，将覆盖以下技能。

这个项目的定位从一开始就不是"练手 Demo"，而是**简历中能打的那一页**。它能覆盖的技能点，就是下面要展开的全部内容。

### 1.1 端侧模型：为什么放着 API 不用？

`readme.md` 给出了最直白的对比：

> 有别于 OpenAI\DeepSeek API 调用，LLM 在远程，和调用客户端不在一起。

两个结构性痛点随之而来：

**贵。** 远程 API 按 token 计费，每次推理都要付费。应用面向海量用户时，成本不可控。

**不安全。** `readme.md` 的表述是：**"context 会随着请求发送到"** ——用户的对话历史、文档内容、代码片段，每一次 HTTP 请求都会离开你的设备。无论服务商如何承诺，数据离手的那一刻，控制权就不再属于你。

出路只有一条——**端侧模型**。`readme.md` 接着说：

> ollama 本地开源模型部署，在用户端，端侧模型。手机端，汽车端，Agent 任务划分的。开源小参数模型就能完成这些任务。浏览器端，随时下载，随时使用。webGPU。

这段话说清了端侧模型的完整版图：Ollama 解决桌面端本地部署 → 手机端和汽车端跑小参数模型做 Agent 任务 → **浏览器 + WebGPU 是最轻量的形态——打开网页，模型下载到本地，GPU 推理，随时可用，用完即走。**

这个项目的核心命题由此确立：**用一个 15 亿参数的蒸馏模型（DeepSeek-R1-Distill-Qwen-1.5B-ONNX），在浏览器里借助 WebGPU 实现本地推理。**

---

## 二、技术选型：为什么这四样东西凑在一起？

### 2.1 React + TypeScript：AI 时代大型项目的首选

`readme.md` 的判断非常明确：

> React + TS——AI 时代的大型项目首选前端技术。

为什么是 React 而不是 Vue？`readme.md` 给出了三个层层递进的理由：

**第一，"react 比 vue 难入门"但天花板更高。** Vue 的 `template/script/style` 三明治结构对新手友好——一个 `.vue` 文件里模板、逻辑、样式各占一块。`readme.md` 的评价是"vue 好入门"。但 React 的思路不同：

> 封装一个组件（函数），函数就是组件。函数返回 html 就是组件。函数 return 之前 js 部分，css？引入样式。

HTML、CSS、JS 不再按"类型"分文件，而是按"功能"封装在一个函数里。`readme.md` 称之为**"搭积木的方式搭建页面"**——每个积木（组件）是由一组 HTML、CSS、JS 组合在一起的功能单位。

**第二，"AI 训练代码 React 的偏多"。** 开源社区的训练数据和代码模板以 React 为主，这意味着 Copilot、Cursor 等 AI 辅助编码工具在 React 项目中的补全质量更好。

**第三，"大型项目"。** React 的响应式数据绑定是范式级别的——数据改变，界面自动更新。开发者不关心 `appendChild`、`innerHTML`，只管理状态。

### 2.2 项目初始化：ESLint 的约束意义

`readme.md` 在"新建项目"一节中强调了初始化步骤：

> react + ts + eslint（代码约束，大公司必备，代码风格一致）
> ''  "" ;  eslint 负责约束代码风格

`''` 还是 `""`？加不加 `;`？这些问题在多人协作中会被无限放大。代码风格不一致，code review 就无从谈起——reviewer 的注意力被格式噪音消耗，逻辑问题反而被掩盖。ESLint 的终极价值是**让整个团队的代码看起来像同一个人写的**。

`tsconfig.json` 采用项目引用的分层策略——`tsconfig.app.json` 和 `tsconfig.node.json` 分离前端代码和构建配置。对于一个涉及 WebGPU API（`navigator.gpu`）、模型加载状态机、多类型错误对象的应用，类型安全不是可选项，是刚需。

### 2.3 Vite：HMR 让重和轻解耦

对于一个需要加载数 GB 级 ONNX 模型文件的应用，开发体验直接决定迭代效率。Vite 的 HMR（热模块替换）意味着修改 `App.tsx` 中的任何一行 UI，浏览器毫秒级反馈——不需要重新加载页面，不需要重新拉取模型。**模型加载是重的，UI 迭代是轻的，HMR 让你将二者彻底解耦。**

`vite.config.ts` 十行不到：

```ts
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

两个插件，零配置启动。`package.json` 的 `scripts`——`dev`、`build`、`lint`、`preview`——四条命令覆盖全生命周期。

---

## 三、TailwindCSS：从"写 CSS"到"写类名"的范式转移

### 3.1 安装与核心理念

`readme.md` 直接给出安装命令：

> npm install tailwindcss @tailwindcss/vite

然后给出了 TailwindCSS 的定位：

> 几乎不再需要写 css，原子 css 类。

要理解这句话的分量，需要先理解传统 CSS 为什么低效。传统模式下，你的心智负担是：想 class 名 → 写选择器 → 写 rules（`key: value;`）→ 在 HTML 中引用 → 在两个文件之间反复跳。`readme.md` 的比喻非常精准：

> 如果说以前的 css 选择器，rules（key:value;）太底层，太低效 → 二进制。写类名就好。

**"二进制"这个类比是理解 TailwindCSS 的钥匙。** 手写 `display: flex` 就像手写 `01100100`——你在用底层指令描述意图，而不是直接表达意图。TailwindCSS 做的事情是把 CSS rules 封装成语义化的原子类名：`flex` = `display: flex`，`text-center` = `text-align: center`。你不再写底层 rules，而是组合类名。

### 3.2 TailwindCSS 的运行原理

`readme.md` 说清楚了它是怎么工作的：

> 不是原生 css。原子类 css 框架，提供一堆的 css 类名（原子类）。不用写 css 了，选择器、css rules 太低效了。vite 插件就可以使用了，将我们声明的类名他的样式提取出来，加到代码里。

关键链路：**你在 JSX 的 `className` 中声明类名 → Vite 插件在构建时扫描源码 → 提取对应样式 → 注入最终 CSS 输出。** 你声明了什么类名，构建产物里就有什么样式，不多不少。

`readme.md` 进一步指出了这套体系的优势：

> 原子类名（英文单词），简单，语义化很好，特别适合自然语义编程。

读 `flex items-center justify-between` 就能在脑中还原出布局。LLM 对语义化命名远好于对自定义 CSS 的理解——所以 `readme.md` 断言：

> tailwindcss 已经成为 vibe UI 的基本构成。

### 3.3 `className` 为什么不是 `class`？

`readme.md` 给出了明确答案：

> className？类名 class。class js 里的类名（OOP）关键字，函数里面写 JSX，所以不能用 class，理解为你要声明一个 js 类。className 没有这个问题。

JSX 本质是 JavaScript——你在 `()` 里写的 `<div>` 标签，最终被编译为 `React.createElement('div', ...)` 调用。在 JS 里写 `class="container"`，编译器认为你在声明一个 JavaScript 类。`className` 是 React 对 HTML `class` 属性的 JSX 映射——绕开关键字冲突，语义完全等价。

### 3.4 `index.css`——一行代码的设计系统

```css
@import "tailwindcss";
```

就一行。TailwindCSS v4 的零配置设计哲学——对比 v3 需要 `tailwind.config.js` 中配置 `content` 路径、主题扩展、插件注册，v4 的 `@import "tailwindcss"` 做到了"导入即配置"。CSS 文件本身是唯一的配置入口。

**这对 AI 应用 UI 的意义：** AI Demo 的界面变化极快——今天加 loading 进度条，明天换错误提示样式。传统方案下每次都要在样式文件和组件之间切换。TailwindCSS 将所有样式决策内联在 JSX 的 `className` 中——**你看着组件代码时，同时看到了它的外观和行为。**

---

## 四、JSX：在 JavaScript 里写 HTML

在进入 `App.tsx` 之前，必须先说清楚 JSX。`readme.md` 给出了完整定义：

> JSX 是 React 专用语法（模板）。能在 JS 代码里直接写 HTML 标签，编译后——JSX：JavaScript 的类 HTML 语法糖，用于在 React 中直观编写页面结构，会编译为原生 JS 创建 DOM。

> react 最骄傲的一大特性之一，非常方便表达 UI 界面。javascript with xml。`<div></div>` html 特有的 XML。

JSX = JavaScript + XML。`<div></div>` 是 XML 标签语法，现在可以出现在 `.tsx` 文件的函数体里：

```tsx
function App() {
  return (
    <div className="container">
      <h1>Hello</h1>
    </div>
  )
}
```

编译后变成原生 JS 的 DOM 创建操作。JSX 的意义不是少写代码，而是**页面结构和业务逻辑在同一个上下文里**——不需要在 `.html` 和 `.js` 之间跳。对于 WebGPU 这种需要大量状态管理的场景，JSX 的条件渲染 `{error && <ErrorUI />}` 让状态到 UI 的映射变得异常简洁——你写的是"当 error 存在时渲染这段"，而不是"找到那个 div，改它的 display 属性"。

---

## 五、应用骨架：`main.tsx` 的初始化逻辑

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

五行代码，三个关键决策：

**第一，`StrictMode` 的启用。** React 19 的 StrictMode 在开发环境下会双重调用组件函数和 effect，刻意暴露潜在的副作用问题。模型加载是典型的副作用密集型操作（异步请求、GPU 设备获取、内存分配），StrictMode 帮助开发者在早期就发现状态管理中的不纯逻辑。

**第二，CSS 导入的时机。** `import './index.css'` 放在 `App` 组件导入之前。CSS 的加载顺序影响层叠优先级——TailwindCSS 的 utility 类需要作为基础层最先注入。

**第三，`createRoot` + `getElementById('root')!` 的非空断言。** `!` 是对"HTML 结构契约"的信任——`root` 节点是 `index.html` 模板的固定部分，不存在运行时动态移除的场景。这是 TypeScript 中有依据的断言：不是盲目绕过类型检查，而是基于不变量的合理推断。

---

## 六、核心引擎：`App.tsx` 的六层设计解构

这是整个项目的灵魂。我将 `App.tsx` 从外到内拆为六个层次，每一层关注一个独立的关注点。

### 第一层：组件化思想——React 的心智模型

文件开头的注释，把 `readme.md` 中 React 的核心价值观浓缩成了四行：

```tsx
// 现代前端开发框架
// .vue->tsx 组件化 typescript+ jsx
// 响应式
// 数据绑定
// 函数封装特性 组件的html,css ,js 封成一个组件
```

这正是 `readme.md` 说的"搭积木的方式搭建页面"。四条注释与 `readme.md` 完全对应：
- **组件化**：从一个 `.vue` 文件到 `.tsx` 函数——函数返回 JSX 就是组件。函数 return 之前是 JS 逻辑，`className` 注入样式。一个功能单位 = 一个组件 = 一个函数。
- **响应式 + 数据绑定**：数据改变 → 界面自动更新。开发者只管理数据，React 负责 DOM。这是区别于命令式 UI 编程的核心范式转移。

### 第二层：状态体系——应用的数据骨架

```tsx
const [status, setStatus] = useState(null);
const [error, setError] = useState<Error | null>(null);
const [loadingMessage, setLoadingMessage] = useState('出错了');
const [progress, setProgressItem] = useState([{
  file: 'model.onnx',
  progress: 0,
  total: 34353543453
}])
```

四个 `useState`，构成了一个完整的状态机：

| 状态变量 | 类型 | 作用 | 初始值含义 |
|---------|------|------|-----------|
| `status` | `null \| string` | 应用生命周期 | `null` = 未初始化 |
| `error` | `Error \| null` | 异常捕获 | `null` = 无错误 |
| `loadingMessage` | `string` | 用户提示文案 | `'出错了'` 作为默认兜底 |
| `progress` | `Array<{file, progress, total}>` | 模型下载进度 | 预填 `model.onnx` 的单文件追踪 |

**这里的设计巧思：**
- `loadingMessage` 初始值设为 `'出错了'` 而非 `'加载中...'`。这是防御性编程——如果某个代码路径错误地直接展示了 `loadingMessage` 而没有先更新它，用户至少看到的是一个有意义的错误提示而非误导性的"加载中"。
- `progress` 用数组而非单个对象，预留了未来多文件加载的扩展空间（ONNX 模型可能包含多个权重分片）。
- `status` 用 `null` 作为"尚未初始化"的哨兵值。`null` 在 React 中不会渲染任何内容，天然适合"初始化前不展示"的场景。

### 第三层：WebGPU 能力检测——应用的技术可行性分水岭

```tsx
const IS_WEBGPU_AVAILABLE = !!(navigator as any).gpu;
```

这一行是整个项目的**技术可行性分水岭**。拆解三层含义：

1. **`(navigator as any)`**：TypeScript 类型断言。`navigator.gpu` 尚未进入 TypeScript 的标准 DOM 类型定义。随着 WebGPU 标准落地，这行断言终将被移除。
2. **`.gpu`**：WebGPU API 的入口对象。浏览器支持 WebGPU 则返回 `GPU` 对象，否则返回 `undefined`。
3. **`!!` 双非操作符**：将 `GPU对象 | undefined` 强制转为 `true | false`。JavaScript 中最简洁的真值归一化写法。

这个布尔值决定了后续整个渲染路径的分叉。不支持 WebGPU 的浏览器直接看到降级提示，支持 WebGPU 的浏览器进入完整的应用界面。这是一种优雅的**渐进增强**策略——不支持的浏览器不会崩溃，只是功能不可用。

这正是 `readme.md` 中端侧模型愿景的第一道技术关卡：**浏览器支持 WebGPU，推理才能跑在 GPU 上；不支持，一切免谈。** 这一行代码是整个项目"可行性"的守卫。

### 第四层：生命周期管理——副作用与状态流转

```tsx
useEffect(() => {
  console.log('组件已经挂载完成')
  setStatus('ready');
}, [])
```

`useEffect` 的第二个参数是空数组 `[]`，意味着这个 effect **只在组件首次挂载后执行一次**。

执行时序：
1. 组件函数第一次执行 → JSX 渲染到 DOM
2. DOM 挂载完成 → `useEffect` 回调触发
3. `setStatus('ready')` → 触发重新渲染，UI 进入 `ready` 状态

`console.log('组件函数执行')` 在函数体中每次渲染都会打印，而 `console.log('组件已经挂载完成')` 只在挂载后打印一次。两者对照，清晰展示了 React 的"渲染"和"挂载"是两个不同的阶段。

注释中被注释掉的 `setTimeout` 代码：
```tsx
// setTimeout(()=>{
//   setStatus('loading');
// },2000)
```
透露了开发者的演进思路——先手动延迟模拟 loading 状态验证 UI 表现，后续接入真实的模型加载逻辑时，直接用真实的异步回调替换这个 setTimeout。这是一种典型的"自底向上"开发策略：**先验证 UI 状态切换逻辑，再接入真实数据源。**

### 第五层：条件渲染——两套 UI 的分流架构

```tsx
return (
  IS_WEBGPU_AVAILABLE ? (
    <div className="flex flex-col h-screen mx-auto items-center justify-end text-gray-800 items-center">
      {/* 完整应用界面 */}
    </div>
  ) : (
    <div>您的浏览器还不支持WebGPU</div>
  )
)
```

顶层三元表达式实现了两种互斥的渲染路径。这不是简单的"if-else"，而是 **React 声明式渲染的核心模式**——数据（`IS_WEBGPU_AVAILABLE`）驱动界面，没有任何手动 DOM 操作。

**完整应用界面的 TailwindCSS class 解析：**

```
flex flex-col          → 弹性布局，主轴为垂直方向
h-screen               → 高度 = 100vh（占满整个视口）
mx-auto                → 水平居中
items-center           → 子元素交叉轴居中
justify-end            → 子元素主轴末端对齐（靠底部）
text-gray-800          → 文字颜色
```

这里 `items-center` 出现了**两次**——外层容器和内部某个元素都设置了它，属于样式冗余。尾部多余的 `items-center` 不会报错但也不会生效（已被外层覆盖），反映了开发过程中样式调试留下的痕迹。在实际项目中，这种冗余应该被清理。

### 第六层：内容区——模型信息架构与错误处理

**标题层：**
```tsx
<h1 className="text-4xl font-bold mb-1">Deepseek R1 WebGPU Demo</h1>
<h1 className="text-2xl font-bold mb-1">Deepseek R1 WebGPU模型</h1>
```

两个 `h1` 标签在语义化 HTML 中是反模式——一个页面应该只有一个 `h1`。但 `text-4xl` 和 `text-2xl` 的字号落差在视觉上实现了清晰的层级区分——实用主义优先于规范。

**模型来源层：**
```tsx
<a href="https://huggingface.co/onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX">
  DeepSeek-R1-Distill-Qwen-1.5B
</a>
```

这条链路被注释精确标注：

> 蒸馏Qwen Reasoning 推理模型
> HuggingFace 抱抱脸 全球最大的开源模型社区

完整的技术栈链路为：
**DeepSeek R1（原始大模型）→ 蒸馏（Distill）→ Qwen 1.5B 架构（轻量化）→ ONNX 格式导出（跨平台）→ Transformers.js 加载（浏览器端）→ ONNX Runtime Web 推理（WebGPU 加速）**

每一步都是一次"为浏览器推理让路"的妥协与优化。这正是 `readme.md` 中端侧模型的实践路径——从大模型出发，经过蒸馏、量化、格式转换，最终塞进浏览器的沙箱。每一步都在牺牲能力换取可达性，但最终换来的结果是：一个 URL 就能启动的 AI 推理。

**错误处理层：**
```tsx
{error && (
  <div className="text-red-500 text-center mb-2">
    <p className="mb-1">Unable to load the model due to the following error:</p>
    <p className="text-sm">{error.message}</p>
  </div>
)}
```

React 条件渲染的经典模式——`error && (...)` 短路求值。`error` 为 `null` 时，整块不渲染；`error` 有值时，红色错误消息展示。`text-red-500`、`text-center`、`mb-2` 三个 utility 类完成了错误提示的全部样式表达，无需一行自定义 CSS——这就是 TailwindCSS"写类名就好"在真实场景中的力量。

---

## 七、架构全景：四个文件如何构成一个完整系统

回到金字塔顶端，四个文件的分工体系如下：

```
index.html          →  运行时容器（提供 root 挂载点 + 模块入口）
    │
main.tsx            →  应用引导层（CSS 注入 + React 初始化 + StrictMode）
    │
index.css           →  设计系统层（TailwindCSS 原子类体系）
    │
App.tsx             →  业务逻辑层（状态管理 + WebGPU 检测 + UI 渲染 + 错误处理）
```

**关键洞察：每个文件只做一件事，且彼此之间的依赖关系是单向的。**

- `index.html` 不关心谁用了 `root` 节点
- `main.tsx` 不关心 `App` 内部的状态逻辑
- `index.css` 不关心哪个组件用了哪些 class
- `App.tsx` 是唯一承载业务语义的地方

这种单向依赖的架构意味着：你可以替换 `App.tsx` 为任何其他应用，`main.tsx` 和 `index.html` 完全不需要改动。**关注点分离不是口号，而是体现在文件职责的物理边界上。**

---

## 八、思考延伸：这个 Demo 的技术边界与未来

这个项目目前是一个 **WebGPU 能力展示 + UI 骨架搭建** 的阶段。代码中已经预留了扩展接口：

1. **`progress` 状态数组** → 后续接入真实的模型下载进度回调
2. **被注释的 `setTimeout`** → 替换为 Transformers.js 的异步 pipeline
3. **`error` 状态** → 捕获模型加载、GPU 内存不足等多种异常场景
4. **`IS_WEBGPU_AVAILABLE`** → 未来可以扩展为 WebGPU → WebNN → WASM 的多级回退策略

当这些接口被填满时，这个四文件项目将从 Demo 进化为一个**完整的浏览器端 AI 推理应用**——所有计算都在用户的 GPU 上完成，所有数据都不离开浏览器。

回到 `readme.md` 开篇那句话——**"简历中的超燃项目"。** 它的"超燃"不在于代码行数多，而在于它碰到了一个真正前沿的交叉点：用 React + Vite + TailwindCSS 这组现代前端工具链，把 15 亿参数的 AI 模型塞进浏览器的 WebGPU 运行时里。贵和不安全，是远程 API 的结构性问题。唯一的出路是把模型搬到用户设备上——Ollama 解决了桌面端，而 WebGPU + 浏览器解决的是最轻量的那一下：**一个链接，零安装，即开即用。**

**浏览器，正在成为下一个模型推理运行时。而 React + Vite + WebGPU，是这个未来最简洁的入场券。**

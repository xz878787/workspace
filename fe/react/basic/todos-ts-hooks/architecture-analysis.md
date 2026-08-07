# 把"想逻辑"和"画 UI"拆开——一个自定义 Hook 如何撑起 React 应用的清晰架构

> 把所有业务逻辑塞进一个 `useTodos` Hook，让组件只负责渲染——10 个文件讲透这个设计思路。

---

## 一、山顶：一句话说清楚这个项目在做什么

**这个项目用"类型定义 → 状态逻辑 → UI组件"三层分离的方式，构建一个待办事项应用。核心创新点在于：把所有业务逻辑抽进一个自定义 Hook（`useTodos`），让组件只负责"画 UI"，不负责"想逻辑"。**

如果你只带走一句话，就是上面这句。下面我们逐层展开。

---

## 二、山腰：四层架构，逐层支撑

金字塔的第二层，我把它拆成四个**逻辑分组**，每一组回答一个问题。

### 第一组：地基——类型系统（`src/types/todo.ts`）

**类比：盖房子之前先画图纸。** 在写任何 UI 代码之前，这个项目先定义"Todo 长什么样"。

```typescript
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export type FilterType = 'all' | 'completed' | 'uncompleted';
```

这里有三个值得品的设计决策：

1. **用 `interface` 而不是 `type` 定义 Todo**——注释里写了"interface 申请不了简单数据类型"，但更深层的原因是：`interface` 描述的是"对象的结构"，语义上更适合定义一个实体；而 `type` 更适合联合类型（如 `FilterType`）。这是 TypeScript 中"用对的工具做对的事"的体现。
2. **`id` 用 `string` 而不是 `number`**——因为后面用 `Date.now().toString()` 生成 ID。这个选择牺牲了一点性能（字符串比较比数字慢），换来了唯一性保证（时间戳 + 类型转换），对 Todo 这种规模的场景完全合理。
3. **`FilterType` 用了字面量联合类型**——`'all' | 'completed' | 'uncompleted'`。这意味着如果你在代码里写 `setFilter('archived')`，TypeScript 会直接报错，编译阶段就拦住了 bug。这就是"让编译器帮你检查逻辑"的典型实践。

> **思考点**：很多初学者会跳过类型定义直接写组件，结果是一个 `todo` 对象散落在 5 个文件里，每个文件都对它有不同的假设。类型文件就是把"共识"提前写下来，让团队（哪怕是未来的你）不至于猜来猜去。

---

### 第二组：大脑——自定义 Hook（`src/hooks/useTodos.ts`）

**类比：如果把组件比作人体器官，Hook 就是大脑。** 器官负责执行（展示 UI），大脑负责决策（管理状态和逻辑）。

```typescript
export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  // ...addTodo, toggleTodo, deleteTodo, clearCompleted
  return { todos, filter, addTodo, toggleTodo, deleteTodo, clearCompleted };
}
```

这个 Hook 的设计有四个值得深入的点：

#### 2.1 状态更新的"不可变模式"

每个操作都用**函数式更新**（`setTodos(prev => ...)`）：

```typescript
const toggleTodo = (id: string) => {
  setTodos(prev =>
    prev.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    )
  );
};
```

**为什么不直接 `item.completed = !item.completed`？** 因为 React 的渲染机制依赖**引用对比**（`prevTodos !== newTodos`）。如果你直接修改原对象，React 会说"嗯，引用还是同一个，不用重新渲染"，然后你的 UI 就不会更新。这就是 React 不可变性的核心原因——**不是哲学偏好，是渲染机制的技术约束**。

新手的直觉是"改一下不就完了吗"，但正是这个直觉导致了最多的 React bug。

#### 2.2 `filter` 状态定义了但还没用上

`filter` 存在，`FilterType` 也定义好了，但 `useTodos` 没有根据 filter 来筛选 todos。注释里被注释掉的 `filteredTodos` 函数说明作者意识到了这个缺口：

```typescript
// const filteredTodos = () => {
// }
```

**这是一个非常好的教学时刻**：Hook 暴露了 `filter` 但没有暴露筛选后的结果，意味着筛选逻辑要么还在设计中，要么打算放在组件层做。两种选择各有优劣——放 Hook 里更内聚，放组件里更灵活。这个留白恰好展示了架构决策中的权衡。

#### 2.3 `clearCompleted` 是一个批量操作

```typescript
const clearCompleted = () => {
  setTodos(prev => prev.filter(item => !item.completed));
};
```

注意它用 `filter` 而非逐个删除。这是**声明式编程**的思维：不说"删除第2个、删除第5个"，而是说"我要一个没有已完成项的列表"。声明式代码更不容易出错，因为你不需要手动维护"删了第2个之后，原来的第5个变成了第几个"这种索引偏移问题。

#### 2.4 返回值是对象而非数组

```typescript
return { todos, filter, addTodo, toggleTodo, deleteTodo, clearCompleted };
```

对比 `return [todos, filter, addTodo, ...]`，对象解构的好处是**使用时可以按需取用，且名字固定**：

```typescript
const { addTodo, toggleTodo } = useTodos(); // ✅ 顺序无关，一目了然
const [todos, , addTodo] = useTodos();       // ❌ 需要记住位置，不好维护
```

---

### 第三组：躯干——组件层（`src/component/`）

四个组件文件目前是**空壳**：`Todoinput.tsx`、`Todoitem.tsx`、`TodoList.tsx`、`TodoFilter.tsx`。

**这恰恰是架构先行的工作方式的证据。** 作者在写具体 UI 之前，已经明确了"我需要四个组件，分别负责输入、展示单条、展示列表、筛选"。这就像盖房子之前先把房间的墙立好——虽然还没装修，但空间划分已经清晰了。

从命名可以推断出组件树结构：

```
App
├── TodoInput    （输入框 + 添加按钮）
├── TodoFilter   （三个筛选项：全部/已完成/未完成）
└── TodoList     （列表容器）
    └── TodoItem × N  （每条 todo）
```

这是一个典型的**容器-展示组件模式**的雏形：`TodoList` 是容器，`TodoItem` 是纯展示。

---

### 第四组：入口——应用装配层（`App.tsx` + `main.tsx`）

`main.tsx` 是整个应用的**点火开关**：

```typescript
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

`StrictMode` 在开发模式下会**故意调用两次**某些函数（如 useState 的初始化函数、useEffect），目的是帮你暴露"副作用不纯"的问题。很多新手发现 `console.log` 打印了两次就以为是 bug，其实这是 React 在帮你做**压力测试**。

`App.tsx` 目前还是 Vite 的模板页面，这意味着作者正处在"基建完成，准备组装"的阶段。

---

## 三、山脚：数据流动全景图

把四层串起来，数据是怎么流动的？用一句话描述：

> **用户在 `TodoInput` 输入 → 调用 Hook 的 `addTodo` → Hook 内部 `setTodos` 更新状态 → React 检测到状态变化 → 重新渲染 `TodoList` → 每个 `TodoItem` 拿到最新的数据。**

这形成了一个**单向数据流**的闭环：

```
用户操作 → 组件事件 → Hook 方法 → setState → 组件重渲染 → 新的 UI
```

**为什么单向数据流重要？** 因为它让 bug 可追溯。如果数据可以双向流动（子组件直接改父组件状态），当出现"这条 todo 怎么莫名其妙被删了"的问题时，你需要在 N 个可能修改它的地方排查。单向流动意味着你只需要沿着箭头反向追溯，总能找到源头。

---

### 一个比喻收束全文

想象你在一个**餐厅**里：

| 角色 | 对应 | 职责 |
|------|------|------|
| 菜谱（类型定义） | `types/todo.ts` | 规定每道菜长什么样、有哪些属性 |
| 厨师长（Hook） | `hooks/useTodos.ts` | 掌握所有订单的状态，决定增删改查的逻辑 |
| 服务员（组件） | `component/*.tsx` | 接收顾客指令，传给后厨，再把结果展示给顾客 |
| 餐厅经理（App.tsx） | `App.tsx` | 把服务员安排到各自的位置，协调整个流程 |
| 餐厅大门（main.tsx） | `main.tsx` | 顾客（用户）进入的入口 |

顾客不需要知道后厨怎么运转，他只需要跟服务员说话。服务员不需要知道怎么炒菜，他只需要把需求传给厨师长。厨师长不需要知道菜端到哪桌，他只需要维护订单的状态。**每一层只管自己的事，这就是分层架构的本质。**

---

## 四、对这个项目的后续建议

作为代码审查的附带价值，如果你要继续完善这个项目：

1. **在 Hook 中实现 `filteredTodos`**——根据 `filter` 状态返回筛选后的列表，让筛选逻辑和状态在一起
2. **给组件注入 Hook**——在 `App.tsx` 中调用 `useTodos()`，把返回值通过 props 分发给各子组件
3. **考虑 `useReducer` 替代 `useState`**——当操作种类增多（add、toggle、delete、clear、edit），`useReducer` 会把状态变更逻辑集中到一个 reducer 函数里，比散落在多个 `setXxx` 调用中更易维护
4. **添加 localStorage 持久化**——刷新后数据丢失是 Todo 应用的经典痛点，可以在 Hook 中加 `useEffect` 做同步

---

> 总结：好的架构不是"写了很多代码之后重构出来的"，而是在写第一行代码之前，先把"类型定义在哪？状态放哪？组件怎么拆？"这三个问题想清楚。这个 Todo 项目就是一个很好的示范——文件不多，但每一层职责清晰，互不越界。

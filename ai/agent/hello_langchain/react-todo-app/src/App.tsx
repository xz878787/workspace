import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type Filter = 'all' | 'active' | 'completed'

type Todo = {
  id: string
  text: string
  completed: boolean
  createdAt: number
}

const STORAGE_KEY = 'mini-cursor-todos'

const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'active', label: '进行中' },
  { value: 'completed', label: '已完成' },
]

const initialTodos: Todo[] = [
  {
    id: 'seed-1',
    text: '运行 mini-cursor 生成 React 项目',
    completed: true,
    createdAt: Date.now() - 3000,
  },
  {
    id: 'seed-2',
    text: '把默认 Vite 页面改成 TodoList',
    completed: false,
    createdAt: Date.now() - 2000,
  },
  {
    id: 'seed-3',
    text: '验证添加、筛选、本地保存',
    completed: false,
    createdAt: Date.now() - 1000,
  },
]

function loadTodos() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? (JSON.parse(saved) as Todo[]) : initialTodos
  } catch {
    return initialTodos
  }
}

function App() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos)
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const activeCount = todos.filter((todo) => !todo.completed).length
  const completedCount = todos.length - activeCount
  const completionRate = todos.length
    ? Math.round((completedCount / todos.length) * 100)
    : 0

  const visibleTodos = useMemo(() => {
    if (filter === 'active') {
      return todos.filter((todo) => !todo.completed)
    }

    if (filter === 'completed') {
      return todos.filter((todo) => todo.completed)
    }

    return todos
  }, [filter, todos])

  const saveTodos = (nextTodos: Todo[]) => {
    setTodos(nextTodos)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTodos))
  }

  const addTodo = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const text = input.trim()

    if (!text) {
      return
    }

    saveTodos([
      {
        id: crypto.randomUUID(),
        text,
        completed: false,
        createdAt: Date.now(),
      },
      ...todos,
    ])
    setInput('')
  }

  const toggleTodo = (id: string) => {
    saveTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    )
  }

  const deleteTodo = (id: string) => {
    saveTodos(todos.filter((todo) => todo.id !== id))
  }

  const clearCompleted = () => {
    saveTodos(todos.filter((todo) => !todo.completed))
  }

  return (
    <main className="todo-shell">
      <section className="todo-panel">
        <div className="hero-copy">
          <span className="eyebrow">Mini Cursor Todo</span>
          <h1>今天的任务，清清楚楚。</h1>
          <p>添加待办、标记完成、按状态筛选，所有数据会自动保存在浏览器本地。</p>
        </div>

        <form className="todo-form" onSubmit={addTodo}>
          <input
            aria-label="输入新的待办"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="例如：完善 LangChain Agent 工具调用"
          />
          <button type="submit">添加</button>
        </form>

        <div className="stats-grid">
          <article>
            <strong>{todos.length}</strong>
            <span>全部任务</span>
          </article>
          <article>
            <strong>{activeCount}</strong>
            <span>进行中</span>
          </article>
          <article>
            <strong>{completionRate}%</strong>
            <span>完成率</span>
          </article>
        </div>

        <div className="toolbar">
          <div className="filter-tabs" aria-label="任务筛选">
            {filters.map((item) => (
              <button
                className={filter === item.value ? 'active' : ''}
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            className="ghost-button"
            type="button"
            onClick={clearCompleted}
            disabled={completedCount === 0}
          >
            清除已完成
          </button>
        </div>

        <ul className="todo-list">
          {visibleTodos.map((todo) => (
            <li className={todo.completed ? 'completed' : ''} key={todo.id}>
              <label>
                <input
                  checked={todo.completed}
                  type="checkbox"
                  onChange={() => toggleTodo(todo.id)}
                />
                <span>{todo.text}</span>
              </label>
              <button
                aria-label={`删除 ${todo.text}`}
                type="button"
                onClick={() => deleteTodo(todo.id)}
              >
                删除
              </button>
            </li>
          ))}
        </ul>

        {visibleTodos.length === 0 && (
          <div className="empty-state">这个分类暂时没有任务。</div>
        )}
      </section>
    </main>
  )
}

export default App

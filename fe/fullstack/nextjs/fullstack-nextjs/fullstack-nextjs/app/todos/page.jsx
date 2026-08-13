// react 可以在后端运行
'use client';
// 组件在前端渲染的标记
// 添加事件，useEffect, 调用后端·接口 csr next.js 也支持
// React Server Component  react ssr 组件
import {
  useState, 
  useEffect
} from 'react';
import { type Todo } from './types';

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState<string>("");
  const fetchTodos = async () => {
    const res = await fetch("/api/todos");
    const data: Todo[] = await res.json();
    // console.log(res);
    setTodos(data);
  }
  useEffect(() => {
    fetchTodos();
  }, [])
  return (
    <div style={{marginTop:"12px"}}>
        <h1>待办事项</h1>
        <input value={text} onChange={(e) => setText(e.target.value)}
        placeholder="请输入待办事项"  />
        <button onClick={handleAdd}>
          添加</button>
          
      <ul style={{paddingLeft: "0", listStyle: "none"}}>
      {
        todos.map((item) => (
          <li key={item.id} style={{
            margin:"8px 0", display:"flex", 
            gap: "10px"
            }}>
            <span style={{
              textDecoration: item.completed?"line-through":"none",
              cursor:"pointer"
              }}>
              {item.content}
            </span>
            <button>删除</button>
          </li>
        ))
      }
      </ul>
    </div>
  )
}
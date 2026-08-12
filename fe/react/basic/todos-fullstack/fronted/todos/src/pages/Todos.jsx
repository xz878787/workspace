import { getTodos } from '../api/todos';
import { useEffect, useState } from 'react';

function Todos() {
  const [todos, setTodos] = useState([]);
  useEffect(() => {
    // IIFE 立即执行函数
    (async () => {
      const data = await getTodos();
      setTodos(data);
    })()
  }, []);
  return (
    <>
      Todos
    </>
  )
}
export default Todos
import { useState } from "react";
import AddTodo from "./components/AddTodo";
import TodoList from "./components/TodoList";

export default function App() {
  const [tasks, setTasks] = useState([]);

  function handleAdd(text) {
    setTasks((prev) => [
      ...prev,
      { id: Date.now(), text, completed: false },
    ]);
  }

  function handleToggle(id) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t,
      ),
    );
  }

  function handleDelete(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function handleReorder(result) {
    if (!result.destination) return;
    setTasks((prev) => {
      const items = [...prev];
      const [removed] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, removed);
      return items;
    });
  }

  return (
    <div className="max-w-lg mx-auto mt-12 px-4">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        待办清单
      </h1>
      <AddTodo onAdd={handleAdd} />
      <TodoList
        tasks={tasks}
        onToggle={handleToggle}
        onDelete={handleDelete}
        onReorder={handleReorder}
      />
    </div>
  );
}

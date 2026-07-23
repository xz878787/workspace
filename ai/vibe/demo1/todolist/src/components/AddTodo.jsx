import { useState } from "react";

export default function AddTodo({ onAdd }) {
  const [text, setText] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="输入新的待办..."
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-blue-400
                   placeholder-gray-400"
      />
      <button
        type="submit"
        className="px-5 py-2 bg-blue-500 text-white rounded-lg
                   hover:bg-blue-600 transition-colors cursor-pointer"
      >
        添加
      </button>
    </form>
  );
}

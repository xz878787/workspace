export default function TodoItem({ task, onToggle, onDelete, provided }) {
  return (
    <li
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={`flex items-center gap-3 px-4 py-3 bg-white rounded-lg
                  shadow-sm border border-gray-200
                  transition-opacity ${task.completed ? "opacity-50" : ""}`}
    >
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        className="w-5 h-5 text-blue-500 rounded focus:ring-blue-400
                   cursor-pointer"
      />
      <span
        className={`flex-1 text-gray-800 ${
          task.completed ? "line-through text-gray-400" : ""
        }`}
      >
        {task.text}
      </span>
      <button
        onClick={() => onDelete(task.id)}
        className="px-3 py-1 text-sm text-red-500 hover:bg-red-50
                   rounded transition-colors cursor-pointer"
      >
        删除
      </button>
    </li>
  );
}

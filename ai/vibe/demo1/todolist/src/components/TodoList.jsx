import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import TodoItem from "./TodoItem";

export default function TodoList({ tasks, onToggle, onDelete, onReorder }) {
  if (tasks.length === 0) {
    return (
      <p className="text-center text-gray-400 mt-8">
        暂无待办，添加一个吧
      </p>
    );
  }

  return (
    <DragDropContext onDragEnd={onReorder}>
      <Droppable droppableId="todolist">
        {(provided) => (
          <ul
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="space-y-2"
          >
            {tasks.map((task, index) => (
              <Draggable
                key={task.id}
                draggableId={String(task.id)}
                index={index}
              >
                {(provided) => (
                  <TodoItem
                    task={task}
                    onToggle={onToggle}
                    onDelete={onDelete}
                    provided={provided}
                  />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
}

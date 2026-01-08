import React from 'react';

interface TaskActionsProps {
  taskId: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
  completed: boolean;
}

const TaskActions: React.FC<TaskActionsProps> = ({
  taskId,
  onEdit,
  onDelete,
  onToggleComplete,
  completed
}) => {
  return (
    <div className="flex space-x-2">
      <button
        onClick={() => onToggleComplete(taskId, !completed)}
        className={`px-3 py-1 text-sm rounded-md ${
          completed
            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
            : 'bg-green-100 text-green-800 hover:bg-green-200'
        }`}
      >
        {completed ? 'Mark Incomplete' : 'Mark Complete'}
      </button>
      <button
        onClick={() => onEdit(taskId)}
        className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200"
      >
        Edit
      </button>
      <button
        onClick={() => onDelete(taskId)}
        className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200"
      >
        Delete
      </button>
    </div>
  );
};

export default TaskActions;
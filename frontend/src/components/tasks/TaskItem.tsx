import React from 'react';
import { Task } from '../../services/api-client';

interface TaskItemProps {
  task: Task;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit, onDelete, onToggleComplete }) => {
  const handleToggleComplete = () => {
    onToggleComplete(task.id, !task.completed);
  };

  return (
    <div className={`bg-gray-800 rounded-xl p-5 border ${task.completed ? 'border-green-800/50 bg-green-900/10' : 'border-gray-700'} transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-sky-500/10 hover:-translate-y-0.5`}>
      <div className="flex items-start">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleToggleComplete}
          className="mt-1 h-5 w-5 text-sky-500 rounded focus:ring-sky-500 focus:ring-2 cursor-pointer transition-transform duration-200 hover:scale-110"
        />
        <div className="ml-4 flex-1 min-w-0">
          <h3 className={`text-lg font-medium transition-all duration-300 ${task.completed ? 'text-gray-500 line-through' : 'text-white'} ${task.completed ? 'opacity-70' : ''}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className={`mt-2 text-sm transition-all duration-300 ${task.completed ? 'text-gray-600' : 'text-gray-400'} ${task.completed ? 'opacity-60' : ''}`}>
              {task.description}
            </p>
          )}
          <div className="mt-3 flex items-center text-xs text-gray-500 transition-all duration-300">
            <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
            {task.completed && task.updated_at !== task.created_at && (
              <span className="ml-2">• Completed: {new Date(task.updated_at).toLocaleDateString()}</span>
            )}
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onEdit}
            className="text-sky-400 hover:text-sky-300 text-sm font-medium transition-all duration-200 hover:scale-105 hover:underline"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-red-400 hover:text-red-300 text-sm font-medium transition-all duration-200 hover:scale-105 hover:underline"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
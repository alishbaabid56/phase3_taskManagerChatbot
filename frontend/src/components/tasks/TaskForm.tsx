import React, { useState } from 'react';
import { Task, TaskCreate, TaskUpdate } from '../../services/api-client';

interface TaskFormProps {
  task?: Task;
  onSubmit: (taskData: TaskCreate | TaskUpdate) => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSubmit, onCancel }) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (task) {
      // Update existing task
      onSubmit({ title: title.trim(), description: description.trim() });
    } else {
      // Create new task
      onSubmit({
        title: title.trim(),
        description: description.trim(),
        completed: false
      });
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl">
      <h2 className="text-xl font-bold text-white mb-4 transition-all duration-300 ease-in-out">
        {task ? 'Edit Task' : 'Create New Task'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700 text-red-300 rounded-lg animate-fadeIn">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4 transition-all duration-300 ease-in-out">
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white placeholder-gray-500 transition-all duration-300 ease-in-out hover:bg-gray-600/50 focus:scale-[1.02]"
            placeholder="Enter task title"
          />
        </div>

        <div className="mb-6 transition-all duration-300 ease-in-out">
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white placeholder-gray-500 transition-all duration-300 ease-in-out hover:bg-gray-600/50 focus:scale-[1.02]"
            placeholder="Enter task description (optional)"
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 ease-in-out"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-200 ease-in-out"
          >
            {task ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
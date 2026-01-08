import React, { useState, useEffect } from 'react';
import { Task } from '../../services/api-client';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import { apiClient } from '../../services/api-client';

interface TaskListProps {
  userId: string;
  token: string;
}

const TaskList: React.FC<TaskListProps> = ({ userId, token }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const tasksData = await apiClient.getTasks(userId, token);
        setTasks(tasksData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [userId, token]);

  const handleCreateTask = async (taskData: any) => {
    try {
      const newTask = await apiClient.createTask(userId, taskData, token);
      setTasks([...tasks, newTask]);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  const handleUpdateTask = async (taskData: any) => {
    if (!editingTask) return;

    try {
      const updatedTask = await apiClient.updateTask(userId, editingTask.id, taskData, token);
      setTasks(tasks.map(task => task.id === editingTask.id ? updatedTask : task));
      setEditingTask(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await apiClient.deleteTask(userId, taskId, token);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    try {
      const updatedTask = await apiClient.updateTaskCompletion(userId, taskId, completed, token);
      setTasks(tasks.map(task =>
        task.id === taskId ? updatedTask : task
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task completion');
    }
  };

  const startEditing = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const cancelEditing = () => {
    setEditingTask(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500"></div>
        <p className="mt-2 text-gray-400">Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-4 flex justify-between items-center">
        <span>Error: {error}</span>
        <button
          onClick={() => setError(null)}
          className="text-red-300 hover:text-white ml-4"
        >
          ×
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-white">Your Tasks</h3>
          <p className="text-gray-400">{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-sky-600 hover:bg-sky-700 hover:scale-105 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 ease-in-out transform"
        >
          Add Task
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-800 rounded-xl p-6">
          <TaskForm
            task={editingTask}
            onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
            onCancel={cancelEditing}
          />
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No tasks yet</h3>
          <p className="text-gray-400 mb-4">Get started by creating your first task</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-sky-600 hover:bg-sky-700 hover:scale-105 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 ease-in-out transform"
          >
            Create Task
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onEdit={() => startEditing(task)}
              onDelete={handleDeleteTask}
              onToggleComplete={handleToggleComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;
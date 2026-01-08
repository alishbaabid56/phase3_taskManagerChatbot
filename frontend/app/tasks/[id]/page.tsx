'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../src/components/auth/AuthProvider';
import { apiClient, Task } from '../../../src/services/api-client';
import Link from 'next/link';
import Navbar from '../../../src/components/Navbar';

interface TaskDetailPageProps {
  params: {
    id: string;
  };
}

const TaskDetailPage = ({ params }: TaskDetailPageProps) => {
  const { user, token, isAuthenticated } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTask = async () => {
      if (!user || !token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      try {
        // This would need to be adjusted based on the API structure
        // For now, we'll simulate fetching the task
        console.log('Task ID:', params.id);
        // In a real implementation, we would call the API to get the specific task
        // const taskData = await apiClient.getTask(user.id, params.id, token);
        // setTask(taskData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch task');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [params.id, user, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading task...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <Link href="/dashboard" className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Task Details</h1>

          {task ? (
            <div>
              <h2 className={`text-xl font-semibold mb-2 ${task.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                {task.title}
              </h2>
              {task.description && (
                <p className="text-gray-600 mb-4">{task.description}</p>
              )}
              <div className="flex items-center space-x-4 mt-6">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${task.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {task.completed ? 'Completed' : 'Pending'}
                </span>
                <span className="text-sm text-gray-500">
                  Created: {new Date(task.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Task not found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TaskDetailPage;
'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../../src/components/auth/AuthProvider';
import TaskList from '../../src/components/tasks/TaskList';
import { useRouter } from 'next/navigation';
import Navbar from '../../src/components/Navbar';

const DashboardPage = () => {
  const { user, token, isAuthenticated, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  // Check authentication status and redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      // Redirect to login if not authenticated
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
          <p className="mt-4 text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized message if not authenticated after loading
  if (!isAuthenticated || !user || !token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Please log in to access your dashboard</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="mt-4 inline-block bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white transition-opacity duration-500 ease-in-out">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 transition-transform duration-500 ease-out">
          <h2 className="text-2xl font-bold mb-2">Your Tasks</h2>
          <p className="text-gray-400">Manage and organize your daily activities</p>
        </div>

        <TaskList userId={user.id} token={token} />
      </main>
    </div>
  );
};

export default DashboardPage;
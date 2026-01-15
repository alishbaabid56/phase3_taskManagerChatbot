'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../src/components/auth/AuthProvider';
import TaskList from '../../src/components/tasks/TaskList';
import { ChatComponent, ChatPopup } from '../../src/components';
import { useRouter } from 'next/navigation';
import Navbar from '../../src/components/Navbar';

const DashboardPage = () => {
  const { user, token, isAuthenticated, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [isChatOpen, setIsChatOpen] = useState(false);

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
          <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
          <p className="text-gray-400">Manage your tasks and interact with AI assistant</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl">
              <h3 className="text-xl font-semibold mb-4 text-sky-400">Your Tasks</h3>
              <TaskList userId={user.id} token={token} />
            </div>
          </div>
        </div>

        {/* Floating AI Assistant Icon */}
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-sky-600 hover:bg-sky-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          aria-label="Open AI Assistant"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>

        {/* Chat Popup */}
        <ChatPopup
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      </main>
    </div>
  );
};

export default DashboardPage;
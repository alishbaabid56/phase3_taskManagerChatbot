'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../../src/components/auth/AuthProvider';
import { ChatComponent } from '../../src/components';
import Navbar from '../../src/components/Navbar';
import { useRouter } from 'next/navigation';

const AssistantPage = () => {
  const { user, token, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
          <p className="mt-4 text-gray-400">Loading AI Assistant...</p>
        </div>
      </div>
    );
  }

  // Unauthorized state
  if (!isAuthenticated || !user || !token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Please log in to access AI Assistant</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="mt-4 bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 px-6 rounded-lg transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1">AI Assistant</h2>
          <p className="text-gray-400">
            Talk to your AI assistant and manage tasks seamlessly
          </p>
        </div>

        {/* Chat Container */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl h-[75vh] overflow-hidden">
          <ChatComponent />
        </div>
      </main>
    </div>
  );
};

export default AssistantPage;

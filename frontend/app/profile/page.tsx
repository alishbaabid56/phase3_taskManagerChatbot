'use client';

import React from 'react';
import { useAuth } from '../../src/components/auth/AuthProvider';
import Navbar from '../../src/components/Navbar';

const ProfilePage = () => {
  const { user, token, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated || !user || !token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access your profile</p>
          <a
            href="/auth/login"
            className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white transition-opacity duration-500 ease-in-out">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto animate-fadeIn">
          <h1 className="text-3xl font-bold mb-8 text-center transition-all duration-500 ease-out">Your Profile</h1>

          <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl">
            {/* Two-column layout for desktop, stacked for mobile */}
            <div className="md:flex">
              {/* Left column - User profile info */}
              <div className="md:w-1/2 p-8 border-r border-gray-700 transition-all duration-300 ease-in-out">
                <div className="flex flex-col items-center">
                  {/* Avatar placeholder */}
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center mb-6 transition-transform duration-300 ease-in-out hover:scale-105">
                    <span className="text-2xl font-bold text-white">
                      {user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold mb-2 transition-all duration-300 ease-in-out">{user.email}</h2>
                  <p className="text-gray-400 mb-6 transition-all duration-300 ease-in-out">Member since {new Date(user.created_at).toLocaleDateString()}</p>

                  <div className="w-full space-y-4">
                    <div className="transition-all duration-300 ease-in-out hover:bg-gray-700/30 p-2 rounded">
                      <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                      <p className="text-white break-all">{user.email}</p>
                    </div>

                    <div className="transition-all duration-300 ease-in-out hover:bg-gray-700/30 p-2 rounded">
                      <label className="block text-sm font-medium text-gray-400 mb-1">Account ID</label>
                      <p className="text-gray-300 text-sm font-mono">{user.id}</p>
                    </div>

                    <div className="transition-all duration-300 ease-in-out hover:bg-gray-700/30 p-2 rounded">
                      <label className="block text-sm font-medium text-gray-400 mb-1">Account Created</label>
                      <p className="text-gray-300">{new Date(user.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column - Actions */}
              <div className="md:w-1/2 p-8">
                <h3 className="text-xl font-semibold mb-6 text-sky-400 transition-all duration-300 ease-in-out">Account Actions</h3>

                <div className="space-y-4">
                  <button
                    className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 hover:scale-[1.02] text-white font-medium rounded-lg transition-all duration-200 ease-in-out flex items-center justify-center transform"
                    onClick={() => alert('Edit Profile functionality would go here')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit Profile
                  </button>

                  <button
                    className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 hover:scale-[1.02] text-white font-medium rounded-lg transition-all duration-200 ease-in-out flex items-center justify-center transform"
                    onClick={() => alert('Change Password functionality would go here')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Change Password
                  </button>

                  <button
                    className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 hover:scale-[1.02] text-white font-medium rounded-lg transition-all duration-200 ease-in-out flex items-center justify-center transform"
                    onClick={() => alert('Delete Account functionality would go here')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Delete Account
                  </button>

                  <button
                    className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 hover:scale-[1.02] text-white font-medium rounded-lg transition-all duration-200 ease-in-out flex items-center justify-center mt-8 transform"
                    onClick={logout}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                    </svg>
                    Logout
                  </button>
                </div>

                {/* Stats section */}
                <div className="mt-8 pt-6 border-t border-gray-700 transition-all duration-300 ease-in-out">
                  <h4 className="text-lg font-medium mb-4 text-gray-300 transition-all duration-300 ease-in-out">Account Stats</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700/50 p-4 rounded-lg transition-transform duration-300 ease-in-out hover:scale-105">
                      <p className="text-2xl font-bold text-sky-400">12</p>
                      <p className="text-sm text-gray-400">Tasks Created</p>
                    </div>
                    <div className="bg-gray-700/50 p-4 rounded-lg transition-transform duration-300 ease-in-out hover:scale-105">
                      <p className="text-2xl font-bold text-green-400">8</p>
                      <p className="text-sm text-gray-400">Tasks Completed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
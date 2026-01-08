'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '../src/components/Navbar';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12 md:py-24">
        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* Left Column - Text Content */}
          <div className="md:w-1/2 flex flex-col">
            <div className="mb-6">
              <span className="text-sky-400 text-sm font-medium tracking-wider">
                SMART • SIMPLE • PRODUCTIVE
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Manage Your Tasks
              <br />
              <span className="text-sky-400">Smarter & Faster</span>
            </h1>

            <p className="text-lg text-gray-300 mb-10 max-w-lg">
              Organize your daily tasks, stay productive,
              <br />
              and never miss what matters.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/dashboard"
                className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 text-center"
              >
                Go to Dashboard
              </Link>

              <Link
                href="/auth/login"
                className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 border border-gray-700 text-center"
              >
                Login
              </Link>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-lg">
              <div className="bg-gradient-to-br from-sky-500 to-sky-700 rounded-2xl p-1 shadow-2xl">
                <div className="bg-gray-900 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-sm text-gray-400">Dashboard</div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center p-3 bg-gray-800 rounded-lg">
                      <div className="w-5 h-5 rounded-full border-2 border-sky-500 mr-3"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                      </div>
                      <div className="text-xs text-gray-500">Today</div>
                    </div>

                    <div className="flex items-center p-3 bg-gray-800 rounded-lg">
                      <div className="w-5 h-5 rounded-full border-2 border-gray-500 mr-3"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-600 rounded w-2/3"></div>
                      </div>
                      <div className="text-xs text-gray-500">Tomorrow</div>
                    </div>

                    <div className="flex items-center p-3 bg-gray-800 rounded-lg">
                      <div className="w-5 h-5 rounded-full border-2 border-gray-500 mr-3"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-600 rounded w-1/2"></div>
                      </div>
                      <div className="text-xs text-gray-500">Next Week</div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-800">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-400">Projects</div>
                      <div className="text-sm text-sky-400">View All</div>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <div className="h-8 bg-sky-900 rounded"></div>
                      <div className="h-8 bg-purple-900 rounded"></div>
                      <div className="h-8 bg-green-900 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-16 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-sky-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Task Organization</h3>
              <p className="text-gray-400">Effortlessly organize your tasks with intuitive drag-and-drop functionality.</p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 bg-sky-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Time Management</h3>
              <p className="text-gray-400">Track your productivity and manage your time more efficiently.</p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 bg-sky-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-gray-400">Your data is encrypted and securely stored with industry-standard protocols.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-2xl font-bold mb-4 md:mb-0">TaskFlow</div>
            <div className="flex space-x-6 text-gray-400">
              <Link href="/auth/login" className="hover:text-sky-400 transition-colors">Login</Link>
              <Link href="/auth/register" className="hover:text-sky-400 transition-colors">Sign Up</Link>
              <Link href="/dashboard" className="hover:text-sky-400 transition-colors">Dashboard</Link>
            </div>
            <div className="mt-4 md:mt-0 text-gray-500 text-sm">
              © 2025 TaskFlow. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
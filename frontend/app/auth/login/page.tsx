'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../src/components/auth/AuthProvider';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../../src/components/Navbar';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);

      // After successful login, redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      // Handle different types of errors to prevent [object Object] display
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else if (typeof err === 'object' && err !== null) {
        // Handle API response objects
        if (err.hasOwnProperty('message')) {
          setError((err as any).message as string);
        } else if (err.hasOwnProperty('detail')) {
          // Common API error field name
          setError((err as any).detail as string || 'Login failed');
        } else if (err.hasOwnProperty('error')) {
          setError((err as any).error as string || 'Login failed');
        } else {
          // Provide generic error message instead of stringifying the object
          setError('Login failed');
        }
      } else {
        setError('Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Navigation */}
      <Navbar />

      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold">
              Welcome Back
            </h2>
            <p className="mt-2 text-center text-gray-400">
              Sign in to your account to continue
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white placeholder-gray-500 transition-all duration-300 ease-in-out hover:bg-gray-700/50 focus:scale-[1.02]"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white placeholder-gray-500 transition-all duration-300 ease-in-out hover:bg-gray-700/50 focus:scale-[1.02]"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a href="#" className="text-sky-400 hover:text-sky-300 hover:underline transition-all duration-300 ease-in-out">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 transition-all duration-300 ease-in-out"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link href="/auth/register" className="font-medium text-sky-400 hover:text-sky-300 hover:underline transition-all duration-300 ease-in-out">
              Sign up
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 border-t border-gray-800">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          © 2025 Taskora. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
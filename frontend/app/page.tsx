'use client';

import Link from 'next/link';
import { isAuthenticated } from '@/lib/auth';

export default function Home() {
  const authenticated = isAuthenticated();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
            Project Task Manager
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Organize your projects and tasks efficiently. Stay productive and never miss a deadline.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {authenticated ? (
              <Link
                href="/projects"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors shadow-lg"
              >
                Go to Projects
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors shadow-lg"
                >
                  Get Started
                </Link>
                <Link
                  href="/login"
                  className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors shadow-lg border border-gray-300 dark:border-gray-700"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="text-3xl mb-4">📁</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Manage Projects</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Create and organize multiple projects to keep your work structured.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="text-3xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Track Tasks</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Add tasks to projects and track their status from pending to completed.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="text-3xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Secure & Private</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your data is secure with AWS Cognito authentication and user isolation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

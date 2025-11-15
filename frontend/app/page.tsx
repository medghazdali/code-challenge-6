'use client';

import Link from 'next/link';
import { isAuthenticated } from '@/lib/auth';

export default function Home() {
  const authenticated = isAuthenticated();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-20">
          <div className="inline-block mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <span className="text-white font-bold text-4xl">P</span>
            </div>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 dark:text-white mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Project Task Manager
          </h1>
          <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto font-light">
            Organize your projects and tasks efficiently. Stay productive and never miss a deadline.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {authenticated ? (
              <Link
                href="/projects"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-4 rounded-xl text-lg font-semibold transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                Go to Projects →
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-4 rounded-xl text-lg font-semibold transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  Get Started
                </Link>
                <Link
                  href="/login"
                  className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-10 py-4 rounded-xl text-lg font-semibold transition-all shadow-xl hover:shadow-2xl border-2 border-slate-200 dark:border-slate-700"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-all transform hover:-translate-y-1">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 text-3xl">
              📁
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Manage Projects</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Create and organize multiple projects to keep your work structured and easily accessible.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-all transform hover:-translate-y-1">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 text-3xl">
              ✅
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Track Tasks</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Add tasks to projects and track their status from pending to completed with visual indicators.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-all transform hover:-translate-y-1">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6 text-3xl">
              🔒
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Secure & Private</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Your data is secure with AWS Cognito authentication and complete user data isolation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

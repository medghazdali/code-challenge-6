'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clearTokens, isAuthenticated, getUserEmail } from '@/lib/auth';

export default function Navbar() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      setAuthenticated(isAuthenticated());
      setUserEmail(getUserEmail());
    };
    
    checkAuth();
    // Check auth state periodically to update email if token changes
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    clearTokens();
    setAuthenticated(false);
    setUserEmail(null);
    router.push('/login');
  };

  return (
    <nav className="bg-white dark:bg-slate-900 shadow-lg border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Project Manager
              </span>
            </Link>
            {authenticated && (
              <div className="hidden md:flex space-x-1">
                <Link
                  href="/projects"
                  className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-blue-50 dark:hover:bg-slate-800"
                >
                  Projects
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {authenticated ? (
              <>
                {userEmail && (
                  <div className="hidden sm:flex items-center space-x-3 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">
                        {userEmail.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Logged in as</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{userEmail}</span>
                    </div>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}


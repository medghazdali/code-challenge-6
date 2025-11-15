'use client';

interface ErrorAlertProps {
  error: string;
}

export default function ErrorAlert({ error }: ErrorAlertProps) {
  if (!error) return null;

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 px-4 py-3 rounded-r-lg mb-6 shadow-sm">
      <div className="flex items-center">
        <span className="font-semibold">Error:</span>
        <span className="ml-2">{error}</span>
      </div>
    </div>
  );
}


'use client';

import { useEffect } from 'react';
import { CheckIcon, CloseIcon } from './Icons';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

export default function ToastComponent({ toast, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 3000); // Auto-close after 3 seconds

    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  const iconColor = {
    success: 'text-green-500',
    error: 'text-red-500',
    info: 'text-blue-500',
  };

  return (
    <div className="animate-slideDown mb-2">
      <div
        className={`${bgColor[toast.type]} text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 min-w-[300px] max-w-md`}
      >
        <div className={`flex-shrink-0 ${toast.type === 'success' ? 'text-white' : toast.type === 'error' ? 'text-white' : 'text-white'}`}>
          {toast.type === 'success' ? (
            <CheckIcon className="w-5 h-5" />
          ) : toast.type === 'error' ? (
            <CloseIcon className="w-5 h-5" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-xs font-bold">i</span>
            </div>
          )}
        </div>
        <p className="flex-1 text-sm font-medium">{toast.message}</p>
        <button
          onClick={() => onClose(toast.id)}
          className="flex-shrink-0 text-white/80 hover:text-white transition-colors cursor-pointer"
        >
          <CloseIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}


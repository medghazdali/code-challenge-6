'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ui/ToastContainer';

interface ToastContextType {
  showSuccess: (message: string) => string;
  showError: (message: string) => string;
  showInfo: (message: string) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider');
  }
  return context;
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  const { toasts, showSuccess, showError, showInfo, removeToast } = useToast();

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showInfo }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}


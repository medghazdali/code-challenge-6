'use client';

import { CloseIcon, CheckIcon } from './Icons';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'red' | 'blue' | 'green';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'red',
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const colorClasses = {
    red: 'bg-red-600 hover:bg-red-700',
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-slate-200 dark:border-slate-700 animate-slideUp">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <span className="text-3xl">⚠️</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-4">
          {title}
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-center mb-8">
          {message}
        </p>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-all cursor-pointer flex items-center space-x-2"
          >
            <CloseIcon className="w-4 h-4" />
            <span>{cancelText}</span>
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-6 py-3 ${colorClasses[confirmColor]} text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl cursor-pointer flex items-center space-x-2`}
          >
            <CheckIcon className="w-4 h-4" />
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}


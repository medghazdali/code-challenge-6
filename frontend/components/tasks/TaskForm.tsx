'use client';

import { TaskFormData } from '@/types';
import { CloseIcon, CheckIcon } from '@/components/ui/Icons';

interface TaskFormProps {
  formData: TaskFormData;
  onChange: (data: TaskFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitLabel?: string;
  isLoading?: boolean;
}

export default function TaskForm({
  formData,
  onChange,
  onSubmit,
  onCancel,
  submitLabel = 'Create Task',
  isLoading = false,
}: TaskFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Task Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => onChange({ ...formData, title: e.target.value })}
          className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="Enter task title"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => onChange({ ...formData, description: e.target.value })}
          className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
          rows={4}
          placeholder="Enter task description (optional)"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Status
        </label>
        <select
          value={formData.status}
          onChange={(e) => onChange({ ...formData, status: e.target.value as TaskFormData['status'] })}
          className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-all cursor-pointer flex items-center space-x-2"
        >
          <CloseIcon className="w-4 h-4" />
          <span>Cancel</span>
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl cursor-pointer flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <CheckIcon className="w-4 h-4" />
              <span>{submitLabel}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}


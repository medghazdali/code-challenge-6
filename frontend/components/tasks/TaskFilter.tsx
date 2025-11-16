'use client';

import { useState } from 'react';

export type TaskFilterStatus = 'all' | 'pending' | 'in-progress' | 'completed';

interface TaskFilterProps {
  selectedStatus: TaskFilterStatus;
  onStatusChange: (status: TaskFilterStatus) => void;
  taskCounts: {
    all: number;
    pending: number;
    inProgress: number;
    completed: number;
  };
}

export default function TaskFilter({ selectedStatus, onStatusChange, taskCounts }: TaskFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const filters = [
    { value: 'all' as TaskFilterStatus, label: 'All Tasks', count: taskCounts.all, color: 'slate' },
    { value: 'pending' as TaskFilterStatus, label: 'Pending', count: taskCounts.pending, color: 'slate' },
    { value: 'in-progress' as TaskFilterStatus, label: 'In Progress', count: taskCounts.inProgress, color: 'blue' },
    { value: 'completed' as TaskFilterStatus, label: 'Completed', count: taskCounts.completed, color: 'green' },
  ];

  const selectedFilter = filters.find(f => f.value === selectedStatus);

  return (
    <div className="relative">
      {/* Mobile/Tablet: Dropdown */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 flex items-center justify-between cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {selectedFilter?.label}
            </span>
            <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
              {selectedFilter?.count}
            </span>
          </div>
          <svg
            className={`w-5 h-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-lg shadow-xl z-10 overflow-hidden">
            {filters.map((filter) => {
              const isActive = selectedStatus === filter.value;
              const colorClasses = {
                slate: isActive ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300',
                blue: isActive ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300',
                green: isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-300' : 'text-slate-700 dark:text-slate-300',
              };
              
              return (
                <button
                  key={filter.value}
                  onClick={() => {
                    onStatusChange(filter.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${colorClasses[filter.color as keyof typeof colorClasses]}`}
                >
                  <span className="text-sm font-medium">{filter.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive 
                      ? filter.color === 'blue' 
                        ? 'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
                        : filter.color === 'green'
                        ? 'bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300'
                        : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}>
                    {filter.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop: Button Group */}
      <div className="hidden md:flex items-center space-x-2 bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
        {filters.map((filter) => {
          const isActive = selectedStatus === filter.value;
          const colorClasses = {
            slate: isActive 
              ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700',
            blue: isActive 
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/10',
            green: isActive 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-green-50 dark:hover:bg-green-900/10',
          };
          
          return (
            <button
              key={filter.value}
              onClick={() => onStatusChange(filter.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer flex items-center space-x-2 ${colorClasses[filter.color as keyof typeof colorClasses]}`}
            >
              <span>{filter.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                isActive 
                  ? filter.color === 'blue' 
                    ? 'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
                    : filter.color === 'green'
                    ? 'bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300'
                    : 'bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-300'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}>
                {filter.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Click outside to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}


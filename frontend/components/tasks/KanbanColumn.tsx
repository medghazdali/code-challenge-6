'use client';

import { Task } from '@/types';

interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  status: 'pending' | 'in-progress' | 'completed';
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  headerBg: string;
  headerText: string;
  headerBorder: string;
  badgeBg: string;
  badgeText: string;
  columnBg: string;
  cardBorder: string;
  cardHoverBorder: string;
}

export default function KanbanColumn({
  title,
  tasks,
  status,
  onEdit,
  onDelete,
  headerBg,
  headerText,
  headerBorder,
  badgeBg,
  badgeText,
  columnBg,
  cardBorder,
  cardHoverBorder,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col">
      <div className={`${headerBg} rounded-t-xl px-4 py-3 border-b-2 ${headerBorder}`}>
        <div className="flex items-center justify-between">
          <h3 className={`font-bold ${headerText} uppercase text-sm tracking-wide`}>
            {title}
          </h3>
          <span className={`${badgeBg} ${badgeText} text-xs font-semibold px-2 py-1 rounded-full`}>
            {tasks.length}
          </span>
        </div>
      </div>
      <div className={`${columnBg} rounded-b-xl p-4 min-h-[400px] space-y-4`}>
        {tasks.map((task) => {
          const hoverClass = status === 'pending' 
            ? 'hover:border-slate-400 dark:hover:border-slate-600'
            : status === 'in-progress'
            ? 'hover:border-blue-400 dark:hover:border-blue-600'
            : 'hover:border-green-400 dark:hover:border-green-600';
          
          return (
          <div
            key={task.id}
            className={`bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-4 border ${cardBorder} ${hoverClass} cursor-pointer ${status === 'completed' ? 'opacity-90' : ''}`}
          >
            <h4 className={`font-semibold text-slate-900 dark:text-white mb-2 text-sm ${status === 'completed' ? 'line-through' : ''}`}>
              {task.title}
            </h4>
            {task.description && (
              <p className="text-slate-600 dark:text-slate-400 text-xs mb-3 line-clamp-2">
                {task.description}
              </p>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => onEdit(task)}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-xs font-medium transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="text-red-600 hover:text-red-700 dark:text-red-400 text-xs font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
          );
        })}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-slate-400 dark:text-slate-600 text-sm">
            No {title.toLowerCase()} tasks
          </div>
        )}
      </div>
    </div>
  );
}


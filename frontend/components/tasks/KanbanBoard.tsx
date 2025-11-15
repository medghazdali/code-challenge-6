'use client';

import { Task } from '@/types';
import KanbanColumn from './KanbanColumn';

interface KanbanBoardProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export default function KanbanBoard({ tasks, onEdit, onDelete }: KanbanBoardProps) {
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
      <KanbanColumn
        title="Pending"
        tasks={pendingTasks}
        status="pending"
        onEdit={onEdit}
        onDelete={onDelete}
        headerBg="bg-slate-100 dark:bg-slate-800"
        headerText="text-slate-700 dark:text-slate-300"
        headerBorder="border-slate-300 dark:border-slate-700"
        badgeBg="bg-slate-200 dark:bg-slate-700"
        badgeText="text-slate-700 dark:text-slate-300"
        columnBg="bg-slate-50 dark:bg-slate-900/50"
        cardBorder="border-slate-200 dark:border-slate-700"
        cardHoverBorder="border-slate-400 dark:border-slate-600"
      />
      <KanbanColumn
        title="In Progress"
        tasks={inProgressTasks}
        status="in-progress"
        onEdit={onEdit}
        onDelete={onDelete}
        headerBg="bg-blue-100 dark:bg-blue-900/30"
        headerText="text-blue-700 dark:text-blue-300"
        headerBorder="border-blue-300 dark:border-blue-700"
        badgeBg="bg-blue-200 dark:bg-blue-800"
        badgeText="text-blue-700 dark:text-blue-300"
        columnBg="bg-blue-50/50 dark:bg-blue-900/10"
        cardBorder="border-blue-200 dark:border-blue-800"
        cardHoverBorder="border-blue-400 dark:border-blue-600"
      />
      <KanbanColumn
        title="Completed"
        tasks={completedTasks}
        status="completed"
        onEdit={onEdit}
        onDelete={onDelete}
        headerBg="bg-green-100 dark:bg-green-900/30"
        headerText="text-green-700 dark:text-green-300"
        headerBorder="border-green-300 dark:border-green-700"
        badgeBg="bg-green-200 dark:bg-green-800"
        badgeText="text-green-700 dark:text-green-300"
        columnBg="bg-green-50/50 dark:bg-green-900/10"
        cardBorder="border-green-200 dark:border-green-800"
        cardHoverBorder="border-green-400 dark:border-green-600"
      />
    </div>
  );
}


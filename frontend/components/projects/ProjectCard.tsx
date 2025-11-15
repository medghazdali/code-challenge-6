'use client';

import Link from 'next/link';
import { Project } from '@/types';
import { EditIcon, DeleteIcon } from '@/components/ui/Icons';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export default function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
          <span className="text-white font-bold text-xl">P</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(project)}
            className="text-slate-400 hover:text-blue-500 transition-colors p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer"
            title="Edit project"
          >
            <EditIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(project)}
            className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
            title="Delete project"
          >
            <DeleteIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      <Link href={`/projects/${project.id}`}>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {project.name}
        </h3>
      </Link>
      <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 line-clamp-2 min-h-[2.5rem]">
        {project.description || 'No description provided'}
      </p>
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
        <Link
          href={`/projects/${project.id}`}
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-semibold flex items-center space-x-1 group-hover:underline"
        >
          <span>View Tasks</span>
          <span>→</span>
        </Link>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {new Date(project.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}


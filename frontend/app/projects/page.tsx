'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useProjects } from '@/hooks/useProjects';
import { ProjectFormData } from '@/types';
import Modal from '@/components/ui/Modal';
import ErrorAlert from '@/components/ui/ErrorAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ProjectCard from '@/components/projects/ProjectCard';
import ProjectForm from '@/components/projects/ProjectForm';

export default function ProjectsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projectFormData, setProjectFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
  });

  const { projects, loading, error, createProject, deleteProject } = useProjects();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProject(projectFormData);
      setShowCreateModal(false);
      setProjectFormData({ name: '', description: '' });
    } catch (err) {
      // Error is handled by hook
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? All tasks will be deleted too.')) {
      return;
    }
    try {
      await deleteProject(projectId);
    } catch (err) {
      // Error is handled by hook
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Projects</h1>
                <p className="text-slate-600 dark:text-slate-400">Manage your projects and tasks</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <span>+</span>
                <span>New Project</span>
              </button>
            </div>
          </div>

          <ErrorAlert error={error} />

          {loading ? (
            <LoadingSpinner message="Loading projects..." />
          ) : projects.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl shadow-sm border-2 border-dashed border-slate-300 dark:border-slate-700">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No projects yet</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Get started by creating your first project</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                Create Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} onDelete={handleDelete} />
              ))}
            </div>
          )}

          <Modal
            isOpen={showCreateModal}
            onClose={() => {
              setShowCreateModal(false);
              setProjectFormData({ name: '', description: '' });
            }}
            title="Create New Project"
          >
            <ProjectForm
              formData={projectFormData}
              onChange={setProjectFormData}
              onSubmit={handleCreate}
              onCancel={() => {
                setShowCreateModal(false);
                setProjectFormData({ name: '', description: '' });
              }}
            />
          </Modal>
        </div>
      </div>
    </ProtectedRoute>
  );
}


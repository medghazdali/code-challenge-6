'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useProjects } from '@/hooks/useProjects';
import { Project, ProjectFormData } from '@/types';
import Modal from '@/components/ui/Modal';
import ErrorAlert from '@/components/ui/ErrorAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ConfirmModal from '@/components/ui/ConfirmModal';
import ProjectCard from '@/components/projects/ProjectCard';
import ProjectForm from '@/components/projects/ProjectForm';
import { useToastContext } from '@/components/ToastProvider';

export default function ProjectsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [projectFormData, setProjectFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
  });

  const { projects, loading, error, createProject, updateProject, deleteProject } = useProjects();
  const { showSuccess, showError } = useToastContext();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await createProject(projectFormData);
      setShowCreateModal(false);
      setProjectFormData({ name: '', description: '' });
      showSuccess('Project created successfully!');
    } catch (err) {
      showError('Failed to create project. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    setIsUpdating(true);
    try {
      await updateProject(editingProject.id, projectFormData);
      setShowEditModal(false);
      setEditingProject(null);
      setProjectFormData({ name: '', description: '' });
      showSuccess('Project updated successfully!');
    } catch (err) {
      showError('Failed to update project. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setProjectFormData({
      name: project.name,
      description: project.description || '',
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (project: Project) => {
    setDeletingProject(project);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProject) return;
    try {
      await deleteProject(deletingProject.id);
      setShowDeleteModal(false);
      setDeletingProject(null);
      showSuccess('Project deleted successfully!');
    } catch (err) {
      showError('Failed to delete project. Please try again.');
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
                <ProjectCard key={project.id} project={project} onEdit={handleEdit} onDelete={handleDeleteClick} />
              ))}
            </div>
          )}

          <Modal
            isOpen={showCreateModal}
            onClose={() => {
              if (!isCreating) {
                setShowCreateModal(false);
                setProjectFormData({ name: '', description: '' });
              }
            }}
            title="Create New Project"
          >
            <ProjectForm
              formData={projectFormData}
              onChange={setProjectFormData}
              onSubmit={handleCreate}
              onCancel={() => {
                if (!isCreating) {
                  setShowCreateModal(false);
                  setProjectFormData({ name: '', description: '' });
                }
              }}
              isLoading={isCreating}
            />
          </Modal>

          <Modal
            isOpen={showEditModal}
            onClose={() => {
              if (!isUpdating) {
                setShowEditModal(false);
                setEditingProject(null);
                setProjectFormData({ name: '', description: '' });
              }
            }}
            title="Edit Project"
          >
            <ProjectForm
              formData={projectFormData}
              onChange={setProjectFormData}
              onSubmit={handleUpdate}
              onCancel={() => {
                if (!isUpdating) {
                  setShowEditModal(false);
                  setEditingProject(null);
                  setProjectFormData({ name: '', description: '' });
                }
              }}
              submitLabel="Update Project"
              isLoading={isUpdating}
            />
          </Modal>

          <ConfirmModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setDeletingProject(null);
            }}
            onConfirm={handleDeleteConfirm}
            title="Delete Project"
            message={`Are you sure you want to delete "${deletingProject?.name}"? This action cannot be undone and all tasks in this project will also be deleted.`}
            confirmText="Delete"
            cancelText="Cancel"
            confirmColor="red"
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}


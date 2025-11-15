'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { projectsAPI } from '@/lib/api';
import { useTasks } from '@/hooks/useTasks';
import { Project, Task, TaskFormData } from '@/types';
import Modal from '@/components/ui/Modal';
import ErrorAlert from '@/components/ui/ErrorAlert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ConfirmModal from '@/components/ui/ConfirmModal';
import TaskForm from '@/components/tasks/TaskForm';
import KanbanBoard from '@/components/tasks/KanbanBoard';
import TaskFilter, { TaskFilterStatus } from '@/components/tasks/TaskFilter';
import { useToastContext } from '@/components/ToastProvider';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [filterStatus, setFilterStatus] = useState<TaskFilterStatus>('all');
  const [taskFormData, setTaskFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    status: 'pending',
  });

  const { tasks, loading, error, createTask, updateTask, deleteTask } = useTasks(projectId);
  const { showSuccess, showError } = useToastContext();

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      const data = await projectsAPI.get(projectId);
      setProject(data);
    } catch (err: any) {
      console.error('Failed to load project:', err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await createTask(taskFormData);
      setShowCreateModal(false);
      setTaskFormData({ title: '', description: '', status: 'pending' });
      showSuccess('Task created successfully!');
    } catch (err) {
      showError('Failed to create task. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    setIsUpdating(true);
    try {
      await updateTask(editingTask.id, taskFormData);
      setShowEditModal(false);
      setEditingTask(null);
      setTaskFormData({ title: '', description: '', status: 'pending' });
      showSuccess('Task updated successfully!');
    } catch (err) {
      showError('Failed to update task. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClick = (task: Task) => {
    setDeletingTask(task);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTask) return;
    try {
      await deleteTask(deletingTask.id);
      setShowDeleteModal(false);
      setDeletingTask(null);
      showSuccess('Task deleted successfully!');
    } catch (err) {
      showError('Failed to delete task. Please try again.');
    }
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTaskFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
    });
    setShowEditModal(true);
  };

  // Filter tasks based on selected status
  const filteredTasks = filterStatus === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === filterStatus);

  // Calculate task counts for filter
  const taskCounts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link 
            href="/projects" 
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 mb-6 transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span className="font-medium">Back to Projects</span>
          </Link>

          {project && (
            <div className="mb-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-xl">P</span>
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{project.name}</h1>
                      <p className="text-slate-600 dark:text-slate-400 mt-1">{project.description || 'No description provided'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Tasks</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Manage tasks for this project</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <span>+</span>
                <span>New Task</span>
              </button>
            </div>
            
            {/* Task Filter */}
            {tasks.length > 0 && (
              <div className="mb-4">
                <TaskFilter
                  selectedStatus={filterStatus}
                  onStatusChange={setFilterStatus}
                  taskCounts={taskCounts}
                />
              </div>
            )}
          </div>

          <ErrorAlert error={error} />

          {loading ? (
            <LoadingSpinner message="Loading tasks..." />
          ) : tasks.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl shadow-sm border-2 border-dashed border-slate-300 dark:border-slate-700">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No tasks yet</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Create your first task to get started</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                Create Task
              </button>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl shadow-sm border-2 border-dashed border-slate-300 dark:border-slate-700">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No tasks found</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                No tasks match the selected filter. Try a different status.
              </p>
            </div>
          ) : (
            <KanbanBoard tasks={filteredTasks} onEdit={openEditModal} onDelete={handleDeleteClick} />
          )}

          <Modal
            isOpen={showCreateModal}
            onClose={() => {
              if (!isCreating) {
                setShowCreateModal(false);
                setTaskFormData({ title: '', description: '', status: 'pending' });
              }
            }}
            title="Create New Task"
          >
            <TaskForm
              formData={taskFormData}
              onChange={setTaskFormData}
              onSubmit={handleCreateTask}
              onCancel={() => {
                if (!isCreating) {
                  setShowCreateModal(false);
                  setTaskFormData({ title: '', description: '', status: 'pending' });
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
                setEditingTask(null);
                setTaskFormData({ title: '', description: '', status: 'pending' });
              }
            }}
            title="Edit Task"
          >
            <TaskForm
              formData={taskFormData}
              onChange={setTaskFormData}
              onSubmit={handleUpdateTask}
              onCancel={() => {
                if (!isUpdating) {
                  setShowEditModal(false);
                  setEditingTask(null);
                  setTaskFormData({ title: '', description: '', status: 'pending' });
                }
              }}
              submitLabel="Update Task"
              isLoading={isUpdating}
            />
          </Modal>

          <ConfirmModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setDeletingTask(null);
            }}
            onConfirm={handleDeleteConfirm}
            title="Delete Task"
            message={`Are you sure you want to delete "${deletingTask?.title}"? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            confirmColor="red"
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}


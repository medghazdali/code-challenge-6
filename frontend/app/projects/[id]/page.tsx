'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { projectsAPI, tasksAPI } from '@/lib/api';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'pending' });

  useEffect(() => {
    if (projectId) {
      loadProject();
      loadTasks();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      const data = await projectsAPI.get(projectId);
      setProject(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load project');
    }
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await tasksAPI.list(projectId);
      setTasks(data.tasks || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tasksAPI.create(projectId, newTask.title, newTask.description, newTask.status);
      setShowCreateModal(false);
      setNewTask({ title: '', description: '', status: 'pending' });
      loadTasks();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create task');
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    try {
      await tasksAPI.update(editingTask.id, newTask.title, newTask.description, newTask.status);
      setShowEditModal(false);
      setEditingTask(null);
      setNewTask({ title: '', description: '', status: 'pending' });
      loadTasks();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await tasksAPI.delete(taskId);
      loadTasks();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete task');
    }
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setNewTask({ title: task.title, description: task.description || '', status: task.status });
    setShowEditModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-700';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600';
    }
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

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
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

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 px-4 py-3 rounded-r-lg mb-6 shadow-sm">
              <div className="flex items-center">
                <span className="font-semibold">Error:</span>
                <span className="ml-2">{error}</span>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
              <p className="mt-4 text-slate-600 dark:text-slate-400">Loading tasks...</p>
            </div>
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              {/* Pending Column */}
              <div className="flex flex-col">
                <div className="bg-slate-100 dark:bg-slate-800 rounded-t-xl px-4 py-3 border-b-2 border-slate-300 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-sm tracking-wide">
                      Pending
                    </h3>
                    <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold px-2 py-1 rounded-full">
                      {tasks.filter(t => t.status === 'pending').length}
                    </span>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-b-xl p-4 min-h-[400px] space-y-4">
                  {tasks.filter(task => task.status === 'pending').map((task) => (
                    <div
                      key={task.id}
                      className="bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-4 border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 cursor-pointer"
                    >
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-slate-600 dark:text-slate-400 text-xs mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700">
                        <button
                          onClick={() => openEditModal(task)}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-xs font-medium transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 text-xs font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {tasks.filter(t => t.status === 'pending').length === 0 && (
                    <div className="text-center py-8 text-slate-400 dark:text-slate-600 text-sm">
                      No pending tasks
                    </div>
                  )}
                </div>
              </div>

              {/* In Progress Column */}
              <div className="flex flex-col">
                <div className="bg-blue-100 dark:bg-blue-900/30 rounded-t-xl px-4 py-3 border-b-2 border-blue-300 dark:border-blue-700">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-blue-700 dark:text-blue-300 uppercase text-sm tracking-wide">
                      In Progress
                    </h3>
                    <span className="bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold px-2 py-1 rounded-full">
                      {tasks.filter(t => t.status === 'in-progress').length}
                    </span>
                  </div>
                </div>
                <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-b-xl p-4 min-h-[400px] space-y-4">
                  {tasks.filter(task => task.status === 'in-progress').map((task) => (
                    <div
                      key={task.id}
                      className="bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-4 border border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 cursor-pointer"
                    >
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-slate-600 dark:text-slate-400 text-xs mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700">
                        <button
                          onClick={() => openEditModal(task)}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-xs font-medium transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 text-xs font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {tasks.filter(t => t.status === 'in-progress').length === 0 && (
                    <div className="text-center py-8 text-slate-400 dark:text-slate-600 text-sm">
                      No in-progress tasks
                    </div>
                  )}
                </div>
              </div>

              {/* Completed Column */}
              <div className="flex flex-col">
                <div className="bg-green-100 dark:bg-green-900/30 rounded-t-xl px-4 py-3 border-b-2 border-green-300 dark:border-green-700">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-green-700 dark:text-green-300 uppercase text-sm tracking-wide">
                      Completed
                    </h3>
                    <span className="bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300 text-xs font-semibold px-2 py-1 rounded-full">
                      {tasks.filter(t => t.status === 'completed').length}
                    </span>
                  </div>
                </div>
                <div className="bg-green-50/50 dark:bg-green-900/10 rounded-b-xl p-4 min-h-[400px] space-y-4">
                  {tasks.filter(task => task.status === 'completed').map((task) => (
                    <div
                      key={task.id}
                      className="bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-4 border border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600 cursor-pointer opacity-90"
                    >
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm line-through">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-slate-600 dark:text-slate-400 text-xs mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700">
                        <button
                          onClick={() => openEditModal(task)}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-xs font-medium transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 text-xs font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {tasks.filter(t => t.status === 'completed').length === 0 && (
                    <div className="text-center py-8 text-slate-400 dark:text-slate-600 text-sm">
                      No completed tasks
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Create Task Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-slate-200 dark:border-slate-700 animate-slideUp">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create New Task</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={handleCreateTask} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Task Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter task title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
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
                      value={newTask.status}
                      onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
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
                      onClick={() => setShowCreateModal(false)}
                      className="px-6 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                    >
                      Create Task
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Task Modal */}
          {showEditModal && editingTask && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-slate-200 dark:border-slate-700 animate-slideUp">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Task</h2>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingTask(null);
                    }}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={handleUpdateTask} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Task Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter task title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
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
                      value={newTask.status}
                      onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
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
                      onClick={() => {
                        setShowEditModal(false);
                        setEditingTask(null);
                      }}
                      className="px-6 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                    >
                      Update Task
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}


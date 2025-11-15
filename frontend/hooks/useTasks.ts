import { useState, useEffect } from 'react';
import { tasksAPI } from '@/lib/api';
import { Task, TaskFormData } from '@/types';

export function useTasks(projectId: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await tasksAPI.list(projectId);
      setTasks(data.tasks || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (formData: TaskFormData) => {
    try {
      setError('');
      await tasksAPI.create(projectId, formData.title, formData.description, formData.status);
      await loadTasks();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create task');
      throw err;
    }
  };

  const updateTask = async (taskId: string, formData: TaskFormData) => {
    try {
      setError('');
      await tasksAPI.update(taskId, formData.title, formData.description, formData.status);
      await loadTasks();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update task');
      throw err;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      setError('');
      await tasksAPI.delete(taskId);
      await loadTasks();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete task');
      throw err;
    }
  };

  useEffect(() => {
    if (projectId) {
      loadTasks();
    }
  }, [projectId]);

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    reloadTasks: loadTasks,
  };
}


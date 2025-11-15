import { useState, useEffect } from 'react';
import { projectsAPI } from '@/lib/api';
import { Project, ProjectFormData } from '@/types';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await projectsAPI.list();
      setProjects(data.projects || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (formData: ProjectFormData) => {
    try {
      setError('');
      await projectsAPI.create(formData.name, formData.description);
      await loadProjects();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create project');
      throw err;
    }
  };

  const updateProject = async (projectId: string, formData: ProjectFormData) => {
    try {
      setError('');
      await projectsAPI.update(projectId, formData.name, formData.description);
      await loadProjects();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update project');
      throw err;
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      setError('');
      await projectsAPI.delete(projectId);
      await loadProjects();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete project');
      throw err;
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    reloadProjects: loadProjects,
  };
}


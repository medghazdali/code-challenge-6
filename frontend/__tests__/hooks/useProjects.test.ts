import { renderHook, waitFor } from '@testing-library/react';

// Mock the API module BEFORE importing the hook
const mockProjectsAPI = {
  list: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

jest.mock('@/lib/api', () => {
  const mockAPI = {
    list: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  return {
    projectsAPI: mockAPI,
    tasksAPI: {
      list: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    authAPI: {
      signup: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      getCurrentUser: jest.fn(),
    },
  };
});

// Now import the hook after mocking
import { useProjects } from '@/hooks/useProjects';
import { projectsAPI } from '@/lib/api';

const mockedProjectsAPI = projectsAPI as jest.Mocked<typeof projectsAPI>;

describe('useProjects Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load projects on mount', async () => {
    const mockProjects = [
      { id: 'p1', name: 'Project 1', userId: 'user-1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      { id: 'p2', name: 'Project 2', userId: 'user-1', createdAt: '2024-01-02', updatedAt: '2024-01-02' },
    ];
    mockedProjectsAPI.list.mockResolvedValue({ projects: mockProjects });

    const { result } = renderHook(() => useProjects());

    expect(result.current.loading).toBe(true);
    expect(result.current.projects).toEqual([]);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.projects).toEqual(mockProjects);
    expect(mockedProjectsAPI.list).toHaveBeenCalledTimes(1);
  });

  it('should handle loading error', async () => {
    const error = { response: { data: { error: 'Failed to load' } } };
    mockedProjectsAPI.list.mockRejectedValue(error);

    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to load');
    expect(result.current.projects).toEqual([]);
  });

  it('should create a project', async () => {
    const mockProjects = [{ id: 'p1', name: 'Project 1', userId: 'user-1', createdAt: '2024-01-01', updatedAt: '2024-01-01' }];
    mockedProjectsAPI.list.mockResolvedValue({ projects: mockProjects });
    mockedProjectsAPI.create.mockResolvedValue({});

    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.createProject({ name: 'New Project', description: 'Description' });

    expect(mockedProjectsAPI.create).toHaveBeenCalledWith('New Project', 'Description');
    expect(mockedProjectsAPI.list).toHaveBeenCalledTimes(2); // Initial load + reload after create
  });

  it('should handle create error', async () => {
    const mockProjects = [];
    mockedProjectsAPI.list.mockResolvedValue({ projects: mockProjects });
    const error = { response: { data: { error: 'Create failed' } } };
    mockedProjectsAPI.create.mockRejectedValue(error);

    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(result.current.createProject({ name: 'New Project' })).rejects.toEqual(error);
    
    await waitFor(() => {
      expect(result.current.error).toBe('Create failed');
    });
  });

  it('should update a project', async () => {
    const mockProjects = [{ id: 'p1', name: 'Project 1', userId: 'user-1', createdAt: '2024-01-01', updatedAt: '2024-01-01' }];
    mockedProjectsAPI.list.mockResolvedValue({ projects: mockProjects });
    mockedProjectsAPI.update.mockResolvedValue({});

    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.updateProject('p1', { name: 'Updated Project', description: 'Updated' });

    expect(mockedProjectsAPI.update).toHaveBeenCalledWith('p1', 'Updated Project', 'Updated');
    expect(mockedProjectsAPI.list).toHaveBeenCalledTimes(2);
  });

  it('should delete a project', async () => {
    const mockProjects = [{ id: 'p1', name: 'Project 1', userId: 'user-1', createdAt: '2024-01-01', updatedAt: '2024-01-01' }];
    mockedProjectsAPI.list.mockResolvedValue({ projects: mockProjects });
    mockedProjectsAPI.delete.mockResolvedValue(undefined);

    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.deleteProject('p1');

    expect(mockedProjectsAPI.delete).toHaveBeenCalledWith('p1');
    expect(mockedProjectsAPI.list).toHaveBeenCalledTimes(2);
  });

  it('should handle empty projects list', async () => {
    mockedProjectsAPI.list.mockResolvedValue({ projects: [] });

    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.projects).toEqual([]);
    expect(result.current.error).toBe('');
  });
});


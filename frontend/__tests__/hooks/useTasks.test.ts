import { renderHook, waitFor } from '@testing-library/react';

// Mock the API module BEFORE importing the hook
jest.mock('@/lib/api', () => {
  const mockAPI = {
    list: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  return {
    projectsAPI: {
      list: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    tasksAPI: mockAPI,
    authAPI: {
      signup: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      getCurrentUser: jest.fn(),
    },
  };
});

// Now import the hook after mocking
import { useTasks } from '@/hooks/useTasks';
import { tasksAPI } from '@/lib/api';

const mockedTasksAPI = tasksAPI as jest.Mocked<typeof tasksAPI>;

describe('useTasks Hook', () => {
  const projectId = 'project-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load tasks on mount', async () => {
    const mockTasks = [
      {
        id: 't1',
        projectId,
        title: 'Task 1',
        status: 'pending',
        userId: 'user-1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
      {
        id: 't2',
        projectId,
        title: 'Task 2',
        status: 'in-progress',
        userId: 'user-1',
        createdAt: '2024-01-02',
        updatedAt: '2024-01-02',
      },
    ];
    mockedTasksAPI.list.mockResolvedValue({ tasks: mockTasks });

    const { result } = renderHook(() => useTasks(projectId));

    expect(result.current.loading).toBe(true);
    expect(result.current.tasks).toEqual([]);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tasks).toEqual(mockTasks);
    expect(mockedTasksAPI.list).toHaveBeenCalledWith(projectId);
  });

  it('should handle loading error', async () => {
    const error = { response: { data: { error: 'Failed to load tasks' } } };
    mockedTasksAPI.list.mockRejectedValue(error);

    const { result } = renderHook(() => useTasks(projectId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to load tasks');
    expect(result.current.tasks).toEqual([]);
  });

  it('should create a task', async () => {
    const mockTasks = [];
    mockedTasksAPI.list.mockResolvedValue({ tasks: mockTasks });
    mockedTasksAPI.create.mockResolvedValue({});

    const { result } = renderHook(() => useTasks(projectId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.createTask({
      title: 'New Task',
      description: 'Description',
      status: 'pending',
    });

    expect(mockedTasksAPI.create).toHaveBeenCalledWith(projectId, 'New Task', 'Description', 'pending');
    expect(mockedTasksAPI.list).toHaveBeenCalledTimes(2);
  });

  it('should update a task', async () => {
    const mockTasks = [
      {
        id: 't1',
        projectId,
        title: 'Task 1',
        status: 'pending',
        userId: 'user-1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ];
    mockedTasksAPI.list.mockResolvedValue({ tasks: mockTasks });
    mockedTasksAPI.update.mockResolvedValue({});

    const { result } = renderHook(() => useTasks(projectId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.updateTask('t1', {
      title: 'Updated Task',
      description: 'Updated',
      status: 'completed',
    });

    expect(mockedTasksAPI.update).toHaveBeenCalledWith('t1', 'Updated Task', 'Updated', 'completed');
    expect(mockedTasksAPI.list).toHaveBeenCalledTimes(2);
  });

  it('should delete a task', async () => {
    const mockTasks = [
      {
        id: 't1',
        projectId,
        title: 'Task 1',
        status: 'pending',
        userId: 'user-1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ];
    mockedTasksAPI.list.mockResolvedValue({ tasks: mockTasks });
    mockedTasksAPI.delete.mockResolvedValue(undefined);

    const { result } = renderHook(() => useTasks(projectId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.deleteTask('t1');

    expect(mockedTasksAPI.delete).toHaveBeenCalledWith('t1');
    expect(mockedTasksAPI.list).toHaveBeenCalledTimes(2);
  });

  it('should not load tasks when projectId is empty', () => {
    const { result } = renderHook(() => useTasks(''));

    expect(mockedTasksAPI.list).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(true);
  });

  it('should reload tasks when projectId changes', async () => {
    const mockTasks = [];
    mockedTasksAPI.list.mockResolvedValue({ tasks: mockTasks });

    const { result, rerender } = renderHook(({ projectId }) => useTasks(projectId), {
      initialProps: { projectId: 'project-1' },
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    rerender({ projectId: 'project-2' });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockedTasksAPI.list).toHaveBeenCalledTimes(2);
    expect(mockedTasksAPI.list).toHaveBeenNthCalledWith(1, 'project-1');
    expect(mockedTasksAPI.list).toHaveBeenNthCalledWith(2, 'project-2');
  });
});


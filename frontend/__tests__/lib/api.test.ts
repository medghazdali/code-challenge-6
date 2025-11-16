// Mock axios module BEFORE importing
const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
};

jest.mock('axios', () => {
  const mockInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };
  return {
    __esModule: true,
    default: {
      create: jest.fn(() => mockInstance),
    },
  };
});

// Import after mocking
import { authAPI, projectsAPI, tasksAPI } from '@/lib/api';
import axios from 'axios';

const mockedAxios = (axios.create as jest.Mock)();

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

Object.defineProperty(window, 'location', {
  value: {
    href: '',
  },
  writable: true,
});

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('authAPI', () => {
    it('should signup user', async () => {
      const mockResponse = { data: { userSub: 'user-123' } };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await authAPI.signup('test@example.com', 'Password123!', 'Test User');

      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/signup', {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should login user', async () => {
      const mockResponse = {
        data: {
          accessToken: 'access-token',
          idToken: 'id-token',
          refreshToken: 'refresh-token',
          expiresIn: 3600,
        },
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await authAPI.login('test@example.com', 'Password123!');

      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'Password123!',
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should refresh token', async () => {
      const mockResponse = {
        data: {
          accessToken: 'new-access-token',
          idToken: 'new-id-token',
        },
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await authAPI.refreshToken('refresh-token');

      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/refresh', {
        refreshToken: 'refresh-token',
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('projectsAPI', () => {
    it('should list projects', async () => {
      const mockResponse = { data: { projects: [{ id: 'p1', name: 'Project 1' }] } };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await projectsAPI.list();

      expect(mockedAxios.get).toHaveBeenCalledWith('/projects');
      expect(result).toEqual(mockResponse.data);
    });

    it('should get project by ID', async () => {
      const mockResponse = { data: { id: 'p1', name: 'Project 1' } };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await projectsAPI.get('p1');

      expect(mockedAxios.get).toHaveBeenCalledWith('/projects/p1');
      expect(result).toEqual(mockResponse.data);
    });

    it('should create project', async () => {
      const mockResponse = { data: { id: 'p1', name: 'New Project' } };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await projectsAPI.create('New Project', 'Description');

      expect(mockedAxios.post).toHaveBeenCalledWith('/projects', {
        name: 'New Project',
        description: 'Description',
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should update project', async () => {
      const mockResponse = { data: { id: 'p1', name: 'Updated Project' } };
      mockedAxios.put.mockResolvedValue(mockResponse);

      const result = await projectsAPI.update('p1', 'Updated Project', 'Updated Description');

      expect(mockedAxios.put).toHaveBeenCalledWith('/projects/p1', {
        name: 'Updated Project',
        description: 'Updated Description',
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should delete project', async () => {
      mockedAxios.delete.mockResolvedValue({});

      await projectsAPI.delete('p1');

      expect(mockedAxios.delete).toHaveBeenCalledWith('/projects/p1');
    });
  });

  describe('tasksAPI', () => {
    it('should list tasks for a project', async () => {
      const mockResponse = { data: { tasks: [{ id: 't1', title: 'Task 1' }] } };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await tasksAPI.list('p1');

      expect(mockedAxios.get).toHaveBeenCalledWith('/projects/p1/tasks');
      expect(result).toEqual(mockResponse.data);
    });

    it('should create task', async () => {
      const mockResponse = { data: { id: 't1', title: 'New Task' } };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await tasksAPI.create('p1', 'New Task', 'Description', 'pending');

      expect(mockedAxios.post).toHaveBeenCalledWith('/projects/p1/tasks', {
        title: 'New Task',
        description: 'Description',
        status: 'pending',
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should update task', async () => {
      const mockResponse = { data: { id: 't1', title: 'Updated Task' } };
      mockedAxios.put.mockResolvedValue(mockResponse);

      const result = await tasksAPI.update('t1', 'Updated Task', 'Updated Description', 'completed');

      expect(mockedAxios.put).toHaveBeenCalledWith('/tasks/t1', {
        title: 'Updated Task',
        description: 'Updated Description',
        status: 'completed',
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should delete task', async () => {
      mockedAxios.delete.mockResolvedValue({});

      await tasksAPI.delete('t1');

      expect(mockedAxios.delete).toHaveBeenCalledWith('/tasks/t1');
    });
  });
});


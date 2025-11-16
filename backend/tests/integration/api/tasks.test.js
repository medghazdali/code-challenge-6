const axios = require('axios');
const { createTestUser, createAuthenticatedClient, cleanupTestData, API_URL } = require('../setup/test-helpers');

const TEST_API_URL = process.env.TEST_API_URL || API_URL;

// Check if API is available
let apiAvailable = false;

beforeAll(async () => {
  try {
    await axios.post(`${TEST_API_URL}/auth/signup`, {
      email: 'test-connection-check@example.com',
      password: 'TestPassword123!',
      name: 'Test',
    }, { timeout: 2000, validateStatus: () => true });
    apiAvailable = true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      apiAvailable = false;
    } else {
      apiAvailable = true;
    }
  }
});

// Integration tests require a running server
// Start the server with: npm run dev
// Or set TEST_API_URL environment variable: TEST_API_URL=http://localhost:3000 npm run test:integration
(apiAvailable ? describe : describe.skip)('Tasks Integration Tests', () => {
  let client;
  let accessToken;
  let projectId;
  let taskIds = [];
  let projectIds = [];

  beforeAll(async () => {
    const tokens = await createTestUser(
      `test-${Date.now()}@example.com`,
      'TestPassword123!',
      'Test User'
    );
    accessToken = tokens.accessToken;
    client = createAuthenticatedClient(accessToken);

    // Create a project for tasks
    const projectResponse = await client.post('/projects', {
      name: 'Tasks Test Project',
      description: 'Project for testing tasks',
    });
    projectId = projectResponse.data.id;
    projectIds.push(projectId);
  });

  afterAll(async () => {
    if (client && projectIds.length > 0) {
      await cleanupTestData(client, projectIds);
    }
  });

  describe('Create Task', () => {
    it('should create a task successfully', async () => {
      const response = await client.post(`/projects/${projectId}/tasks`, {
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
      });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data.title).toBe('Test Task');
      expect(response.data.status).toBe('pending');
      expect(response.data.projectId).toBe(projectId);
      
      taskIds.push(response.data.id);
    });

    it('should reject task creation without authentication', async () => {
      try {
        await require('axios').post(`${TEST_API_URL}/projects/${projectId}/tasks`, {
          title: 'Test Task',
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  describe('List Tasks', () => {
    beforeAll(async () => {
      // Create multiple tasks
      for (let i = 0; i < 3; i++) {
        const response = await client.post(`/projects/${projectId}/tasks`, {
          title: `List Test Task ${i}`,
          status: 'pending',
        });
        taskIds.push(response.data.id);
      }
    });

    it('should list all tasks for a project', async () => {
      const response = await client.get(`/projects/${projectId}/tasks`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('tasks');
      expect(response.data.tasks.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Update Task', () => {
    let taskId;

    beforeAll(async () => {
      const response = await client.post(`/projects/${projectId}/tasks`, {
        title: 'Update Test Task',
        status: 'pending',
      });
      taskId = response.data.id;
      taskIds.push(taskId);
    });

    it('should update a task successfully', async () => {
      const response = await client.put(`/tasks/${taskId}`, {
        title: 'Updated Task Title',
        status: 'completed',
      });

      expect(response.status).toBe(200);
      expect(response.data.title).toBe('Updated Task Title');
      expect(response.data.status).toBe('completed');
    });
  });

  describe('Delete Task', () => {
    let taskId;

    beforeAll(async () => {
      const response = await client.post(`/projects/${projectId}/tasks`, {
        title: 'Delete Test Task',
        status: 'pending',
      });
      taskId = response.data.id;
    });

    it('should delete a task successfully', async () => {
      const response = await client.delete(`/tasks/${taskId}`);

      expect(response.status).toBe(204);
    });

    it('should return 404 when getting deleted task', async () => {
      try {
        await client.get(`/tasks/${taskId}`);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });
  });
});


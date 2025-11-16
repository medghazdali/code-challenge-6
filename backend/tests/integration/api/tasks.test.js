const axios = require('axios');
const { createTestUser, createAuthenticatedClient, cleanupTestData, API_URL } = require('../setup/test-helpers');

const TEST_API_URL = process.env.TEST_API_URL || API_URL;

// Integration tests require a running server
// Set RUN_INTEGRATION_TESTS=true to enable: RUN_INTEGRATION_TESTS=true npm run test:integration
const RUN_TESTS = process.env.RUN_INTEGRATION_TESTS === 'true';

(RUN_TESTS ? describe : describe.skip)('Tasks Integration Tests', () => {
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
      try {
        // Cleanup with timeout - don't fail tests if cleanup is slow
        await Promise.race([
          cleanupTestData(client, projectIds),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Cleanup timeout')), 10000))
        ]).catch(() => {
          // Ignore cleanup errors/timeouts
          console.warn('Cleanup timed out or failed, continuing...');
        });
      } catch (error) {
        // Ignore cleanup errors
        console.warn('Cleanup error:', error.message);
      }
    }
  }, 15000); // 15 second timeout for afterAll

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
          description: `Description for task ${i}`,
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
        description: 'Description for update test',
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
        description: 'Description for delete test',
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


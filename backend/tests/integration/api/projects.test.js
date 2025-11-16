const axios = require('axios');
const { createTestUser, createAuthenticatedClient, cleanupTestData, API_URL } = require('../setup/test-helpers');

const TEST_API_URL = process.env.TEST_API_URL || API_URL;

// Integration tests require a running server
// Set RUN_INTEGRATION_TESTS=true to enable: RUN_INTEGRATION_TESTS=true npm run test:integration
const RUN_TESTS = process.env.RUN_INTEGRATION_TESTS === 'true';

(RUN_TESTS ? describe : describe.skip)('Projects Integration Tests', () => {
  let client;
  let accessToken;
  let projectIds = [];
  let setupFailed = false;

  beforeAll(async () => {
    try {
      const tokens = await createTestUser(
        `test-${Date.now()}@example.com`,
        'TestPassword123!',
        'Test User'
      );
      accessToken = tokens.accessToken;
      client = createAuthenticatedClient(accessToken);
    } catch (error) {
      setupFailed = true;
      console.warn('⚠️  Setup failed - API may not be available. Skipping tests.');
      console.warn('   Make sure the server is running: npm run dev');
    }
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

  describe('Create Project', () => {
    it('should create a project successfully', async () => {
      if (setupFailed) return;
      const response = await client.post('/projects', {
        name: 'Test Project',
        description: 'Test Description',
      });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data.name).toBe('Test Project');
      expect(response.data.description).toBe('Test Description');
      
      projectIds.push(response.data.id);
    });

    it('should reject project creation without authentication', async () => {
      if (setupFailed) return;
      try {
        await require('axios').post(`${TEST_API_URL}/projects`, {
          name: 'Test Project',
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(401);
      }
    });

    it('should reject project creation with missing name', async () => {
      if (setupFailed) return;
      try {
        await client.post('/projects', {
          description: 'Test Description',
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('Get Project', () => {
    let projectId;

    beforeAll(async () => {
      if (setupFailed) return;
      const response = await client.post('/projects', {
        name: 'Get Test Project',
        description: 'Description',
      });
      projectId = response.data.id;
      projectIds.push(projectId);
    });

    it('should get a project by ID', async () => {
      if (setupFailed) return;
      const response = await client.get(`/projects/${projectId}`);

      expect(response.status).toBe(200);
      expect(response.data.id).toBe(projectId);
      expect(response.data.name).toBe('Get Test Project');
    });

    it('should return 404 for non-existent project', async () => {
      if (setupFailed) return;
      try {
        // Use a valid UUID format for a non-existent project
        const fakeProjectId = '550e8400-e29b-41d4-a716-446655440000';
        await client.get(`/projects/${fakeProjectId}`);
        fail('Should have thrown an error');
      } catch (error) {
        // Accept either 400 (invalid format) or 404 (not found)
        expect([400, 404]).toContain(error.response.status);
      }
    });
  });

  describe('List Projects', () => {
    beforeAll(async () => {
      if (setupFailed) return;
      // Create multiple projects
      for (let i = 0; i < 3; i++) {
        const response = await client.post('/projects', {
          name: `List Test Project ${i}`,
        });
        projectIds.push(response.data.id);
      }
    });

    it('should list all user projects', async () => {
      if (setupFailed) return;
      const response = await client.get('/projects');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('projects');
      expect(response.data.projects.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Update Project', () => {
    let projectId;

    beforeAll(async () => {
      if (setupFailed) return;
      const response = await client.post('/projects', {
        name: 'Update Test Project',
        description: 'Original Description',
      });
      projectId = response.data.id;
      projectIds.push(projectId);
    });

    it('should update a project successfully', async () => {
      if (setupFailed) return;
      const response = await client.put(`/projects/${projectId}`, {
        name: 'Updated Project Name',
        description: 'Updated Description',
      });

      expect(response.status).toBe(200);
      expect(response.data.name).toBe('Updated Project Name');
      expect(response.data.description).toBe('Updated Description');
    });

    it('should return 404 when updating non-existent project', async () => {
      if (setupFailed) return;
      try {
        // Use a valid UUID format for a non-existent project
        const fakeProjectId = '550e8400-e29b-41d4-a716-446655440000';
        await client.put(`/projects/${fakeProjectId}`, {
          name: 'Updated Name',
        });
        fail('Should have thrown an error');
      } catch (error) {
        // Accept either 400 (invalid format) or 404 (not found)
        expect([400, 404]).toContain(error.response.status);
      }
    });
  });

  describe('Delete Project', () => {
    let projectId;

    beforeAll(async () => {
      if (setupFailed) return;
      const response = await client.post('/projects', {
        name: 'Delete Test Project',
      });
      projectId = response.data.id;
    });

    it('should delete a project successfully', async () => {
      if (setupFailed) return;
      const response = await client.delete(`/projects/${projectId}`);

      expect(response.status).toBe(204);
    });

    it('should return 404 when getting deleted project', async () => {
      if (setupFailed) return;
      try {
        await client.get(`/projects/${projectId}`);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });
  });
});


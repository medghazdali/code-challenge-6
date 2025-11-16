const axios = require('axios');
const { createTestUser, createAuthenticatedClient, cleanupTestData, API_URL } = require('../setup/test-helpers');

const TEST_API_URL = process.env.TEST_API_URL || API_URL;

// Integration tests require a running server
// Start the server with: npm run dev
// Or set TEST_API_URL environment variable: TEST_API_URL=http://localhost:3000 npm run test:integration
// 
// Note: Tests will be skipped if API is not available (connection refused/timeout)
describe('Projects Integration Tests', () => {
  // Check API availability before running tests
  beforeAll(async () => {
    try {
      await axios.post(`${TEST_API_URL}/auth/signup`, {
        email: 'test-connection-check@example.com',
        password: 'TestPassword123!',
        name: 'Test',
      }, { timeout: 2000, validateStatus: () => true });
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        // Skip all tests if API is not available
        return;
      }
    }
  });
  let client;
  let accessToken;
  let projectIds = [];

  beforeAll(async () => {
    const tokens = await createTestUser(
      `test-${Date.now()}@example.com`,
      'TestPassword123!',
      'Test User'
    );
    accessToken = tokens.accessToken;
    client = createAuthenticatedClient(accessToken);
  });

  afterAll(async () => {
    if (client && projectIds.length > 0) {
      await cleanupTestData(client, projectIds);
    }
  });

  describe('Create Project', () => {
    it('should create a project successfully', async () => {
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
      const response = await client.post('/projects', {
        name: 'Get Test Project',
        description: 'Description',
      });
      projectId = response.data.id;
      projectIds.push(projectId);
    });

    it('should get a project by ID', async () => {
      const response = await client.get(`/projects/${projectId}`);

      expect(response.status).toBe(200);
      expect(response.data.id).toBe(projectId);
      expect(response.data.name).toBe('Get Test Project');
    });

    it('should return 404 for non-existent project', async () => {
      try {
        await client.get('/projects/non-existent-id');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  describe('List Projects', () => {
    beforeAll(async () => {
      // Create multiple projects
      for (let i = 0; i < 3; i++) {
        const response = await client.post('/projects', {
          name: `List Test Project ${i}`,
        });
        projectIds.push(response.data.id);
      }
    });

    it('should list all user projects', async () => {
      const response = await client.get('/projects');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('projects');
      expect(response.data.projects.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Update Project', () => {
    let projectId;

    beforeAll(async () => {
      const response = await client.post('/projects', {
        name: 'Update Test Project',
        description: 'Original Description',
      });
      projectId = response.data.id;
      projectIds.push(projectId);
    });

    it('should update a project successfully', async () => {
      const response = await client.put(`/projects/${projectId}`, {
        name: 'Updated Project Name',
        description: 'Updated Description',
      });

      expect(response.status).toBe(200);
      expect(response.data.name).toBe('Updated Project Name');
      expect(response.data.description).toBe('Updated Description');
    });

    it('should return 404 when updating non-existent project', async () => {
      try {
        await client.put('/projects/non-existent-id', {
          name: 'Updated Name',
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  describe('Delete Project', () => {
    let projectId;

    beforeAll(async () => {
      const response = await client.post('/projects', {
        name: 'Delete Test Project',
      });
      projectId = response.data.id;
    });

    it('should delete a project successfully', async () => {
      const response = await client.delete(`/projects/${projectId}`);

      expect(response.status).toBe(204);
    });

    it('should return 404 when getting deleted project', async () => {
      try {
        await client.get(`/projects/${projectId}`);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });
  });
});


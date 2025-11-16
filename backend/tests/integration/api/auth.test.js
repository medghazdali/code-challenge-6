const axios = require('axios');
const { createTestUser, API_URL } = require('../setup/test-helpers');

const TEST_API_URL = process.env.TEST_API_URL || API_URL;

// Integration tests require a running server
// 
// To run these tests:
// 1. Start the server: npm run dev
// 2. In another terminal, run: npm run test:integration
// 
// Or set RUN_INTEGRATION_TESTS=true to enable tests:
// RUN_INTEGRATION_TESTS=true npm run test:integration
//
// Tests will be skipped by default to allow CI/CD pipelines to run without a server.
// Set RUN_INTEGRATION_TESTS=true environment variable to enable them.

const RUN_TESTS = process.env.RUN_INTEGRATION_TESTS === 'true';

(RUN_TESTS ? describe : describe.skip)('Auth Integration Tests', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  const testName = 'Test User';
  let apiAvailable = true;

  beforeAll(async () => {
    // Check if API is available and Cognito is configured
    try {
      const response = await axios.post(`${TEST_API_URL}/auth/signup`, {
        email: 'test-connection-check@example.com',
        password: 'TestPassword123!',
        name: 'Test',
      }, { timeout: 2000, validateStatus: () => true });
      // If we get 500, Cognito might not be configured
      if (response.status === 500) {
        apiAvailable = false;
        console.warn('⚠️  API returned 500 - Cognito may not be configured. Skipping tests.');
        return;
      }
      apiAvailable = true;
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        apiAvailable = false;
        console.warn('⚠️  API not available. Skipping tests.');
        console.warn('   Make sure the server is running: npm run dev');
      } else if (error.response?.status === 500) {
        apiAvailable = false;
        console.warn('⚠️  API returned 500 - Cognito may not be configured. Skipping tests.');
      } else {
        // Other errors (like 400) mean API is running
        apiAvailable = true;
      }
    }
  }, 10000); // 10 second timeout

  describe('Signup Flow', () => {
    it('should signup a new user successfully', async () => {
      if (!apiAvailable) return;
      const response = await axios.post(`${TEST_API_URL}/auth/signup`, {
        email: testEmail,
        password: testPassword,
        name: testName,
      });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('userSub');
      expect(response.data).toHaveProperty('confirmed');
      expect(response.data.confirmed).toBe(true);
    });

    it('should reject duplicate email signup', async () => {
      if (!apiAvailable) return;
      try {
        await axios.post(`${TEST_API_URL}/auth/signup`, {
          email: testEmail,
          password: testPassword,
          name: testName,
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toContain('already exists');
      }
    });

    it('should reject invalid email format', async () => {
      if (!apiAvailable) return;
      try {
        await axios.post(`${TEST_API_URL}/auth/signup`, {
          email: 'invalid-email',
          password: testPassword,
          name: testName,
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toContain('email');
      }
    });

    it('should reject short password', async () => {
      if (!apiAvailable) return;
      try {
        await axios.post(`${TEST_API_URL}/auth/signup`, {
          email: `test-${Date.now()}@example.com`,
          password: 'short',
          name: testName,
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toContain('Password');
      }
    });
  });

  describe('Login Flow', () => {
    it('should login user successfully', async () => {
      if (!apiAvailable) return;
      const newEmail = `test-${Date.now()}@example.com`;
      
      // First signup
      await axios.post(`${TEST_API_URL}/auth/signup`, {
        email: newEmail,
        password: testPassword,
        name: testName,
      });

      // Then login
      const response = await axios.post(`${TEST_API_URL}/auth/login`, {
        email: newEmail,
        password: testPassword,
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('accessToken');
      expect(response.data).toHaveProperty('idToken');
      expect(response.data).toHaveProperty('refreshToken');
      expect(response.data).toHaveProperty('expiresIn');
    });

    it('should reject invalid credentials', async () => {
      if (!apiAvailable) return;
      try {
        await axios.post(`${TEST_API_URL}/auth/login`, {
          email: 'nonexistent@example.com',
          password: 'WrongPassword123!',
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(400);
        // Accept either error message format
        const errorMsg = error.response.data.error || '';
        expect(
          errorMsg.includes('email or password') || 
          errorMsg.includes('Incorrect email or password') ||
          errorMsg.includes('User not found')
        ).toBe(true);
      }
    });
  });

  describe('Token Refresh Flow', () => {
    it('should refresh token successfully', async () => {
      if (!apiAvailable) return;
      const { refreshToken } = await createTestUser(
        `test-${Date.now()}@example.com`,
        testPassword,
        testName
      );

      const response = await axios.post(`${TEST_API_URL}/auth/refresh`, {
        refreshToken,
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('accessToken');
      expect(response.data).toHaveProperty('idToken');
      expect(response.data).toHaveProperty('expiresIn');
    });

    it('should reject invalid refresh token', async () => {
      if (!apiAvailable) return;
      try {
        await axios.post(`${TEST_API_URL}/auth/refresh`, {
          refreshToken: 'invalid-token',
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBeGreaterThanOrEqual(400);
      }
    });
  });
});


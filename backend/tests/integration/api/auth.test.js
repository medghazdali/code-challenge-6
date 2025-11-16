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

  describe('Signup Flow', () => {
    it('should signup a new user successfully', async () => {
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
      try {
        await axios.post(`${TEST_API_URL}/auth/login`, {
          email: 'nonexistent@example.com',
          password: 'WrongPassword123!',
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toContain('email or password');
      }
    });
  });

  describe('Token Refresh Flow', () => {
    it('should refresh token successfully', async () => {
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


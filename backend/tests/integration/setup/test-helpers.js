/**
 * Helper functions for integration tests
 */

const axios = require('axios');

const API_URL = process.env.TEST_API_URL || 'http://localhost:3000';

/**
 * Create a test user and get authentication tokens
 */
const createTestUser = async (email, password, name) => {
  try {
    // Signup
    await axios.post(`${API_URL}/auth/signup`, {
      email,
      password,
      name,
    });

    // Login to get tokens
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });

    return {
      accessToken: loginResponse.data.accessToken,
      idToken: loginResponse.data.idToken,
      refreshToken: loginResponse.data.refreshToken,
    };
  } catch (error) {
    console.error('Error creating test user:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Create authenticated axios instance
 */
const createAuthenticatedClient = (accessToken) => {
  const client = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return client;
};

/**
 * Wait for a condition to be true
 */
const waitFor = (condition, timeout = 5000, interval = 100) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const checkCondition = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for condition'));
      } else {
        setTimeout(checkCondition, interval);
      }
    };

    checkCondition();
  });
};

/**
 * Clean up test data (delete projects/tasks)
 */
const cleanupTestData = async (client, projectIds = []) => {
  for (const projectId of projectIds) {
    try {
      await client.delete(`/projects/${projectId}`);
    } catch (error) {
      // Ignore errors during cleanup
    }
  }
};

module.exports = {
  createTestUser,
  createAuthenticatedClient,
  waitFor,
  cleanupTestData,
  API_URL,
};


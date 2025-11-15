const axios = require('axios');

const API_URL = process.env.TEST_API_URL || 'http://localhost:3000';

// Cache for auth tokens
let authToken = null;
let tokenExpiry = null;

/**
 * Get or create authentication token
 */
async function getAuthToken(context, events, done) {
  const now = Date.now();
  
  // Use cached token if still valid
  if (authToken && tokenExpiry && now < tokenExpiry) {
    context.vars.token = authToken;
    return done();
  }

  try {
    // Create a test user and login
    const email = `loadtest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;
    const password = 'LoadTest123!';
    const name = 'Load Test User';

    // Signup
    await axios.post(`${API_URL}/auth/signup`, {
      email,
      password,
      name,
    });

    // Login
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });

    authToken = loginResponse.data.accessToken;
    // Cache token for 1 hour (assuming 3600s expiry)
    tokenExpiry = now + (3600 * 1000);
    context.vars.token = authToken;
    
    done();
  } catch (error) {
    console.error('Error getting auth token:', error.response?.data || error.message);
    done(error);
  }
}

/**
 * Create a project for task testing
 */
async function createProject(context, events, done) {
  try {
    const response = await axios.post(
      `${API_URL}/projects`,
      {
        name: `Load Test Project ${Date.now()}`,
        description: 'Project for load testing',
      },
      {
        headers: {
          Authorization: `Bearer ${context.vars.token}`,
        },
      }
    );

    context.vars.projectId = response.data.id;
    done();
  } catch (error) {
    console.error('Error creating project:', error.response?.data || error.message);
    done(error);
  }
}

module.exports = {
  getAuthToken,
  createProject,
};


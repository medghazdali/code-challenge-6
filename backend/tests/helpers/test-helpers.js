/**
 * Test helper functions for creating mock API Gateway events and other utilities
 */

/**
 * Create a mock API Gateway event with authentication
 * @param {Object} options - Event options
 * @param {string} options.userId - User ID from Cognito claims
 * @param {string} options.method - HTTP method (default: 'GET')
 * @param {string} options.path - API path (default: '/')
 * @param {Object} options.body - Request body (will be JSON stringified)
 * @param {Object} options.pathParameters - Path parameters
 * @param {Object} options.queryStringParameters - Query string parameters
 * @param {Object} options.headers - Additional headers
 * @returns {Object} Mock API Gateway event
 */
const createMockEvent = ({
  userId = 'test-user-id-123',
  method = 'GET',
  path = '/',
  body = null,
  pathParameters = null,
  queryStringParameters = null,
  headers = {},
} = {}) => {
  const event = {
    httpMethod: method,
    path: path,
    pathParameters: pathParameters,
    queryStringParameters: queryStringParameters,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : null,
    requestContext: {
      requestId: 'test-request-id',
      stage: 'test',
      authorizer: {
        claims: {
          sub: userId,
          email: 'test@example.com',
          'cognito:username': 'test@example.com',
        },
        principalId: userId,
      },
    },
    isBase64Encoded: false,
  };

  return event;
};

/**
 * Create a mock API Gateway event without authentication
 * @param {Object} options - Event options
 * @returns {Object} Mock API Gateway event without auth
 */
const createMockEventWithoutAuth = (options = {}) => {
  const event = createMockEvent(options);
  delete event.requestContext.authorizer;
  return event;
};

/**
 * Create a mock API Gateway event with X-Test-User-Id header (for local dev)
 * @param {Object} options - Event options
 * @param {string} options.testUserId - Test user ID
 * @returns {Object} Mock API Gateway event with test header
 */
const createMockEventWithTestHeader = ({ testUserId = 'test-user-id-123', ...options } = {}) => {
  const event = createMockEvent({ ...options, userId: null });
  event.headers['X-Test-User-Id'] = testUserId;
  event.requestContext.authorizer = null;
  return event;
};

/**
 * Create a mock API Gateway event with serverless-offline mock principalId
 * @param {Object} options - Event options
 * @returns {Object} Mock API Gateway event with offlineContext
 */
const createMockEventWithOfflineContext = (options = {}) => {
  const event = createMockEvent({ ...options, userId: null });
  event.requestContext.authorizer = {
    principalId: 'offlineContext_authorizer_principalId',
  };
  return event;
};

/**
 * Generate a test user ID
 * @returns {string} Test user ID
 */
const generateTestUserId = () => {
  return `test-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create mock project data
 * @param {Object} overrides - Data to override defaults
 * @returns {Object} Mock project data
 */
const createMockProject = (overrides = {}) => {
  return {
    id: 'project-id-123',
    userId: 'user-id-123',
    name: 'Test Project',
    description: 'Test project description',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
};

/**
 * Create mock task data
 * @param {Object} overrides - Data to override defaults
 * @returns {Object} Mock task data
 */
const createMockTask = (overrides = {}) => {
  return {
    id: 'task-id-123',
    projectId: 'project-id-123',
    userId: 'user-id-123',
    title: 'Test Task',
    description: 'Test task description',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
};

module.exports = {
  createMockEvent,
  createMockEventWithoutAuth,
  createMockEventWithTestHeader,
  createMockEventWithOfflineContext,
  generateTestUserId,
  createMockProject,
  createMockTask,
};


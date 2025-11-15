// Mock dependencies BEFORE requiring the handler
jest.mock('../../../../lib/dynamodb');
jest.mock('../../../../lib/auth');
jest.mock('../../../../lib/response');

const { createMockEvent } = require('../../../helpers/test-helpers');
const { createMockProject } = require('../../../helpers/test-helpers');

// Now require the mocked modules
const { createProject } = require('../../../../lib/dynamodb');
const { requireAuth } = require('../../../../lib/auth');
const { success, badRequest, error } = require('../../../../lib/response');

// Finally require the handler
const createProjectHandler = require('../../../../handlers/projects/createProject');

describe('createProject Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a project successfully', async () => {
    const userId = 'user-123';
    const event = createMockEvent({
      userId,
      method: 'POST',
      body: {
        name: 'Test Project',
        description: 'Test description',
      },
    });

    requireAuth.mockReturnValue(userId);
    const mockProject = createMockProject({ userId, name: 'Test Project' });
    createProject.mockResolvedValue(mockProject);
    success.mockReturnValue({ statusCode: 201, body: JSON.stringify(mockProject) });

    const result = await createProjectHandler.handler(event);

    expect(requireAuth).toHaveBeenCalledWith(event);
    expect(createProject).toHaveBeenCalledWith(
      expect.objectContaining({
        userId,
        name: 'Test Project',
        description: 'Test description',
      })
    );
    expect(success).toHaveBeenCalledWith(expect.objectContaining({ name: 'Test Project' }), 201);
    expect(result.statusCode).toBe(201);
  });

  it('should trim name and description', async () => {
    const userId = 'user-123';
    const event = createMockEvent({
      userId,
      method: 'POST',
      body: {
        name: '  Test Project  ',
        description: '  Test description  ',
      },
    });

    requireAuth.mockReturnValue(userId);
    const mockProject = createMockProject();
    createProject.mockResolvedValue(mockProject);
    success.mockReturnValue({ statusCode: 201 });

    await createProjectHandler.handler(event);

    expect(createProject).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Project',
        description: 'Test description',
      })
    );
  });

  it('should handle empty description', async () => {
    const userId = 'user-123';
    const event = createMockEvent({
      userId,
      method: 'POST',
      body: {
        name: 'Test Project',
      },
    });

    requireAuth.mockReturnValue(userId);
    const mockProject = createMockProject();
    createProject.mockResolvedValue(mockProject);
    success.mockReturnValue({ statusCode: 201 });

    await createProjectHandler.handler(event);

    expect(createProject).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Project',
        description: '',
      })
    );
  });

  it('should return 401 when authentication fails', async () => {
    const event = createMockEvent({ userId: null });
    const authError = new Error('Unauthorized: Authentication required');
    authError.statusCode = 401;

    requireAuth.mockImplementation(() => {
      throw authError;
    });
    error.mockReturnValue({ statusCode: 401, body: JSON.stringify({ error: 'Unauthorized: Authentication required' }) });

    const result = await createProjectHandler.handler(event);

    expect(requireAuth).toHaveBeenCalledWith(event);
    expect(error).toHaveBeenCalledWith('Unauthorized: Authentication required', 401);
    expect(result.statusCode).toBe(401);
    expect(createProject).not.toHaveBeenCalled();
  });

  it('should return 400 when name is missing', async () => {
    const userId = 'user-123';
    const event = createMockEvent({
      userId,
      method: 'POST',
      body: {
        description: 'Test description',
      },
    });

    requireAuth.mockReturnValue(userId);
    badRequest.mockReturnValue({ statusCode: 400, body: JSON.stringify({ error: 'Name is required and must be a non-empty string' }) });

    const result = await createProjectHandler.handler(event);

    expect(badRequest).toHaveBeenCalledWith('Name is required and must be a non-empty string');
    expect(result.statusCode).toBe(400);
    expect(createProject).not.toHaveBeenCalled();
  });

  it('should return 400 when name is empty string', async () => {
    const userId = 'user-123';
    const event = createMockEvent({
      userId,
      method: 'POST',
      body: {
        name: '   ',
      },
    });

    requireAuth.mockReturnValue(userId);
    badRequest.mockReturnValue({ statusCode: 400 });

    await createProjectHandler.handler(event);

    expect(badRequest).toHaveBeenCalledWith('Name is required and must be a non-empty string');
    expect(createProject).not.toHaveBeenCalled();
  });

  it('should return 400 when description is not a string', async () => {
    const userId = 'user-123';
    const event = createMockEvent({
      userId,
      method: 'POST',
      body: {
        name: 'Test Project',
        description: 123,
      },
    });

    requireAuth.mockReturnValue(userId);
    badRequest.mockReturnValue({ statusCode: 400 });

    await createProjectHandler.handler(event);

    expect(badRequest).toHaveBeenCalledWith('Description must be a string');
    expect(createProject).not.toHaveBeenCalled();
  });

  it('should return 400 when JSON is invalid', async () => {
    const userId = 'user-123';
    const event = createMockEvent({
      userId,
      method: 'POST',
    });
    event.body = 'invalid json{';

    requireAuth.mockReturnValue(userId);
    badRequest.mockReturnValue({ statusCode: 400 });

    const result = await createProjectHandler.handler(event);

    expect(badRequest).toHaveBeenCalledWith('Invalid JSON in request body');
    expect(result.statusCode).toBe(400);
  });

  it('should return 500 when DynamoDB fails', async () => {
    const userId = 'user-123';
    const event = createMockEvent({
      userId,
      method: 'POST',
      body: {
        name: 'Test Project',
      },
    });

    requireAuth.mockReturnValue(userId);
    createProject.mockRejectedValue(new Error('DynamoDB error'));
    error.mockReturnValue({ statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) });

    const result = await createProjectHandler.handler(event);

    expect(error).toHaveBeenCalledWith('Internal server error', 500);
    expect(result.statusCode).toBe(500);
  });
});


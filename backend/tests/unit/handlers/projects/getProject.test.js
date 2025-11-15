// Mock dependencies BEFORE requiring the handler
jest.mock('../../../../lib/dynamodb');
jest.mock('../../../../lib/auth');
jest.mock('../../../../lib/response');

const { createMockEvent } = require('../../../helpers/test-helpers');
const { createMockProject } = require('../../../helpers/test-helpers');

// Now require the mocked modules
const { getProjectById } = require('../../../../lib/dynamodb');
const { requireAuth } = require('../../../../lib/auth');
const { success, notFound, badRequest, error } = require('../../../../lib/response');

// Finally require the handler
const getProjectHandler = require('../../../../handlers/projects/getProject');

describe('getProject Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get a project successfully', async () => {
    const userId = 'user-123';
    const projectId = '550e8400-e29b-41d4-a716-446655440000'; // Valid UUID format
    const event = createMockEvent({
      userId,
      method: 'GET',
      pathParameters: { projectId },
    });

    requireAuth.mockReturnValue(userId);
    const mockProject = createMockProject({ id: projectId, userId });
    getProjectById.mockResolvedValue(mockProject);
    success.mockReturnValue({ statusCode: 200, body: JSON.stringify(mockProject) });

    const result = await getProjectHandler.handler(event);

    expect(requireAuth).toHaveBeenCalledWith(event);
    expect(getProjectById).toHaveBeenCalledWith(projectId);
    expect(success).toHaveBeenCalledWith(mockProject);
    expect(result.statusCode).toBe(200);
  });

  it('should return 404 when project not found', async () => {
    const userId = 'user-123';
    const projectId = '550e8400-e29b-41d4-a716-446655440000'; // Valid UUID format
    const event = createMockEvent({
      userId,
      method: 'GET',
      pathParameters: { projectId },
    });

    requireAuth.mockReturnValue(userId);
    getProjectById.mockResolvedValue(null);
    notFound.mockReturnValue({ statusCode: 404, body: JSON.stringify({ error: 'Project not found' }) });

    const result = await getProjectHandler.handler(event);

    expect(notFound).toHaveBeenCalledWith('Project not found');
    expect(result.statusCode).toBe(404);
  });

  it('should return 404 when user does not own the project', async () => {
    const userId = 'user-123';
    const otherUserId = 'other-user-456';
    const projectId = '550e8400-e29b-41d4-a716-446655440000'; // Valid UUID format
    const event = createMockEvent({
      userId,
      method: 'GET',
      pathParameters: { projectId },
    });

    requireAuth.mockReturnValue(userId);
    const mockProject = createMockProject({ id: projectId, userId: otherUserId });
    getProjectById.mockResolvedValue(mockProject);
    notFound.mockReturnValue({ statusCode: 404 });

    const result = await getProjectHandler.handler(event);

    expect(notFound).toHaveBeenCalledWith('Project not found');
    expect(result.statusCode).toBe(404);
  });

  it('should return 400 when projectId is missing', async () => {
    const userId = 'user-123';
    const event = createMockEvent({
      userId,
      method: 'GET',
    });
    event.pathParameters = null;

    requireAuth.mockReturnValue(userId);
    badRequest.mockReturnValue({ statusCode: 400 });

    const result = await getProjectHandler.handler(event);

    expect(badRequest).toHaveBeenCalledWith('Project ID is required in path parameters');
    expect(result.statusCode).toBe(400);
    expect(getProjectById).not.toHaveBeenCalled();
  });

  it('should return 400 when projectId format is invalid', async () => {
    const userId = 'user-123';
    const event = createMockEvent({
      userId,
      method: 'GET',
      pathParameters: { projectId: 'invalid-id' },
    });

    requireAuth.mockReturnValue(userId);
    badRequest.mockReturnValue({ statusCode: 400 });

    const result = await getProjectHandler.handler(event);

    expect(badRequest).toHaveBeenCalledWith('Invalid project ID format');
    expect(result.statusCode).toBe(400);
    expect(getProjectById).not.toHaveBeenCalled();
  });

  it('should return 401 when authentication fails', async () => {
    const event = createMockEvent({ userId: null });
    const authError = new Error('Unauthorized: Authentication required');
    authError.statusCode = 401;

    requireAuth.mockImplementation(() => {
      throw authError;
    });
    error.mockReturnValue({ statusCode: 401 });

    const result = await getProjectHandler.handler(event);

    expect(error).toHaveBeenCalledWith('Unauthorized: Authentication required', 401);
    expect(result.statusCode).toBe(401);
  });

  it('should return 500 when DynamoDB fails', async () => {
    const userId = 'user-123';
    const projectId = '550e8400-e29b-41d4-a716-446655440000'; // Valid UUID format
    const event = createMockEvent({
      userId,
      method: 'GET',
      pathParameters: { projectId },
    });

    requireAuth.mockReturnValue(userId);
    getProjectById.mockRejectedValue(new Error('DynamoDB error'));
    error.mockReturnValue({ statusCode: 500 });

    const result = await getProjectHandler.handler(event);

    expect(error).toHaveBeenCalledWith('Internal server error', 500);
    expect(result.statusCode).toBe(500);
  });
});


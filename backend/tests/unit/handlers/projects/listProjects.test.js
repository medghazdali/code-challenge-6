// Mock dependencies BEFORE requiring the handler
jest.mock('../../../../lib/dynamodb');
jest.mock('../../../../lib/auth');
jest.mock('../../../../lib/response');

const { createMockEvent } = require('../../../helpers/test-helpers');
const { createMockProject } = require('../../../helpers/test-helpers');

// Now require the mocked modules
const { listProjectsByUserId } = require('../../../../lib/dynamodb');
const { requireAuth } = require('../../../../lib/auth');
const { success, badRequest, error } = require('../../../../lib/response');

// Finally require the handler
const listProjectsHandler = require('../../../../handlers/projects/listProjects');

describe('listProjects Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should list projects successfully', async () => {
    const userId = 'user-123';
    const event = createMockEvent({
      userId,
      method: 'GET',
      queryStringParameters: { limit: '10' },
    });

    requireAuth.mockReturnValue(userId);
    const projects = [createMockProject({ id: 'p1' }), createMockProject({ id: 'p2' })];
    listProjectsByUserId.mockResolvedValue({ items: projects, count: 2 });
    success.mockReturnValue({ statusCode: 200, body: JSON.stringify({ projects, count: 2 }) });

    const result = await listProjectsHandler.handler(event);

    expect(requireAuth).toHaveBeenCalledWith(event);
    expect(listProjectsByUserId).toHaveBeenCalledWith(userId, 10, null);
    expect(success).toHaveBeenCalledWith(
      expect.objectContaining({
        projects,
        count: 2,
        hasMore: false,
      })
    );
    expect(result.statusCode).toBe(200);
  });

  it('should use default limit of 100 when not provided', async () => {
    const userId = 'user-123';
    const event = createMockEvent({
      userId,
      method: 'GET',
    });

    requireAuth.mockReturnValue(userId);
    listProjectsByUserId.mockResolvedValue({ items: [], count: 0 });
    success.mockReturnValue({ statusCode: 200 });

    await listProjectsHandler.handler(event);

    expect(listProjectsByUserId).toHaveBeenCalledWith(userId, 100, null);
  });

  it('should handle pagination with lastEvaluatedKey', async () => {
    const userId = 'user-123';
    const lastKey = { id: 'last-key' };
    const encodedKey = encodeURIComponent(JSON.stringify(lastKey));
    const event = createMockEvent({
      userId,
      method: 'GET',
      queryStringParameters: { lastEvaluatedKey: encodedKey },
    });

    requireAuth.mockReturnValue(userId);
    const projects = [createMockProject()];
    listProjectsByUserId.mockResolvedValue({
      items: projects,
      count: 1,
      lastEvaluatedKey: { id: 'next-key' },
    });
    success.mockReturnValue({ statusCode: 200 });

    await listProjectsHandler.handler(event);

    expect(listProjectsByUserId).toHaveBeenCalledWith(userId, 100, lastKey);
    expect(success).toHaveBeenCalledWith(
      expect.objectContaining({
        hasMore: true,
        lastEvaluatedKey: expect.any(String),
      })
    );
  });

  it('should return 400 when limit is invalid', async () => {
    const userId = 'user-123';
    const event = createMockEvent({
      userId,
      method: 'GET',
      queryStringParameters: { limit: 'invalid' },
    });

    requireAuth.mockReturnValue(userId);
    badRequest.mockReturnValue({ statusCode: 400 });

    const result = await listProjectsHandler.handler(event);

    expect(badRequest).toHaveBeenCalledWith('Limit must be a number between 1 and 1000');
    expect(result.statusCode).toBe(400);
    expect(listProjectsByUserId).not.toHaveBeenCalled();
  });

  it('should return 400 when limit is less than 1', async () => {
    const userId = 'user-123';
    const event = createMockEvent({
      userId,
      method: 'GET',
      queryStringParameters: { limit: '0' },
    });

    requireAuth.mockReturnValue(userId);
    badRequest.mockReturnValue({ statusCode: 400 });

    await listProjectsHandler.handler(event);

    expect(badRequest).toHaveBeenCalledWith('Limit must be a number between 1 and 1000');
  });

  it('should return 400 when limit is greater than 1000', async () => {
    const userId = 'user-123';
    const event = createMockEvent({
      userId,
      method: 'GET',
      queryStringParameters: { limit: '1001' },
    });

    requireAuth.mockReturnValue(userId);
    badRequest.mockReturnValue({ statusCode: 400 });

    await listProjectsHandler.handler(event);

    expect(badRequest).toHaveBeenCalledWith('Limit must be a number between 1 and 1000');
  });

  it('should return 401 when authentication fails', async () => {
    const event = createMockEvent({ userId: null });
    const authError = new Error('Unauthorized: Authentication required');
    authError.statusCode = 401;

    requireAuth.mockImplementation(() => {
      throw authError;
    });
    error.mockReturnValue({ statusCode: 401 });

    const result = await listProjectsHandler.handler(event);

    expect(error).toHaveBeenCalledWith('Unauthorized: Authentication required', 401);
    expect(result.statusCode).toBe(401);
  });

  it('should return 500 when DynamoDB fails', async () => {
    const userId = 'user-123';
    const event = createMockEvent({
      userId,
      method: 'GET',
    });

    requireAuth.mockReturnValue(userId);
    listProjectsByUserId.mockRejectedValue(new Error('DynamoDB error'));
    error.mockReturnValue({ statusCode: 500 });

    const result = await listProjectsHandler.handler(event);

    expect(error).toHaveBeenCalledWith('Internal server error', 500);
    expect(result.statusCode).toBe(500);
  });
});


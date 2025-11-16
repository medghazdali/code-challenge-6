// Mock dependencies BEFORE requiring the handler
jest.mock('../../../../lib/dynamodb');
jest.mock('../../../../lib/auth');
jest.mock('../../../../lib/response');

const { createMockEvent } = require('../../../helpers/test-helpers');
const { createMockProject } = require('../../../helpers/test-helpers');

// Now require the mocked modules
const { deleteProject, getProjectById } = require('../../../../lib/dynamodb');
const { requireAuth } = require('../../../../lib/auth');
const { notFound, badRequest, error } = require('../../../../lib/response');

// Finally require the handler
const deleteProjectHandler = require('../../../../handlers/projects/deleteProject');

describe('deleteProject Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete a project successfully', async () => {
    const userId = 'user-123';
    const projectId = '550e8400-e29b-41d4-a716-446655440000'; // Valid UUID format
    const event = createMockEvent({
      userId,
      method: 'DELETE',
      pathParameters: { projectId },
    });

    requireAuth.mockReturnValue(userId);
    const existingProject = createMockProject({ id: projectId, userId });
    const deletedProject = createMockProject({ id: projectId, userId });
    getProjectById.mockResolvedValue(existingProject);
    deleteProject.mockResolvedValue(deletedProject);

    const result = await deleteProjectHandler.handler(event);

    expect(requireAuth).toHaveBeenCalledWith(event);
    expect(getProjectById).toHaveBeenCalledWith(projectId);
    expect(deleteProject).toHaveBeenCalledWith(projectId);
    expect(result.statusCode).toBe(204);
    expect(result.body).toBe('');
  });

  it('should return 404 when project not found', async () => {
    const userId = 'user-123';
    const projectId = '550e8400-e29b-41d4-a716-446655440000'; // Valid UUID format
    const event = createMockEvent({
      userId,
      method: 'DELETE',
      pathParameters: { projectId },
    });

    requireAuth.mockReturnValue(userId);
    getProjectById.mockResolvedValue(null);
    notFound.mockReturnValue({ statusCode: 404 });

    const result = await deleteProjectHandler.handler(event);

    expect(notFound).toHaveBeenCalledWith('Project not found');
    expect(result.statusCode).toBe(404);
    expect(deleteProject).not.toHaveBeenCalled();
  });

  it('should return 404 when user does not own the project', async () => {
    const userId = 'user-123';
    const otherUserId = 'other-user-456';
    const projectId = '550e8400-e29b-41d4-a716-446655440000'; // Valid UUID format
    const event = createMockEvent({
      userId,
      method: 'DELETE',
      pathParameters: { projectId },
    });

    requireAuth.mockReturnValue(userId);
    const existingProject = createMockProject({ id: projectId, userId: otherUserId });
    getProjectById.mockResolvedValue(existingProject);
    notFound.mockReturnValue({ statusCode: 404 });

    const result = await deleteProjectHandler.handler(event);

    expect(notFound).toHaveBeenCalledWith('Project not found');
    expect(result.statusCode).toBe(404);
    expect(deleteProject).not.toHaveBeenCalled();
  });

  it('should return 404 when deleteProject returns null', async () => {
    const userId = 'user-123';
    const projectId = '550e8400-e29b-41d4-a716-446655440000'; // Valid UUID format
    const event = createMockEvent({
      userId,
      method: 'DELETE',
      pathParameters: { projectId },
    });

    requireAuth.mockReturnValue(userId);
    const existingProject = createMockProject({ id: projectId, userId });
    getProjectById.mockResolvedValue(existingProject);
    deleteProject.mockResolvedValue(null);
    notFound.mockReturnValue({ statusCode: 404 });

    const result = await deleteProjectHandler.handler(event);

    expect(notFound).toHaveBeenCalledWith('Project not found');
    expect(result.statusCode).toBe(404);
  });

  it('should return 400 when projectId is missing', async () => {
    const userId = 'user-123';
    const event = createMockEvent({
      userId,
      method: 'DELETE',
    });
    event.pathParameters = null;

    requireAuth.mockReturnValue(userId);
    badRequest.mockReturnValue({ statusCode: 400 });

    const result = await deleteProjectHandler.handler(event);

    expect(badRequest).toHaveBeenCalledWith('Project ID is required in path parameters');
    expect(result.statusCode).toBe(400);
    expect(getProjectById).not.toHaveBeenCalled();
  });

  it('should return 400 when projectId format is invalid', async () => {
    const userId = 'user-123';
    const event = createMockEvent({
      userId,
      method: 'DELETE',
      pathParameters: { projectId: 'invalid-id' },
    });

    requireAuth.mockReturnValue(userId);
    badRequest.mockReturnValue({ statusCode: 400 });

    const result = await deleteProjectHandler.handler(event);

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

    const result = await deleteProjectHandler.handler(event);

    expect(error).toHaveBeenCalledWith('Unauthorized: Authentication required', 401);
    expect(result.statusCode).toBe(401);
  });

  it('should return 500 when DynamoDB fails', async () => {
    const userId = 'user-123';
    const projectId = '550e8400-e29b-41d4-a716-446655440000'; // Valid UUID format
    const event = createMockEvent({
      userId,
      method: 'DELETE',
      pathParameters: { projectId },
    });

    requireAuth.mockReturnValue(userId);
    const existingProject = createMockProject({ id: projectId, userId });
    getProjectById.mockResolvedValue(existingProject);
    deleteProject.mockRejectedValue(new Error('DynamoDB error'));
    error.mockReturnValue({ statusCode: 500 });

    const result = await deleteProjectHandler.handler(event);

    expect(error).toHaveBeenCalledWith('Internal server error', 500);
    expect(result.statusCode).toBe(500);
  });
});


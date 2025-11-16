// Mock dependencies BEFORE requiring the handler
jest.mock('../../../../lib/dynamodb');
jest.mock('../../../../lib/auth');
jest.mock('../../../../lib/response');

const { createMockEvent } = require('../../../helpers/test-helpers');
const { createMockProject } = require('../../../helpers/test-helpers');

// Now require the mocked modules
const { updateProject, getProjectById } = require('../../../../lib/dynamodb');
const { requireAuth } = require('../../../../lib/auth');
const { success, notFound, badRequest, error } = require('../../../../lib/response');

// Finally require the handler
const updateProjectHandler = require('../../../../handlers/projects/updateProject');

describe('updateProject Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update a project successfully', async () => {
    const userId = 'user-123';
    const projectId = '550e8400-e29b-41d4-a716-446655440000'; // Valid UUID format
    const event = createMockEvent({
      userId,
      method: 'PUT',
      pathParameters: { projectId },
      body: {
        name: 'Updated Name',
        description: 'Updated description',
      },
    });

    requireAuth.mockReturnValue(userId);
    const existingProject = createMockProject({ id: projectId, userId });
    const updatedProject = createMockProject({ id: projectId, userId, name: 'Updated Name' });
    getProjectById.mockResolvedValueOnce(existingProject);
    updateProject.mockResolvedValue(updatedProject);
    success.mockReturnValue({ statusCode: 200, body: JSON.stringify(updatedProject) });

    const result = await updateProjectHandler.handler(event);

    expect(requireAuth).toHaveBeenCalledWith(event);
    expect(getProjectById).toHaveBeenCalledWith(projectId);
    expect(updateProject).toHaveBeenCalledWith(projectId, {
      name: 'Updated Name',
      description: 'Updated description',
    });
    expect(success).toHaveBeenCalledWith(updatedProject);
    expect(result.statusCode).toBe(200);
  });

  it('should update only name when provided', async () => {
    const userId = 'user-123';
    const projectId = '550e8400-e29b-41d4-a716-446655440000'; // Valid UUID format
    const event = createMockEvent({
      userId,
      method: 'PUT',
      pathParameters: { projectId },
      body: {
        name: 'Updated Name',
      },
    });

    requireAuth.mockReturnValue(userId);
    const existingProject = createMockProject({ id: projectId, userId });
    const updatedProject = createMockProject({ id: projectId, userId, name: 'Updated Name' });
    getProjectById.mockResolvedValueOnce(existingProject);
    updateProject.mockResolvedValue(updatedProject);
    success.mockReturnValue({ statusCode: 200 });

    await updateProjectHandler.handler(event);

    expect(updateProject).toHaveBeenCalledWith(projectId, { name: 'Updated Name' });
  });

  it('should return 404 when project not found', async () => {
    const userId = 'user-123';
    const projectId = '550e8400-e29b-41d4-a716-446655440000'; // Valid UUID format
    const event = createMockEvent({
      userId,
      method: 'PUT',
      pathParameters: { projectId },
      body: { name: 'Updated Name' },
    });

    requireAuth.mockReturnValue(userId);
    getProjectById.mockResolvedValue(null);
    notFound.mockReturnValue({ statusCode: 404 });

    const result = await updateProjectHandler.handler(event);

    expect(notFound).toHaveBeenCalledWith('Project not found');
    expect(result.statusCode).toBe(404);
    expect(updateProject).not.toHaveBeenCalled();
  });

  it('should return 404 when user does not own the project', async () => {
    const userId = 'user-123';
    const otherUserId = 'other-user-456';
    const projectId = '550e8400-e29b-41d4-a716-446655440000'; // Valid UUID format
    const event = createMockEvent({
      userId,
      method: 'PUT',
      pathParameters: { projectId },
      body: { name: 'Updated Name' },
    });

    requireAuth.mockReturnValue(userId);
    const existingProject = createMockProject({ id: projectId, userId: otherUserId });
    getProjectById.mockResolvedValue(existingProject);
    notFound.mockReturnValue({ statusCode: 404 });

    const result = await updateProjectHandler.handler(event);

    expect(notFound).toHaveBeenCalledWith('Project not found');
    expect(result.statusCode).toBe(404);
    expect(updateProject).not.toHaveBeenCalled();
  });

  it('should return 400 when no fields provided for update', async () => {
    const userId = 'user-123';
    const projectId = '550e8400-e29b-41d4-a716-446655440000'; // Valid UUID format
    const event = createMockEvent({
      userId,
      method: 'PUT',
      pathParameters: { projectId },
      body: {},
    });

    requireAuth.mockReturnValue(userId);
    const existingProject = createMockProject({ id: projectId, userId });
    getProjectById.mockResolvedValue(existingProject);
    badRequest.mockReturnValue({ statusCode: 400 });

    const result = await updateProjectHandler.handler(event);

    expect(badRequest).toHaveBeenCalledWith('At least one field (name or description) must be provided for update');
    expect(result.statusCode).toBe(400);
    expect(updateProject).not.toHaveBeenCalled();
  });

  it('should return 400 when name is empty string', async () => {
    const userId = 'user-123';
    const projectId = '550e8400-e29b-41d4-a716-446655440000'; // Valid UUID format
    const event = createMockEvent({
      userId,
      method: 'PUT',
      pathParameters: { projectId },
      body: { name: '   ' },
    });

    requireAuth.mockReturnValue(userId);
    const existingProject = createMockProject({ id: projectId, userId });
    getProjectById.mockResolvedValue(existingProject);
    badRequest.mockReturnValue({ statusCode: 400 });

    await updateProjectHandler.handler(event);

    expect(badRequest).toHaveBeenCalledWith('Name must be a non-empty string');
  });

  it('should return 400 when description is not a string', async () => {
    const userId = 'user-123';
    const projectId = '550e8400-e29b-41d4-a716-446655440000'; // Valid UUID format
    const event = createMockEvent({
      userId,
      method: 'PUT',
      pathParameters: { projectId },
      body: { description: 123 },
    });

    requireAuth.mockReturnValue(userId);
    const existingProject = createMockProject({ id: projectId, userId });
    getProjectById.mockResolvedValue(existingProject);
    badRequest.mockReturnValue({ statusCode: 400 });

    await updateProjectHandler.handler(event);

    expect(badRequest).toHaveBeenCalledWith('Description must be a string');
  });

  it('should return 401 when authentication fails', async () => {
    const event = createMockEvent({ userId: null });
    const authError = new Error('Unauthorized: Authentication required');
    authError.statusCode = 401;

    requireAuth.mockImplementation(() => {
      throw authError;
    });
    error.mockReturnValue({ statusCode: 401 });

    const result = await updateProjectHandler.handler(event);

    expect(error).toHaveBeenCalledWith('Unauthorized: Authentication required', 401);
    expect(result.statusCode).toBe(401);
  });
});


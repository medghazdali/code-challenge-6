const { v4: uuidv4 } = require('uuid');
const { createTask, getProjectById } = require('../lib/dynamodb');
const { requireAuth } = require('../lib/auth');
const { success, badRequest, error } = require('../lib/response');

exports.handler = async (event) => {
  try {
    // Require authentication
    const userId = requireAuth(event);

    // Extract projectId from path parameters
    const projectId = event.pathParameters?.projectId;

    if (!projectId) {
      return badRequest('Project ID is required in path parameters');
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(projectId)) {
      return badRequest('Invalid project ID format');
    }

    // Verify project exists and user owns it
    const project = await getProjectById(projectId);
    if (!project) {
      return badRequest('Project not found');
    }
    if (project.userId !== userId) {
      return badRequest('Project not found');
    }

    // Parse request body
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch (parseError) {
      return badRequest('Invalid JSON in request body');
    }

    // Validate required fields
    const { title, description, status } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return badRequest('Title is required and must be a non-empty string');
    }

    if (description !== undefined && typeof description !== 'string') {
      return badRequest('Description must be a string');
    }

    if (status && !['pending', 'in-progress', 'completed'].includes(status)) {
      return badRequest('Status must be one of: pending, in-progress, completed');
    }

    // Generate task ID and timestamps
    const taskId = uuidv4();
    const now = new Date().toISOString();

    // Create task object
    const taskData = {
      id: taskId,
      projectId: projectId,
      userId: userId,
      title: title.trim(),
      description: description ? description.trim() : '',
      status: status || 'pending',
      createdAt: now,
      updatedAt: now,
    };

    // Create task in DynamoDB
    const createdTask = await createTask(taskData);

    return success(createdTask, 201);
  } catch (err) {
    console.error('Error in createTask handler:', err);
    if (err.message === 'Unauthorized: Authentication required') {
      return error('Unauthorized: Authentication required', 401);
    }
    return error('Internal server error', 500);
  }
};


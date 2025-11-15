const { v4: uuidv4 } = require('uuid');
const { createTask } = require('../lib/dynamodb');
const { success, badRequest, error } = require('../lib/response');

exports.handler = async (event) => {
  try {
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

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return badRequest('Description is required and must be a non-empty string');
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
      title: title.trim(),
      description: description.trim(),
      status: status || 'pending',
      createdAt: now,
      updatedAt: now,
    };

    // Create task in DynamoDB
    const createdTask = await createTask(taskData);

    return success(createdTask, 201);
  } catch (err) {
    console.error('Error in createTask handler:', err);
    return error('Internal server error', 500);
  }
};


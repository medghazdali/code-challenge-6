const { updateTask, getTaskById } = require('../lib/dynamodb');
const { success, notFound, badRequest, error } = require('../lib/response');

exports.handler = async (event) => {
  try {
    // Extract task ID from path parameters
    const taskId = event.pathParameters?.id;

    if (!taskId) {
      return badRequest('Task ID is required in path parameters');
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(taskId)) {
      return badRequest('Invalid task ID format');
    }

    // Parse request body
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch (parseError) {
      return badRequest('Invalid JSON in request body');
    }

    // Check if task exists
    const existingTask = await getTaskById(taskId);
    if (!existingTask) {
      return notFound('Task not found');
    }

    // Validate update fields
    const allowedFields = ['title', 'description', 'status'];
    const updateData = {};

    if (body.title !== undefined) {
      if (typeof body.title !== 'string' || body.title.trim().length === 0) {
        return badRequest('Title must be a non-empty string');
      }
      updateData.title = body.title.trim();
    }

    if (body.description !== undefined) {
      if (typeof body.description !== 'string' || body.description.trim().length === 0) {
        return badRequest('Description must be a non-empty string');
      }
      updateData.description = body.description.trim();
    }

    if (body.status !== undefined) {
      if (!['pending', 'in-progress', 'completed'].includes(body.status)) {
        return badRequest('Status must be one of: pending, in-progress, completed');
      }
      updateData.status = body.status;
    }

    // Check if there are any fields to update
    if (Object.keys(updateData).length === 0) {
      return badRequest('At least one field (title, description, or status) must be provided for update');
    }

    // Update task in DynamoDB
    const updatedTask = await updateTask(taskId, updateData);

    if (!updatedTask) {
      return notFound('Task not found');
    }

    return success(updatedTask);
  } catch (err) {
    console.error('Error in updateTask handler:', err);
    return error('Internal server error', 500);
  }
};


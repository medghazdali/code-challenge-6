const { getTaskById } = require('../lib/dynamodb');
const { requireAuth } = require('../lib/auth');
const { success, notFound, badRequest, error } = require('../lib/response');

exports.handler = async (event) => {
  try {
    // Require authentication
    const userId = requireAuth(event);

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

    // Get task from DynamoDB
    const task = await getTaskById(taskId);

    if (!task) {
      return notFound('Task not found');
    }

    // Verify user owns this task
    if (task.userId !== userId) {
      return notFound('Task not found');
    }

    return success(task);
  } catch (err) {
    console.error('Error in getTask handler:', err);
    if (err.message === 'Unauthorized: Authentication required') {
      return error('Unauthorized: Authentication required', 401);
    }
    return error('Internal server error', 500);
  }
};


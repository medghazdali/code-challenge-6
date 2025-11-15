const { getTaskById } = require('../lib/dynamodb');
const { success, notFound, badRequest, error } = require('../lib/response');

exports.handler = async (event) => {
  try {
    // Extract task ID from path parameters
    const taskId = event.pathParameters?.id;

    if (!taskId) {
      return badRequest('Task ID is required in path parameters');
    }

    // Validate UUID format (basic check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(taskId)) {
      return badRequest('Invalid task ID format');
    }

    // Get task from DynamoDB
    const task = await getTaskById(taskId);

    if (!task) {
      return notFound('Task not found');
    }

    return success(task);
  } catch (err) {
    console.error('Error in getTask handler:', err);
    return error('Internal server error', 500);
  }
};


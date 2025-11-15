const { deleteTask } = require('../lib/dynamodb');
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

    // Delete task from DynamoDB
    const deletedTask = await deleteTask(taskId);

    if (!deletedTask) {
      return notFound('Task not found');
    }

    // Return 204 No Content on success
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      },
      body: '',
    };
  } catch (err) {
    console.error('Error in deleteTask handler:', err);
    return error('Internal server error', 500);
  }
};


const { listTasksByProjectId } = require('../lib/dynamodb');
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

    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    const limit = queryParams.limit ? parseInt(queryParams.limit, 10) : 100;
    const lastEvaluatedKey = queryParams.lastEvaluatedKey
      ? JSON.parse(decodeURIComponent(queryParams.lastEvaluatedKey))
      : null;

    // Validate limit
    if (isNaN(limit) || limit < 1 || limit > 1000) {
      return badRequest('Limit must be a number between 1 and 1000');
    }

    // Get tasks from DynamoDB (filtered by projectId, which already ensures user ownership)
    const result = await listTasksByProjectId(projectId, limit, lastEvaluatedKey);

    // Filter by userId to ensure security (double check)
    const userTasks = result.items.filter(task => task.userId === userId);

    // Build response
    const response = {
      tasks: userTasks,
      count: userTasks.length,
    };

    // Include pagination token if there are more items
    if (result.lastEvaluatedKey) {
      response.lastEvaluatedKey = encodeURIComponent(
        JSON.stringify(result.lastEvaluatedKey)
      );
      response.hasMore = true;
    } else {
      response.hasMore = false;
    }

    return success(response);
  } catch (err) {
    console.error('Error in listTasks handler:', err);
    if (err.message === 'Unauthorized: Authentication required') {
      return error('Unauthorized: Authentication required', 401);
    }
    return error('Internal server error', 500);
  }
};


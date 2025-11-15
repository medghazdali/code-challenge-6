const { listProjectsByUserId } = require('../../lib/dynamodb');
const { requireAuth } = require('../../lib/auth');
const { success, badRequest, error } = require('../../lib/response');

exports.handler = async (event) => {
  try {
    // Require authentication
    const userId = requireAuth(event);

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

    // Get projects from DynamoDB (filtered by userId)
    const result = await listProjectsByUserId(userId, limit, lastEvaluatedKey);

    // Build response
    const response = {
      projects: result.items,
      count: result.count,
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
    console.error('Error in listProjects handler:', err);
    if (err.message === 'Unauthorized: Authentication required') {
      return error('Unauthorized: Authentication required', 401);
    }
    return error('Internal server error', 500);
  }
};


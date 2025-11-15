const { listTasks } = require('../lib/dynamodb');
const { success, badRequest, error } = require('../lib/response');

exports.handler = async (event) => {
  try {
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

    // Get tasks from DynamoDB
    const result = await listTasks(limit, lastEvaluatedKey);

    // Build response
    const response = {
      tasks: result.items,
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
    console.error('Error in listTasks handler:', err);
    return error('Internal server error', 500);
  }
};


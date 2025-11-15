const { getProjectById } = require('../../lib/dynamodb');
const { requireAuth } = require('../../lib/auth');
const { success, notFound, badRequest, error } = require('../../lib/response');

exports.handler = async (event) => {
  try {
    // Require authentication
    const userId = requireAuth(event);

    // Extract project ID from path parameters
    const projectId = event.pathParameters?.projectId;

    if (!projectId) {
      return badRequest('Project ID is required in path parameters');
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(projectId)) {
      return badRequest('Invalid project ID format');
    }

    // Get project from DynamoDB
    const project = await getProjectById(projectId);

    if (!project) {
      return notFound('Project not found');
    }

    // Verify user owns this project
    if (project.userId !== userId) {
      return notFound('Project not found');
    }

    return success(project);
  } catch (err) {
    console.error('Error in getProject handler:', err);
    if (err.message === 'Unauthorized: Authentication required') {
      return error('Unauthorized: Authentication required', 401);
    }
    return error('Internal server error', 500);
  }
};


const { deleteProject, getProjectById } = require('../../lib/dynamodb');
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

    // Check if project exists and user owns it
    const existingProject = await getProjectById(projectId);
    if (!existingProject) {
      return notFound('Project not found');
    }

    if (existingProject.userId !== userId) {
      return notFound('Project not found');
    }

    // Delete project from DynamoDB
    const deletedProject = await deleteProject(projectId);

    if (!deletedProject) {
      return notFound('Project not found');
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
    console.error('Error in deleteProject handler:', err);
    if (err.message === 'Unauthorized: Authentication required') {
      return error('Unauthorized: Authentication required', 401);
    }
    return error('Internal server error', 500);
  }
};


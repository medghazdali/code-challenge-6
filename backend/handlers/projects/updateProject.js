const { updateProject, getProjectById } = require('../../lib/dynamodb');
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

    // Parse request body
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch (parseError) {
      return badRequest('Invalid JSON in request body');
    }

    // Check if project exists and user owns it
    const existingProject = await getProjectById(projectId);
    if (!existingProject) {
      return notFound('Project not found');
    }

    if (existingProject.userId !== userId) {
      return notFound('Project not found');
    }

    // Validate update fields
    const updateData = {};

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim().length === 0) {
        return badRequest('Name must be a non-empty string');
      }
      updateData.name = body.name.trim();
    }

    if (body.description !== undefined) {
      if (typeof body.description !== 'string') {
        return badRequest('Description must be a string');
      }
      updateData.description = body.description.trim();
    }

    // Check if there are any fields to update
    if (Object.keys(updateData).length === 0) {
      return badRequest('At least one field (name or description) must be provided for update');
    }

    // Update project in DynamoDB
    const updatedProject = await updateProject(projectId, updateData);

    if (!updatedProject) {
      return notFound('Project not found');
    }

    return success(updatedProject);
  } catch (err) {
    console.error('Error in updateProject handler:', err);
    if (err.message === 'Unauthorized: Authentication required') {
      return error('Unauthorized: Authentication required', 401);
    }
    return error('Internal server error', 500);
  }
};


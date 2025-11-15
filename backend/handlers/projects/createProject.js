const { v4: uuidv4 } = require('uuid');
const { createProject } = require('../../lib/dynamodb');
const { requireAuth } = require('../../lib/auth');
const { success, badRequest, error } = require('../../lib/response');

exports.handler = async (event) => {
  try {
    // Require authentication - MUST be first thing we do
    let userId;
    try {
      userId = requireAuth(event);
    } catch (authError) {
      // Explicitly catch auth errors and return 401
      console.error('❌ Authentication error:', authError.message);
      return error('Unauthorized: Authentication required', 401);
    }
    
    // If we get here, userId is valid
    console.log('✅ Authenticated user:', userId);

    // Parse request body
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch (parseError) {
      return badRequest('Invalid JSON in request body');
    }

    // Validate required fields
    const { name, description } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return badRequest('Name is required and must be a non-empty string');
    }

    if (description && typeof description !== 'string') {
      return badRequest('Description must be a string');
    }

    // Generate project ID and timestamps
    const projectId = uuidv4();
    const now = new Date().toISOString();

    // Create project object
    const projectData = {
      id: projectId,
      userId: userId,
      name: name.trim(),
      description: description ? description.trim() : '',
      createdAt: now,
      updatedAt: now,
    };

    // Create project in DynamoDB
    const createdProject = await createProject(projectData);

    return success(createdProject, 201);
  } catch (err) {
    console.error('Error in createProject handler:', err);
    if (err.message === 'Unauthorized: Authentication required') {
      return error('Unauthorized: Authentication required', 401);
    }
    return error('Internal server error', 500);
  }
};


const { refreshToken } = require('../../lib/cognito');
const { success, badRequest, error } = require('../../lib/response');

exports.handler = async (event) => {
  try {
    // Parse request body
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch (parseError) {
      return badRequest('Invalid JSON in request body');
    }

    // Validate required fields
    const { refreshToken: refreshTokenValue } = body;

    if (!refreshTokenValue || typeof refreshTokenValue !== 'string') {
      return badRequest('Refresh token is required');
    }

    // Refresh token
    const result = await refreshToken(refreshTokenValue);

    return success({
      accessToken: result.accessToken,
      idToken: result.idToken,
      expiresIn: result.expiresIn,
    });
  } catch (err) {
    console.error('Error in refreshToken handler:', err);
    
    // Handle Cognito-specific errors
    if (err.name === 'NotAuthorizedException') {
      return badRequest('Invalid refresh token');
    }

    return error('Internal server error', 500);
  }
};


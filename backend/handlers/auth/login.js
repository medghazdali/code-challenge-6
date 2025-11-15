const { login } = require('../../lib/cognito');
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
    const { email, password } = body;

    if (!email || typeof email !== 'string') {
      return badRequest('Email is required');
    }

    if (!password || typeof password !== 'string') {
      return badRequest('Password is required');
    }

    // Login user
    const result = await login(email.trim().toLowerCase(), password);

    return success({
      accessToken: result.accessToken,
      idToken: result.idToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
    });
  } catch (err) {
    console.error('Error in login handler:', err);
    
    // Handle Cognito-specific errors
    // For security, return the same generic message for both invalid credentials and user not found
    if (err.name === 'NotAuthorizedException' || err.name === 'UserNotFoundException') {
      return badRequest('Incorrect email or password');
    }
    if (err.name === 'UserNotConfirmedException') {
      return badRequest('User is not confirmed. Please check your email for confirmation code.');
    }

    return error('Internal server error', 500);
  }
};


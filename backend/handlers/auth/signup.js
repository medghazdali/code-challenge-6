const { signUp } = require('../../lib/cognito');
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
    const { email, password, name } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return badRequest('Valid email is required');
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return badRequest('Password must be at least 8 characters long');
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return badRequest('Name is required');
    }

    // Sign up user
    const result = await signUp(email.trim().toLowerCase(), password, name.trim());

    return success({
      message: 'User registered successfully. Please check your email for confirmation code.',
      userSub: result.userSub,
      codeDeliveryDetails: result.codeDeliveryDetails,
    }, 201);
  } catch (err) {
    console.error('Error in signup handler:', err);
    
    // Handle Cognito-specific errors
    if (err.name === 'UsernameExistsException') {
      return badRequest('User with this email already exists');
    }
    if (err.name === 'InvalidPasswordException') {
      return badRequest('Password does not meet requirements');
    }
    if (err.name === 'InvalidParameterException') {
      return badRequest(err.message || 'Invalid parameters');
    }

    return error('Internal server error', 500);
  }
};


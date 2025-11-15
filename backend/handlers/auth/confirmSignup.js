const { confirmSignUp } = require('../../lib/cognito');
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
    const { email, confirmationCode } = body;

    if (!email || typeof email !== 'string') {
      return badRequest('Email is required');
    }

    if (!confirmationCode || typeof confirmationCode !== 'string') {
      return badRequest('Confirmation code is required');
    }

    // Confirm signup
    await confirmSignUp(email.trim().toLowerCase(), confirmationCode.trim());

    return success({
      message: 'User confirmed successfully. You can now login.',
    });
  } catch (err) {
    console.error('Error in confirmSignup handler:', err);
    
    // Handle Cognito-specific errors
    if (err.name === 'CodeMismatchException') {
      return badRequest('Invalid confirmation code');
    }
    if (err.name === 'ExpiredCodeException') {
      return badRequest('Confirmation code has expired');
    }
    if (err.name === 'UserNotFoundException') {
      return badRequest('User not found');
    }
    if (err.name === 'NotAuthorizedException') {
      return badRequest('User is already confirmed');
    }

    return error('Internal server error', 500);
  }
};


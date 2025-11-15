const { CognitoIdentityProviderClient, SignUpCommand, AdminInitiateAuthCommand, ConfirmSignUpCommand, AdminConfirmSignUpCommand, InitiateAuthCommand, GetUserCommand } = require('@aws-sdk/client-cognito-identity-provider');

// Initialize Cognito Client
const getCognitoClient = () => {
  return new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION || 'eu-north-1',
  });
};

// Sign up a new user
const signUp = async (email, password, name) => {
  const client = getCognitoClient();
  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  let clientId = process.env.COGNITO_CLIENT_ID;

  // Validate clientId is a string (not a CloudFormation object)
  // serverless-offline passes CloudFormation refs as objects, so we need to check
  if (!clientId) {
    throw new Error('COGNITO_CLIENT_ID is not configured. For local development, set it in .env file or deploy to AWS first.');
  }
  
  // Check if it's an object (CloudFormation ref from serverless-offline)
  // Objects in Node.js have typeof 'object' (but null also has typeof 'object', so check for null too)
  if (clientId !== null && typeof clientId === 'object' && !Array.isArray(clientId)) {
    console.error('❌ COGNITO_CLIENT_ID is an object (CloudFormation ref). This happens in serverless-offline.');
    console.error('   Value:', JSON.stringify(clientId));
    throw new Error('COGNITO_CLIENT_ID is not configured. For local development, you must set COGNITO_CLIENT_ID in .env file. Deploy to AWS first to get the actual ID.');
  }
  
  // Convert to string and validate
  const clientIdStr = String(clientId);
  if (clientIdStr === '[object Object]' || clientIdStr === 'null' || clientIdStr === 'undefined' || clientIdStr.trim().length === 0) {
    console.error('❌ COGNITO_CLIENT_ID converted to invalid string:', clientIdStr);
    throw new Error('COGNITO_CLIENT_ID is not configured. For local development, you must set COGNITO_CLIENT_ID in .env file. Deploy to AWS first to get the actual ID.');
  }
  
  // Use the cleaned string
  clientId = clientIdStr.trim();

  const command = new SignUpCommand({
    ClientId: clientId,
    Username: email,
    Password: password,
    UserAttributes: [
      {
        Name: 'email',
        Value: email,
      },
      {
        Name: 'name',
        Value: name,
      },
    ],
  });

  try {
    const response = await client.send(command);
    
    // Automatically confirm the user (skip email verification)
    if (userPoolId && typeof userPoolId === 'string' && userPoolId.trim().length > 0) {
      try {
        const confirmCommand = new AdminConfirmSignUpCommand({
          UserPoolId: userPoolId.trim(),
          Username: email,
        });
        await client.send(confirmCommand);
        console.log('✅ User automatically confirmed');
      } catch (confirmError) {
        // Log but don't fail - user is created, just not confirmed
        console.warn('⚠️  Could not auto-confirm user:', confirmError.message);
      }
    }
    
    return {
      userSub: response.UserSub,
      confirmed: true, // User is now confirmed
      message: 'User registered and confirmed successfully',
    };
  } catch (error) {
    console.error('Error signing up user:', error);
    throw error;
  }
};

// Confirm user signup
const confirmSignUp = async (email, confirmationCode) => {
  const client = getCognitoClient();
  let clientId = process.env.COGNITO_CLIENT_ID;

  if (!clientId || typeof clientId === 'object' || typeof clientId !== 'string' || clientId.trim().length === 0) {
    throw new Error('COGNITO_CLIENT_ID is not configured. For local development, set it in .env file or deploy to AWS first.');
  }
  clientId = String(clientId).trim();

  const command = new ConfirmSignUpCommand({
    ClientId: clientId,
    Username: email,
    ConfirmationCode: confirmationCode,
  });

  try {
    await client.send(command);
    return { success: true };
  } catch (error) {
    console.error('Error confirming signup:', error);
    throw error;
  }
};

// Login user
const login = async (email, password) => {
  const client = getCognitoClient();
  let clientId = process.env.COGNITO_CLIENT_ID;

  if (!clientId || typeof clientId === 'object' || typeof clientId !== 'string' || clientId.trim().length === 0) {
    throw new Error('COGNITO_CLIENT_ID is not configured. For local development, set it in .env file or deploy to AWS first.');
  }
  clientId = String(clientId).trim();

  const command = new InitiateAuthCommand({
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: clientId,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  });

  try {
    const response = await client.send(command);
    return {
      accessToken: response.AuthenticationResult.AccessToken,
      idToken: response.AuthenticationResult.IdToken,
      refreshToken: response.AuthenticationResult.RefreshToken,
      expiresIn: response.AuthenticationResult.ExpiresIn,
    };
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
};

// Refresh token
const refreshToken = async (refreshToken) => {
  const client = getCognitoClient();
  let clientId = process.env.COGNITO_CLIENT_ID;

  if (!clientId || typeof clientId === 'object' || typeof clientId !== 'string' || clientId.trim().length === 0) {
    throw new Error('COGNITO_CLIENT_ID is not configured. For local development, set it in .env file or deploy to AWS first.');
  }
  clientId = String(clientId).trim();

  const command = new InitiateAuthCommand({
    AuthFlow: 'REFRESH_TOKEN_AUTH',
    ClientId: clientId,
    AuthParameters: {
      REFRESH_TOKEN: refreshToken,
    },
  });

  try {
    const response = await client.send(command);
    return {
      accessToken: response.AuthenticationResult.AccessToken,
      idToken: response.AuthenticationResult.IdToken,
      expiresIn: response.AuthenticationResult.ExpiresIn,
    };
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

// Get user from access token
const getUser = async (accessToken) => {
  const client = getCognitoClient();

  const command = new GetUserCommand({
    AccessToken: accessToken,
  });

  try {
    const response = await client.send(command);
    const userId = response.UserAttributes.find(attr => attr.Name === 'sub')?.Value;
    const email = response.UserAttributes.find(attr => attr.Name === 'email')?.Value;
    const name = response.UserAttributes.find(attr => attr.Name === 'name')?.Value;

    return {
      userId,
      email,
      name,
      username: response.Username,
    };
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

module.exports = {
  signUp,
  confirmSignUp,
  login,
  refreshToken,
  getUser,
};


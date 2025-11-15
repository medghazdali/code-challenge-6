const { CognitoIdentityProviderClient, SignUpCommand, AdminInitiateAuthCommand, ConfirmSignUpCommand, InitiateAuthCommand, GetUserCommand } = require('@aws-sdk/client-cognito-identity-provider');

// Initialize Cognito Client
const getCognitoClient = () => {
  return new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION || 'us-east-1',
  });
};

// Sign up a new user
const signUp = async (email, password, name) => {
  const client = getCognitoClient();
  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  const clientId = process.env.COGNITO_CLIENT_ID;

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
    return {
      userSub: response.UserSub,
      codeDeliveryDetails: response.CodeDeliveryDetails,
    };
  } catch (error) {
    console.error('Error signing up user:', error);
    throw error;
  }
};

// Confirm user signup
const confirmSignUp = async (email, confirmationCode) => {
  const client = getCognitoClient();
  const clientId = process.env.COGNITO_CLIENT_ID;

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
  const clientId = process.env.COGNITO_CLIENT_ID;

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
  const clientId = process.env.COGNITO_CLIENT_ID;

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


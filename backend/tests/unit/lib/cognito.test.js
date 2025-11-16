// Skip tests if aws-sdk-client-mock is not installed
let mockClient;
let hasMockClient = false;
try {
  const awsSdkClientMock = require('aws-sdk-client-mock');
  mockClient = awsSdkClientMock.mockClient;
  hasMockClient = true;
} catch (e) {
  console.warn('aws-sdk-client-mock not installed. Run: npm install');
  console.warn('Cognito tests will be skipped. Install dependency to run these tests.');
  // Create a no-op mock
  mockClient = () => ({
    on: () => ({ resolves: () => {}, rejects: () => {} }),
    reset: () => {},
    restore: () => {},
    calls: () => [],
    call: () => ({ args: [{ input: {} }] }),
  });
}

const { CognitoIdentityProviderClient, SignUpCommand, InitiateAuthCommand, GetUserCommand, AdminConfirmSignUpCommand } = require('@aws-sdk/client-cognito-identity-provider');
const { signUp, confirmSignUp, login, refreshToken, getUser } = require('../../../lib/cognito');

// Mock Cognito Client
const cognitoMock = mockClient(CognitoIdentityProviderClient);

// Skip entire test suite if aws-sdk-client-mock is not available
const describeOrSkip = hasMockClient ? describe : describe.skip;

describeOrSkip('Cognito Helper Functions', () => {
  beforeEach(() => {
    if (hasMockClient) {
      cognitoMock.reset();
    }
    process.env.COGNITO_USER_POOL_ID = 'eu-north-1_test123';
    process.env.COGNITO_CLIENT_ID = 'test-client-id-123';
    process.env.AWS_REGION = 'eu-north-1';
  });

  afterEach(() => {
    if (hasMockClient) {
      cognitoMock.restore();
    }
  });

  describe('signUp', () => {
    it('should sign up a user successfully and auto-confirm', async () => {
      const signUpResponse = {
        UserSub: 'user-sub-123',
        CodeDeliveryDetails: {},
      };
      cognitoMock.on(SignUpCommand).resolves(signUpResponse);
      cognitoMock.on(AdminConfirmSignUpCommand).resolves({});

      const result = await signUp('test@example.com', 'Password123!', 'Test User');

      expect(result.userSub).toBe('user-sub-123');
      expect(result.confirmed).toBe(true);
      expect(result.message).toBe('User registered and confirmed successfully');
      expect(cognitoMock.calls()).toHaveLength(2); // SignUp + AdminConfirmSignUp
    });

    it('should throw error when COGNITO_CLIENT_ID is not configured', async () => {
      delete process.env.COGNITO_CLIENT_ID;

      await expect(signUp('test@example.com', 'Password123!', 'Test User')).rejects.toThrow(
        'COGNITO_CLIENT_ID is not configured'
      );
    });

    it('should throw error when COGNITO_CLIENT_ID is an object (CloudFormation ref)', async () => {
      process.env.COGNITO_CLIENT_ID = JSON.stringify({ Ref: 'CognitoUserPoolClient' });

      await expect(signUp('test@example.com', 'Password123!', 'Test User')).rejects.toThrow(
        'COGNITO_CLIENT_ID is not configured'
      );
    });

    it('should handle duplicate email error', async () => {
      const error = new Error('An account with the given email already exists.');
      error.name = 'UsernameExistsException';
      cognitoMock.on(SignUpCommand).rejects(error);

      await expect(signUp('existing@example.com', 'Password123!', 'Test User')).rejects.toThrow(
        'An account with the given email already exists.'
      );
    });

    it('should handle invalid password error', async () => {
      const error = new Error('Password does not meet requirements');
      error.name = 'InvalidPasswordException';
      cognitoMock.on(SignUpCommand).rejects(error);

      await expect(signUp('test@example.com', 'weak', 'Test User')).rejects.toThrow(
        'Password does not meet requirements'
      );
    });

    it('should continue even if auto-confirm fails', async () => {
      const signUpResponse = {
        UserSub: 'user-sub-123',
      };
      cognitoMock.on(SignUpCommand).resolves(signUpResponse);
      cognitoMock.on(AdminConfirmSignUpCommand).rejects(new Error('Confirm failed'));

      const result = await signUp('test@example.com', 'Password123!', 'Test User');

      expect(result.userSub).toBe('user-sub-123');
    });
  });

  describe('confirmSignUp', () => {
    it('should confirm signup successfully', async () => {
      cognitoMock.on(ConfirmSignUpCommand).resolves({});

      const result = await confirmSignUp('test@example.com', '123456');

      expect(result.success).toBe(true);
      const confirmCall = cognitoMock.call(0).args[0].input;
      expect(confirmCall.Username).toBe('test@example.com');
      expect(confirmCall.ConfirmationCode).toBe('123456');
    });

    it('should throw error when COGNITO_CLIENT_ID is not configured', async () => {
      delete process.env.COGNITO_CLIENT_ID;

      await expect(confirmSignUp('test@example.com', '123456')).rejects.toThrow(
        'COGNITO_CLIENT_ID is not configured'
      );
    });

    it('should handle invalid confirmation code', async () => {
      const error = new Error('Invalid verification code provided');
      error.name = 'CodeMismatchException';
      cognitoMock.on(ConfirmSignUpCommand).rejects(error);

      await expect(confirmSignUp('test@example.com', 'wrong-code')).rejects.toThrow(
        'Invalid verification code provided'
      );
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const authResponse = {
        AuthenticationResult: {
          AccessToken: 'access-token-123',
          IdToken: 'id-token-123',
          RefreshToken: 'refresh-token-123',
          ExpiresIn: 3600,
        },
      };
      cognitoMock.on(InitiateAuthCommand).resolves(authResponse);

      const result = await login('test@example.com', 'Password123!');

      expect(result.accessToken).toBe('access-token-123');
      expect(result.idToken).toBe('id-token-123');
      expect(result.refreshToken).toBe('refresh-token-123');
      expect(result.expiresIn).toBe(3600);
      const authCall = cognitoMock.call(0).args[0].input;
      expect(authCall.AuthFlow).toBe('USER_PASSWORD_AUTH');
      expect(authCall.AuthParameters.USERNAME).toBe('test@example.com');
    });

    it('should throw error when COGNITO_CLIENT_ID is not configured', async () => {
      delete process.env.COGNITO_CLIENT_ID;

      await expect(login('test@example.com', 'Password123!')).rejects.toThrow(
        'COGNITO_CLIENT_ID is not configured'
      );
    });

    it('should handle invalid credentials', async () => {
      const error = new Error('Incorrect username or password');
      error.name = 'NotAuthorizedException';
      cognitoMock.on(InitiateAuthCommand).rejects(error);

      await expect(login('test@example.com', 'WrongPassword')).rejects.toThrow(
        'Incorrect username or password'
      );
    });

    it('should handle unconfirmed user', async () => {
      const error = new Error('User is not confirmed');
      error.name = 'UserNotConfirmedException';
      cognitoMock.on(InitiateAuthCommand).rejects(error);

      await expect(login('unconfirmed@example.com', 'Password123!')).rejects.toThrow(
        'User is not confirmed'
      );
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const authResponse = {
        AuthenticationResult: {
          AccessToken: 'new-access-token-123',
          IdToken: 'new-id-token-123',
          ExpiresIn: 3600,
        },
      };
      cognitoMock.on(InitiateAuthCommand).resolves(authResponse);

      const result = await refreshToken('refresh-token-123');

      expect(result.accessToken).toBe('new-access-token-123');
      expect(result.idToken).toBe('new-id-token-123');
      expect(result.expiresIn).toBe(3600);
      const authCall = cognitoMock.call(0).args[0].input;
      expect(authCall.AuthFlow).toBe('REFRESH_TOKEN_AUTH');
      expect(authCall.AuthParameters.REFRESH_TOKEN).toBe('refresh-token-123');
    });

    it('should throw error when COGNITO_CLIENT_ID is not configured', async () => {
      delete process.env.COGNITO_CLIENT_ID;

      await expect(refreshToken('refresh-token-123')).rejects.toThrow(
        'COGNITO_CLIENT_ID is not configured'
      );
    });

    it('should handle expired refresh token', async () => {
      const error = new Error('Refresh token has expired');
      error.name = 'NotAuthorizedException';
      cognitoMock.on(InitiateAuthCommand).rejects(error);

      await expect(refreshToken('expired-token')).rejects.toThrow('Refresh token has expired');
    });
  });

  describe('getUser', () => {
    it('should get user successfully', async () => {
      const userResponse = {
        Username: 'test@example.com',
        UserAttributes: [
          { Name: 'sub', Value: 'user-sub-123' },
          { Name: 'email', Value: 'test@example.com' },
          { Name: 'name', Value: 'Test User' },
        ],
      };
      cognitoMock.on(GetUserCommand).resolves(userResponse);

      const result = await getUser('access-token-123');

      expect(result.userId).toBe('user-sub-123');
      expect(result.email).toBe('test@example.com');
      expect(result.name).toBe('Test User');
      expect(result.username).toBe('test@example.com');
      const getUserCall = cognitoMock.call(0).args[0].input;
      expect(getUserCall.AccessToken).toBe('access-token-123');
    });

    it('should handle invalid access token', async () => {
      const error = new Error('Invalid access token');
      error.name = 'NotAuthorizedException';
      cognitoMock.on(GetUserCommand).rejects(error);

      await expect(getUser('invalid-token')).rejects.toThrow('Invalid access token');
    });

    it('should handle missing user attributes gracefully', async () => {
      const userResponse = {
        Username: 'test@example.com',
        UserAttributes: [],
      };
      cognitoMock.on(GetUserCommand).resolves(userResponse);

      const result = await getUser('access-token-123');

      expect(result.userId).toBeUndefined();
      expect(result.email).toBeUndefined();
    });
  });
});


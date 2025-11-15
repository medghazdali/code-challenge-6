// Mock dependencies BEFORE requiring the handler
jest.mock('../../../../lib/cognito');
jest.mock('../../../../lib/response');

// Now require the mocked modules
const { login } = require('../../../../lib/cognito');
const { success, badRequest, error } = require('../../../../lib/response');

// Finally require the handler
const loginHandler = require('../../../../handlers/auth/login');

describe('login Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should login user successfully', async () => {
    const event = {
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Password123!',
      }),
    };

    login.mockResolvedValue({
      accessToken: 'access-token-123',
      idToken: 'id-token-123',
      refreshToken: 'refresh-token-123',
      expiresIn: 3600,
    });
    success.mockReturnValue({
      statusCode: 200,
      body: JSON.stringify({
        accessToken: 'access-token-123',
        idToken: 'id-token-123',
        refreshToken: 'refresh-token-123',
        expiresIn: 3600,
      }),
    });

    const result = await loginHandler.handler(event);

    expect(login).toHaveBeenCalledWith('test@example.com', 'Password123!');
    expect(success).toHaveBeenCalledWith({
      accessToken: 'access-token-123',
      idToken: 'id-token-123',
      refreshToken: 'refresh-token-123',
      expiresIn: 3600,
    });
    expect(result.statusCode).toBe(200);
  });

  it('should trim and lowercase email', async () => {
    const event = {
      body: JSON.stringify({
        email: '  TEST@EXAMPLE.COM  ',
        password: 'Password123!',
      }),
    };

    login.mockResolvedValue({
      accessToken: 'token',
      idToken: 'id-token',
      refreshToken: 'refresh-token',
      expiresIn: 3600,
    });
    success.mockReturnValue({ statusCode: 200 });

    await loginHandler.handler(event);

    expect(login).toHaveBeenCalledWith('test@example.com', 'Password123!');
  });

  it('should return 400 when email is missing', async () => {
    const event = {
      body: JSON.stringify({
        password: 'Password123!',
      }),
    };

    badRequest.mockReturnValue({ statusCode: 400 });

    const result = await loginHandler.handler(event);

    expect(badRequest).toHaveBeenCalledWith('Email is required');
    expect(result.statusCode).toBe(400);
    expect(login).not.toHaveBeenCalled();
  });

  it('should return 400 when password is missing', async () => {
    const event = {
      body: JSON.stringify({
        email: 'test@example.com',
      }),
    };

    badRequest.mockReturnValue({ statusCode: 400 });

    const result = await loginHandler.handler(event);

    expect(badRequest).toHaveBeenCalledWith('Password is required');
    expect(result.statusCode).toBe(400);
    expect(login).not.toHaveBeenCalled();
  });

  it('should return 400 when credentials are invalid', async () => {
    const event = {
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'WrongPassword',
      }),
    };

    const cognitoError = new Error('Incorrect credentials');
    cognitoError.name = 'NotAuthorizedException';
    login.mockRejectedValue(cognitoError);
    badRequest.mockReturnValue({ statusCode: 400 });

    const result = await loginHandler.handler(event);

    expect(badRequest).toHaveBeenCalledWith('Incorrect email or password');
    expect(result.statusCode).toBe(400);
  });

  it('should return 400 when user is not confirmed', async () => {
    const event = {
      body: JSON.stringify({
        email: 'unconfirmed@example.com',
        password: 'Password123!',
      }),
    };

    const cognitoError = new Error('User not confirmed');
    cognitoError.name = 'UserNotConfirmedException';
    login.mockRejectedValue(cognitoError);
    badRequest.mockReturnValue({ statusCode: 400 });

    const result = await loginHandler.handler(event);

    expect(badRequest).toHaveBeenCalledWith('User is not confirmed. Please check your email for confirmation code.');
    expect(result.statusCode).toBe(400);
  });

  it('should return 500 on unexpected error', async () => {
    const event = {
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Password123!',
      }),
    };

    login.mockRejectedValue(new Error('Unexpected error'));
    error.mockReturnValue({ statusCode: 500 });

    const result = await loginHandler.handler(event);

    expect(error).toHaveBeenCalledWith('Internal server error', 500);
    expect(result.statusCode).toBe(500);
  });
});


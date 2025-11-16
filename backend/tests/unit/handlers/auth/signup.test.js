// Mock dependencies BEFORE requiring the handler
jest.mock('../../../../lib/cognito');
jest.mock('../../../../lib/response');

// Now require the mocked modules
const { signUp } = require('../../../../lib/cognito');
const { success, badRequest, error } = require('../../../../lib/response');

// Finally require the handler
const signupHandler = require('../../../../handlers/auth/signup');

describe('signup Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should sign up a user successfully', async () => {
    const event = {
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      }),
    };

    signUp.mockResolvedValue({
      userSub: 'user-sub-123',
      confirmed: true,
      message: 'User registered and confirmed successfully',
    });
    success.mockReturnValue({
      statusCode: 201,
      body: JSON.stringify({
        message: 'User registered and confirmed successfully. You can now login.',
        userSub: 'user-sub-123',
        confirmed: true,
      }),
    });

    const result = await signupHandler.handler(event);

    expect(signUp).toHaveBeenCalledWith('test@example.com', 'Password123!', 'Test User');
    expect(success).toHaveBeenCalledWith(
      expect.objectContaining({
        userSub: 'user-sub-123',
        confirmed: true,
      }),
      201
    );
    expect(result.statusCode).toBe(201);
  });

  it('should trim and lowercase email', async () => {
    const event = {
      body: JSON.stringify({
        email: '  TEST@EXAMPLE.COM  ',
        password: 'Password123!',
        name: 'Test User',
      }),
    };

    signUp.mockResolvedValue({ userSub: 'user-sub-123', confirmed: true });
    success.mockReturnValue({ statusCode: 201 });

    await signupHandler.handler(event);

    expect(signUp).toHaveBeenCalledWith('test@example.com', 'Password123!', 'Test User');
  });

  it('should return 400 when email is missing', async () => {
    const event = {
      body: JSON.stringify({
        password: 'Password123!',
        name: 'Test User',
      }),
    };

    badRequest.mockReturnValue({ statusCode: 400 });

    const result = await signupHandler.handler(event);

    expect(badRequest).toHaveBeenCalledWith('Valid email is required');
    expect(result.statusCode).toBe(400);
    expect(signUp).not.toHaveBeenCalled();
  });

  it('should return 400 when email is invalid', async () => {
    const event = {
      body: JSON.stringify({
        email: 'invalid-email',
        password: 'Password123!',
        name: 'Test User',
      }),
    };

    badRequest.mockReturnValue({ statusCode: 400 });

    await signupHandler.handler(event);

    expect(badRequest).toHaveBeenCalledWith('Valid email is required');
  });

  it('should return 400 when password is too short', async () => {
    const event = {
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'short',
        name: 'Test User',
      }),
    };

    badRequest.mockReturnValue({ statusCode: 400 });

    await signupHandler.handler(event);

    expect(badRequest).toHaveBeenCalledWith('Password must be at least 8 characters long');
  });

  it('should return 400 when name is missing', async () => {
    const event = {
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Password123!',
      }),
    };

    badRequest.mockReturnValue({ statusCode: 400 });

    await signupHandler.handler(event);

    expect(badRequest).toHaveBeenCalledWith('Name is required');
  });

  it('should return 400 when JSON is invalid', async () => {
    const event = {
      body: 'invalid json{',
    };

    badRequest.mockReturnValue({ statusCode: 400 });

    const result = await signupHandler.handler(event);

    expect(badRequest).toHaveBeenCalledWith('Invalid JSON in request body');
    expect(result.statusCode).toBe(400);
  });

  it('should return 400 when user already exists', async () => {
    const event = {
      body: JSON.stringify({
        email: 'existing@example.com',
        password: 'Password123!',
        name: 'Test User',
      }),
    };

    const cognitoError = new Error('User already exists');
    cognitoError.name = 'UsernameExistsException';
    signUp.mockRejectedValue(cognitoError);
    badRequest.mockReturnValue({ statusCode: 400 });

    const result = await signupHandler.handler(event);

    expect(badRequest).toHaveBeenCalledWith('User with this email already exists');
    expect(result.statusCode).toBe(400);
  });

  it('should return 400 when Cognito is not configured', async () => {
    const event = {
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      }),
    };

    const configError = new Error('COGNITO_CLIENT_ID is not configured. For local development, set it in .env file or deploy to AWS first.');
    signUp.mockRejectedValue(configError);
    badRequest.mockReturnValue({ statusCode: 400 });

    const result = await signupHandler.handler(event);

    expect(badRequest).toHaveBeenCalledWith(
      'Cognito is not configured. For local development, deploy to AWS first or set COGNITO_CLIENT_ID in .env file.'
    );
    expect(result.statusCode).toBe(400);
  });

  it('should return 500 on unexpected error', async () => {
    const event = {
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      }),
    };

    signUp.mockRejectedValue(new Error('Unexpected error'));
    error.mockReturnValue({ statusCode: 500 });

    const result = await signupHandler.handler(event);

    expect(error).toHaveBeenCalledWith('Internal server error', 500);
    expect(result.statusCode).toBe(500);
  });
});


const { getUserIdFromEvent, isAuthenticated, requireAuth } = require('../../../lib/auth');
const {
  createMockEvent,
  createMockEventWithoutAuth,
  createMockEventWithTestHeader,
  createMockEventWithOfflineContext,
} = require('../../helpers/test-helpers');

describe('Auth Helper Functions', () => {
  describe('getUserIdFromEvent', () => {
    it('should extract userId from Cognito claims', () => {
      const event = createMockEvent({ userId: 'user-123' });
      const userId = getUserIdFromEvent(event);
      
      expect(userId).toBe('user-123');
    });

    it('should extract userId from authorizer claims sub', () => {
      const event = {
        requestContext: {
          authorizer: {
            claims: {
              sub: 'cognito-user-123',
            },
          },
        },
      };
      const userId = getUserIdFromEvent(event);
      
      expect(userId).toBe('cognito-user-123');
    });

    it('should extract userId from principalId if claims not available', () => {
      const event = {
        requestContext: {
          authorizer: {
            principalId: 'principal-user-123',
          },
        },
      };
      const userId = getUserIdFromEvent(event);
      
      expect(userId).toBe('principal-user-123');
    });

    it('should extract userId from X-Test-User-Id header for local development', () => {
      const event = createMockEventWithTestHeader({ testUserId: 'test-user-456' });
      const userId = getUserIdFromEvent(event);
      
      expect(userId).toBe('test-user-456');
    });

    it('should return null when no authentication found', () => {
      const event = createMockEventWithoutAuth();
      const userId = getUserIdFromEvent(event);
      
      expect(userId).toBeNull();
    });

    it('should reject serverless-offline mock principalId values', () => {
      const event = createMockEventWithOfflineContext();
      const userId = getUserIdFromEvent(event);
      
      expect(userId).toBeNull();
    });

    it('should handle missing requestContext gracefully', () => {
      const event = {};
      const userId = getUserIdFromEvent(event);
      
      expect(userId).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when userId is found', () => {
      const event = createMockEvent({ userId: 'user-123' });
      const authenticated = isAuthenticated(event);
      
      expect(authenticated).toBe(true);
    });

    it('should return false when userId is not found', () => {
      const event = createMockEventWithoutAuth();
      const authenticated = isAuthenticated(event);
      
      expect(authenticated).toBe(false);
    });
  });

  describe('requireAuth', () => {
    it('should return userId when authentication is valid', () => {
      const event = createMockEvent({ userId: 'user-123' });
      const userId = requireAuth(event);
      
      expect(userId).toBe('user-123');
    });

    it('should throw error when authentication is missing', () => {
      const event = createMockEventWithoutAuth();
      
      expect(() => requireAuth(event)).toThrow('Unauthorized: Authentication required');
    });

    it('should throw error with 401 status code', () => {
      const event = createMockEventWithoutAuth();
      
      try {
        requireAuth(event);
      } catch (error) {
        expect(error.statusCode).toBe(401);
      }
    });

    it('should reject serverless-offline mock values', () => {
      const event = createMockEventWithOfflineContext();
      
      expect(() => requireAuth(event)).toThrow('Unauthorized: Authentication required');
    });

    it('should reject empty string userId', () => {
      const event = createMockEvent({ userId: '' });
      
      // Override to set empty string
      event.requestContext.authorizer.claims.sub = '';
      
      expect(() => requireAuth(event)).toThrow('Unauthorized: Authentication required');
    });

    it('should accept X-Test-User-Id header for local development', () => {
      const event = createMockEventWithTestHeader({ testUserId: 'test-user-789' });
      const userId = requireAuth(event);
      
      expect(userId).toBe('test-user-789');
    });
  });
});


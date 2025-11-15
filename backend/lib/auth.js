// Authentication helper functions

// Extract user ID from API Gateway event (Cognito authorizer)
const getUserIdFromEvent = (event) => {
  try {
    // When using Cognito authorizer, user info is in requestContext.authorizer.claims
    const claims = event.requestContext?.authorizer?.claims;
    if (claims && claims.sub) {
      return claims.sub;
    }

    // Alternative: check requestContext.authorizer.claims (different structure)
    const authorizerClaims = event.requestContext?.authorizer?.claims;
    if (authorizerClaims?.sub) {
      return authorizerClaims.sub;
    }

    // Fallback: try to get from authorizer.principalId
    const principalId = event.requestContext?.authorizer?.principalId;
    if (principalId) {
      return principalId;
    }

    // For local development with serverless-offline
    // Check for a test user ID in headers (for development only)
    if (process.env.STAGE === 'dev' || process.env.NODE_ENV === 'development') {
      const testUserId = event.headers?.['x-test-user-id'] || event.headers?.['X-Test-User-Id'];
      if (testUserId) {
        console.warn('⚠️  Using test user ID for local development');
        return testUserId;
      }
    }

    // For local development or testing - try to extract from Authorization header
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // In production, API Gateway authorizer handles this
      // For local dev, we can't verify JWT without additional setup
      // Return null to require proper authentication
      return null;
    }

    return null;
  } catch (error) {
    console.error('Error extracting user ID:', error);
    return null;
  }
};

// Check if user is authenticated
const isAuthenticated = (event) => {
  const userId = getUserIdFromEvent(event);
  return userId !== null;
};

// Require authentication (throws error if not authenticated)
const requireAuth = (event) => {
  const userId = getUserIdFromEvent(event);
  if (!userId) {
    throw new Error('Unauthorized: Authentication required');
  }
  return userId;
};

module.exports = {
  getUserIdFromEvent,
  isAuthenticated,
  requireAuth,
};


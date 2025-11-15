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
    // BUT reject serverless-offline mock values
    const principalId = event.requestContext?.authorizer?.principalId;
    if (principalId && !principalId.includes('offlineContext')) {
      // Only accept real principalId, not serverless-offline mocks
      return principalId;
    }

    // For local development with serverless-offline
    // ONLY allow test user ID if explicitly provided via header
    // This is a development-only bypass - authentication is still required
    const testUserId = event.headers?.['x-test-user-id'] || event.headers?.['X-Test-User-Id'];
    if (testUserId) {
      console.warn('⚠️  Using test user ID for local development (X-Test-User-Id header)');
      return testUserId;
    }

    // No authentication found - return null
    // This will cause requireAuth() to throw an error
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
  // Always check - no bypasses
  const userId = getUserIdFromEvent(event);
  
    // Explicit check - userId must be a non-empty string
    // Also reject serverless-offline mock values
    if (!userId || 
        typeof userId !== 'string' || 
        userId.trim().length === 0 ||
        userId.includes('offlineContext')) {
    // Log debug info in development
    console.error('❌ Authentication failed - no valid userId found');
    console.error('Event structure:', {
      hasRequestContext: !!event.requestContext,
      hasAuthorizer: !!event.requestContext?.authorizer,
      hasClaims: !!event.requestContext?.authorizer?.claims,
      principalId: event.requestContext?.authorizer?.principalId,
      headers: Object.keys(event.headers || {}),
      hasTestHeader: !!(event.headers?.['x-test-user-id'] || event.headers?.['X-Test-User-Id']),
      userIdValue: userId,
      userIdType: typeof userId,
    });
    console.error('💡 For local development, add header: X-Test-User-Id: <test-user-id>');
    
    // Always throw - no exceptions
    const authError = new Error('Unauthorized: Authentication required');
    authError.statusCode = 401;
    throw authError;
  }
  
  return userId;
};

module.exports = {
  getUserIdFromEvent,
  isAuthenticated,
  requireAuth,
};


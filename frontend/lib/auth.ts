// Authentication utilities

export const saveTokens = (accessToken: string, idToken: string, refreshToken: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('idToken', idToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    // Extract and save user email from ID token
    try {
      const payload = JSON.parse(atob(idToken.split('.')[1]));
      if (payload.email) {
        localStorage.setItem('userEmail', payload.email);
      }
    } catch (e) {
      console.warn('Could not decode ID token to get email');
    }
  }
};

export const getAccessToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

export const getIdToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('idToken');
  }
  return null;
};

export const getRefreshToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refreshToken');
  }
  return null;
};

export const getUserEmail = (): string | null => {
  if (typeof window !== 'undefined') {
    // Try to get from localStorage first
    const email = localStorage.getItem('userEmail');
    if (email) return email;
    
    // Try to decode from ID token
    const idToken = getIdToken();
    if (idToken) {
      try {
        const payload = JSON.parse(atob(idToken.split('.')[1]));
        if (payload.email) {
          localStorage.setItem('userEmail', payload.email);
          return payload.email;
        }
      } catch (e) {
        // Token decode failed
      }
    }
  }
  return null;
};

export const clearTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('idToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userEmail');
  }
};

export const isAuthenticated = (): boolean => {
  return getAccessToken() !== null;
};


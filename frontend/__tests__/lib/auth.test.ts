import {
  saveTokens,
  getAccessToken,
  getIdToken,
  getRefreshToken,
  getUserEmail,
  clearTokens,
  isAuthenticated,
} from '@/lib/auth';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Auth Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('saveTokens', () => {
    it('should save tokens to localStorage', () => {
      saveTokens('access-token', 'id-token', 'refresh-token');

      expect(localStorage.getItem('accessToken')).toBe('access-token');
      expect(localStorage.getItem('idToken')).toBe('id-token');
      expect(localStorage.getItem('refreshToken')).toBe('refresh-token');
    });

    it('should extract and save email from ID token', () => {
      // Create a mock JWT token with email in payload
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ email: 'test@example.com', sub: 'user-123' }));
      const signature = 'signature';
      const idToken = `${header}.${payload}.${signature}`;

      saveTokens('access-token', idToken, 'refresh-token');

      expect(localStorage.getItem('userEmail')).toBe('test@example.com');
    });

    it('should handle invalid ID token gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      saveTokens('access-token', 'invalid-token', 'refresh-token');

      expect(localStorage.getItem('userEmail')).toBeNull();
      consoleSpy.mockRestore();
    });
  });

  describe('getAccessToken', () => {
    it('should return access token from localStorage', () => {
      localStorage.setItem('accessToken', 'test-access-token');

      expect(getAccessToken()).toBe('test-access-token');
    });

    it('should return null when token is not found', () => {
      expect(getAccessToken()).toBeNull();
    });
  });

  describe('getIdToken', () => {
    it('should return ID token from localStorage', () => {
      localStorage.setItem('idToken', 'test-id-token');

      expect(getIdToken()).toBe('test-id-token');
    });

    it('should return null when token is not found', () => {
      expect(getIdToken()).toBeNull();
    });
  });

  describe('getRefreshToken', () => {
    it('should return refresh token from localStorage', () => {
      localStorage.setItem('refreshToken', 'test-refresh-token');

      expect(getRefreshToken()).toBe('test-refresh-token');
    });

    it('should return null when token is not found', () => {
      expect(getRefreshToken()).toBeNull();
    });
  });

  describe('getUserEmail', () => {
    it('should return email from localStorage', () => {
      localStorage.setItem('userEmail', 'test@example.com');

      expect(getUserEmail()).toBe('test@example.com');
    });

    it('should extract email from ID token when not in localStorage', () => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ email: 'token@example.com', sub: 'user-123' }));
      const signature = 'signature';
      const idToken = `${header}.${payload}.${signature}`;

      localStorage.setItem('idToken', idToken);

      expect(getUserEmail()).toBe('token@example.com');
      expect(localStorage.getItem('userEmail')).toBe('token@example.com');
    });

    it('should return null when email is not available', () => {
      expect(getUserEmail()).toBeNull();
    });
  });

  describe('clearTokens', () => {
    it('should remove all tokens from localStorage', () => {
      localStorage.setItem('accessToken', 'token');
      localStorage.setItem('idToken', 'token');
      localStorage.setItem('refreshToken', 'token');
      localStorage.setItem('userEmail', 'email@example.com');

      clearTokens();

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('idToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(localStorage.getItem('userEmail')).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when access token exists', () => {
      localStorage.setItem('accessToken', 'test-token');

      expect(isAuthenticated()).toBe(true);
    });

    it('should return false when access token does not exist', () => {
      expect(isAuthenticated()).toBe(false);
    });
  });
});


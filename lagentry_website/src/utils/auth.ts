// Authentication utilities for admin panel

const AUTH_TOKEN_KEY = 'adminAuthToken';
const USERNAME_KEY = 'adminUsername';
const LOGIN_TIME_KEY = 'adminLoginTime';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const loginTime = localStorage.getItem(LOGIN_TIME_KEY);
  
  if (!token || !loginTime) {
    return false;
  }
  
  // Check if session has expired
  const loginTimestamp = parseInt(loginTime, 10);
  const now = Date.now();
  const sessionAge = now - loginTimestamp;
  
  if (sessionAge > SESSION_DURATION) {
    // Session expired, clear auth data
    clearAuth();
    return false;
  }
  
  return true;
};

/**
 * Get current admin username
 */
export const getAdminUsername = (): string | null => {
  return localStorage.getItem(USERNAME_KEY);
};

/**
 * Clear authentication data
 */
export const clearAuth = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
  localStorage.removeItem(LOGIN_TIME_KEY);
};

/**
 * Protected route wrapper component props
 */
export interface ProtectedRouteProps {
  children: React.ReactElement;
}


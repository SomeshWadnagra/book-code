import { useState, useEffect } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  userName: string | null;
  userEmail: string | null;
}

export const useAuth = (): AuthState => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userName: null,
    userEmail: null,
  });

  useEffect(() => {
    // Check localStorage for auth token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      const name = localStorage.getItem('userName');
      const email = localStorage.getItem('userEmail');

      setAuthState({
        isAuthenticated: !!token,
        userName: name,
        userEmail: email,
      });
    }
  }, []);

  return authState;
};

// Helper function to logout
export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    window.location.href = '/';
  }
};

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, signOut, fetchUserAttributes, fetchAuthSession } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

interface AuthContextType {
  isAuthenticated: boolean;
  userName: string | null;
  userEmail: string | null;
  loading: boolean;
  // We keep logout, but login is now handled by the Login Page directly calling signIn
  logout: () => Promise<void>;
  // Helper to get the raw token for API calls
  getToken: () => Promise<string | undefined>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Check if user is logged in on app start
  useEffect(() => {
    checkUser();

    // 2. Listen for Auth events (Login/Logout anywhere in the app)
    const listener = Hub.listen('auth', (data) => {
      switch (data.payload.event) {
        case 'signedIn':
          checkUser();
          break;
        case 'signedOut':
          setIsAuthenticated(false);
          setUserName(null);
          setUserEmail(null);
          break;
      }
    });

    return () => listener();
  }, []);

  async function checkUser() {
    try {
      // Ask AWS if we have a user
      const user = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      
      setIsAuthenticated(true);
      setUserName(attributes.given_name || user.username);
      setUserEmail(attributes.email || null);

    } catch (error) {
      // No user is signed in
      setIsAuthenticated(false);
      setUserName(null);
      setUserEmail(null);
    } finally {
      setLoading(false);
    }
  }

  const logout = async () => {
    try {
      await signOut();
      // Hub listener will handle state updates
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getToken = async () => {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.idToken?.toString();
    } catch {
      return undefined;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userName, userEmail, logout, getToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
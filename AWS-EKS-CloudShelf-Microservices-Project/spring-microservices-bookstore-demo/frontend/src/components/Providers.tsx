'use client';

import { Amplify } from 'aws-amplify';
import { AuthProvider } from '@/contexts/AuthContext';

// Initialize the Connection to AWS Cognito
// This must run before any other Auth code
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
    }
  }
});

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
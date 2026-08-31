import React, { useEffect, type ReactNode } from 'react';

interface AppProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AppProviderProps> = ({ children }) => {
  useEffect(() => {
    // Ensure mock user is set in sessionStorage for local running
    if (!sessionStorage.getItem('okta_user_info')) {
      const mockUser = {
        displayName: 'Clarity Business User',
        domainID: 'V123456',
        email: 'clarity.user@EH.com',
        groups: ['Clarity_AI_Users', 'Healthcare_Support'],
        token: 'mock-dev-token',
        tokenExpiry: Date.now() / 1000 + 86400,
      };
      sessionStorage.setItem('okta_user_info', JSON.stringify(mockUser));
      localStorage.setItem('clarity_user', JSON.stringify(mockUser));
      localStorage.setItem('clarity_authenticated', 'true');
      localStorage.setItem('clarity_selected_group', 'Clarity_AI_Users');
    }
  }, []);

  return <>{children}</>;
};

export default AuthProvider;
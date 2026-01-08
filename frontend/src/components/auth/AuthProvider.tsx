import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, apiClient } from '../../services/api-client';

interface AuthContextType {

  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');

    if (storedToken) {
      // Verify the token is still valid by fetching user info
      apiClient.getMe(storedToken)
        .then(userFromApi => {
          setToken(storedToken);
          setUser(userFromApi);
          localStorage.setItem('user', JSON.stringify(userFromApi));
        })
        .catch(error => {
          console.error('Session invalid or expired:', error);
          // Clear invalid session data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const loginResponse = await apiClient.login(email, password);

      if (!loginResponse || !loginResponse.access_token) {
        throw new Error('Login failed: Invalid response from server');
      }

      const { access_token } = loginResponse;

      setToken(access_token);
      localStorage.setItem('token', access_token);

      // After successful login, get user info from the /me endpoint
      const userFromApi = await apiClient.getMe(access_token);

      setUser(userFromApi);
      localStorage.setItem('user', JSON.stringify(userFromApi));
    } catch (error) {
      console.error('Login error:', error);
      // Re-throw the error, but ensure it's a proper Error object
      if (error instanceof Error) {
        throw error;
      } else if (typeof error === 'string') {
        throw new Error(error);
      } else {
        throw new Error('Login failed');
      }
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const userResponse = await apiClient.register(email, password);

      if (!userResponse || !userResponse.id) {
        throw new Error('Registration failed: Invalid response from server');
      }

      // After successful registration, login automatically
      await login(email, password);
      // Don't return user since the function signature is Promise<void>
    } catch (error) {
      console.error('Registration error:', error);
      // Re-throw the error, but ensure it's a proper Error object
      if (error instanceof Error) {
        throw error;
      } else if (typeof error === 'string') {
        throw new Error(error);
      } else {
        throw new Error('Registration failed');
      }
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAuthenticated = !!token && !!user;

  const value: AuthContextType = { user, token, login, register, logout, isAuthenticated, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

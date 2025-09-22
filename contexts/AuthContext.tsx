'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_PASSWORD = 'admin123'; // In production, this should be in environment variables

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const authData = localStorage.getItem('queensmeal_admin_auth');
        if (authData) {
          const { isAuth, timestamp } = JSON.parse(authData);
          // Check if authentication is still valid (24 hours)
          const isExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000;
          if (!isExpired && isAuth) {
            setIsAuthenticated(true);
          } else {
            // Clear expired authentication
            localStorage.removeItem('queensmeal_admin_auth');
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        localStorage.removeItem('queensmeal_admin_auth');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (password: string): Promise<boolean> => {
    if (password === ADMIN_PASSWORD) {
      const authData = {
        isAuth: true,
        timestamp: Date.now()
      };
      localStorage.setItem('queensmeal_admin_auth', JSON.stringify(authData));
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('queensmeal_admin_auth');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
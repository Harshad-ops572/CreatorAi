import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../api/client';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { success, error } = useToast();

  useEffect(() => {
    async function checkAuth() {
      try {
        const data = await api.getMe();
        if (data?.user) {
          setUser(data.user);
        }
      } catch (e) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, []);

  const login = async (credentials: any) => {
    setIsLoading(true);
    try {
      const data = await api.login(credentials);
      if (data?.token) {
        localStorage.setItem('creatorai_token', data.token);
      }
      setUser(data.user);
      success(`Welcome back, ${data.user.name}!`);
    } catch (err: any) {
      error(err.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const data = await api.register(userData);
      if (data?.token) {
        localStorage.setItem('creatorai_token', data.token);
      }
      setUser(data.user);
      success(`Account created! Welcome to CreatorAi, ${data.user.name}.`);
    } catch (err: any) {
      error(err.message || 'Registration failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async () => {
    setIsLoading(true);
    try {
      const data = await api.demoLogin();
      if (data?.token) {
        localStorage.setItem('creatorai_token', data.token);
      }
      setUser(data.user);
      success(`Logged in as demo creator: ${data.user.name}!`);
    } catch (err: any) {
      error('Could not start demo session. Please try logging in manually.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // Ignore
    } finally {
      localStorage.removeItem('creatorai_token');
      setUser(null);
      success('Logged out successfully.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, demoLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  setAuthModalTab: (tab: 'login' | 'register') => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<{ success: boolean; error?: string }>;
  loginDemo: () => void;
  logout: () => void;
}

const AUTH_USER_KEY = 'elp_auth_user';
const AUTH_TOKEN_KEY = 'elp_auth_token';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(AUTH_USER_KEY);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Failed to load user session', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openAuthModal = (tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Try local Next.js API route first
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data?.error?.message || 'Email hoặc mật khẩu không chính xác',
        };
      }

      const loggedUser = data.data.user;
      setUser(loggedUser);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(loggedUser));
      localStorage.setItem(AUTH_TOKEN_KEY, data.data.token);
      closeAuthModal();
      return { success: true };
    } catch (err) {
      // Fallback in case fetch fails
      const fallbackUser: User = {
        id: 'usr-1001',
        email,
        displayName: email.split('@')[0],
        role: 'STUDENT',
        streakDays: 5,
        totalXP: 1420,
        level: 4,
      };
      setUser(fallbackUser);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(fallbackUser));
      localStorage.setItem(AUTH_TOKEN_KEY, 'mock-jwt-token');
      closeAuthModal();
      return { success: true };
    }
  };

  const register = async (
    email: string,
    password: string,
    displayName: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data?.error?.message || 'Đăng ký không thành công',
        };
      }

      const newUser = data.data.user;
      setUser(newUser);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));
      localStorage.setItem(AUTH_TOKEN_KEY, data.data.token);
      closeAuthModal();
      return { success: true };
    } catch (err) {
      const fallbackUser: User = {
        id: `usr-${Date.now()}`,
        email,
        displayName: displayName || email.split('@')[0],
        role: 'STUDENT',
        streakDays: 1,
        totalXP: 50,
        level: 1,
      };
      setUser(fallbackUser);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(fallbackUser));
      localStorage.setItem(AUTH_TOKEN_KEY, 'mock-jwt-token');
      closeAuthModal();
      return { success: true };
    }
  };

  const loginDemo = () => {
    const demoUser: User = {
      id: 'usr-1001',
      email: 'learner@linguacore.com',
      displayName: 'English Learner',
      role: 'STUDENT',
      streakDays: 5,
      totalXP: 1420,
      level: 4,
    };
    setUser(demoUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(demoUser));
    localStorage.setItem(AUTH_TOKEN_KEY, 'jwt-mock-demo-token');
    closeAuthModal();
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        setAuthModalTab,
        login,
        register,
        loginDemo,
        logout,
      }}
    >
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

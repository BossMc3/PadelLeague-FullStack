"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface User {
  email: string;
  role: 'ROLE_PLAYER' | 'ROLE_ORGANIZER' | 'ROLE_ADMIN';
  emailVerified: boolean;
  approved: boolean;
}

interface RegisterResult {
  needsVerification: boolean;
  needsApproval: boolean;
  message: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: { email: string; password: string; role?: string }) => Promise<RegisterResult>;
  verifyEmail: (data: { email: string; token: string }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeRole = (role?: string): User['role'] => {
  if (role === 'ROLE_ADMIN' || role === 'ADMIN') {
    return 'ROLE_ADMIN';
  }
  if (role === 'ROLE_ORGANIZER' || role === 'ORGANIZER') {
    return 'ROLE_ORGANIZER';
  }
  return 'ROLE_PLAYER';
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      const parsedUser = JSON.parse(storedUser) as { email: string; role?: string; emailVerified?: boolean; approved?: boolean };
      setToken(storedToken);
      setUser({
        email: parsedUser.email,
        role: normalizeRole(parsedUser.role),
        emailVerified: parsedUser.emailVerified ?? true,
        approved: parsedUser.approved ?? true,
      });
    }
    setIsLoading(false);
  }, []);

  const login = async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    const { token, email, role, emailVerified, approved } = response.data;
    const userData: User = {
      email,
      role: normalizeRole(role),
      emailVerified: emailVerified ?? true,
      approved: approved ?? true,
    };

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(token);
    setUser(userData);
    router.push('/profile');
  };

  const register = async (data: { email: string; password: string; role?: string }): Promise<RegisterResult> => {
    const response = await api.post('/auth/register', data);
    const { email, role, emailVerified, approved, message } = response.data;

    // Store the email for the verify-email page
    localStorage.setItem('pendingVerificationEmail', email);

    return {
      needsVerification: !emailVerified,
      needsApproval: !approved,
      message: message || 'Registration successful!',
    };
  };

  const verifyEmail = async (data: { email: string; token: string }) => {
    const response = await api.post('/auth/verify-email', data);
    const { token: jwtToken, email, role, emailVerified, approved } = response.data;

    if (jwtToken) {
      const userData: User = {
        email,
        role: normalizeRole(role),
        emailVerified: emailVerified ?? true,
        approved: approved ?? true,
      };

      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.removeItem('pendingVerificationEmail');
      setToken(jwtToken);
      setUser(userData);
      router.push('/profile');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('pendingVerificationEmail');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, verifyEmail, logout, isLoading }}>
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

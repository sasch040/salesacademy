'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, AuthResponse } from '@/lib/types';
import { API_URL, getToken, setToken, removeToken } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  login: (identifier: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    fetch(`${API_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setUser(data);
        else removeToken();
      })
      .catch(() => removeToken());
  }, []);

  const login = async (identifier: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });

    const contentType = res.headers.get('content-type');

    if (!res.ok) {
      let errorMessage = 'Login fehlgeschlagen';
      if (contentType?.includes('application/json')) {
        const errData = await res.json();
        errorMessage = errData?.error?.message || errorMessage;
      } else {
        const text = await res.text();
        console.error('❌ Login response (text):', text);
        errorMessage = text || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data: AuthResponse = await res.json();
    setToken(data.jwt);
    setUser(data.user);
  };

  const register = async (username: string, email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/local/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    const contentType = res.headers.get('content-type');

    if (!res.ok) {
      let errorMessage = 'Registrierung fehlgeschlagen';
      if (contentType?.includes('application/json')) {
        const errData = await res.json();
        errorMessage = errData?.error?.message || errorMessage;
      } else {
        const text = await res.text();
        console.error('❌ Register response (text):', text);
        errorMessage = text || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data: AuthResponse = await res.json();
    setToken(data.jwt);
    setUser(data.user);
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

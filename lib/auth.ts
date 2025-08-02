// lib/types.ts

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  jwt: string;
  user: User;
}

export interface ModuleProgress {
  id: number;
  module: number;
  videoWatched: boolean;
  quizCompleted: boolean;
  completed: boolean;
}

// lib/auth.ts

const TOKEN_KEY = 'token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

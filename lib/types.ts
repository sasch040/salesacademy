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

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
  id: number
  module: number | string
  completed: boolean
  quizCompleted: boolean
  videoWatched: boolean
  users_permissions_user: number // oder string
}

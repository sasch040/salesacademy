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

/**
 * Raw-Strapi-Response für module-progresses (so wie es Strapi liefert).
 * Benutzen wir nur, wenn wir die API-Form direkt typisieren wollen.
 */
export interface StrapiModuleProgress {
  id: number;
  attributes: {
    module?: { data: { id: number } | null } | null;
    users_permissions_user?: { data: { id: number; email?: string } | null } | null;
    videoWatched?: boolean;
    quizCompleted?: boolean;
    completed?: boolean;
    createdAt?: string;
    updatedAt?: string;
  };
}

/**
 * Normalisierte Form fürs Frontend.
 * -> Genau so erwartet es dein Context / die Pages / lib/progress.ts
 */
export interface ModuleProgress {
  id: number;
  moduleId: number;
  videoWatched: boolean;
  quizCompleted: boolean;
  completed: boolean;
}

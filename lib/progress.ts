import { getToken, API_URL } from './auth';
import { ModuleProgress } from './types';

export async function getProgressByUser(): Promise<ModuleProgress[]> {
  const token = getToken();
  if (!token) throw new Error('Kein Token vorhanden');

  const res = await fetch(`${API_URL}/api/module-progresses?populate=module&filters[users_permissions_user][id][$eq]=ME`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  return data?.data || [];
}

export async function saveProgress(progress: Partial<ModuleProgress>) {
  const token = getToken();
  if (!token) throw new Error('Kein Token vorhanden');

  const res = await fetch(`${API_URL}/api/module-progresses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ data: progress }),
  });

  return res.json();
}

export async function updateProgress(moduleId: number, updates: Partial<ModuleProgress>) {
  const token = getToken();
  if (!token) throw new Error('Kein Token vorhanden');

  const res = await fetch(`/api/progress/${moduleId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  return res.json();
}

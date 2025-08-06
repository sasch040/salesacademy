import { API_URL } from './auth'
import { ModuleProgress } from './types'

export async function getProgressByUser(): Promise<ModuleProgress[]> {
  const res = await fetch(`/api/progress`, {
    method: 'GET',
    credentials: 'include', // sendet HttpOnly-Cookie mit
  })

  if (!res.ok) throw new Error('Fehler beim Laden des Fortschritts')

  const data = await res.json()
  return data || []
}

export async function saveProgress(progress: Partial<ModuleProgress>) {
  const res = await fetch(`/api/progress`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(progress),
  })

  if (!res.ok) throw new Error('Fehler beim Speichern des Fortschritts')

  return res.json()
}

export async function updateProgress(moduleId: number, updates: Partial<ModuleProgress>) {
  const res = await fetch(`/api/progress/${moduleId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  })

  if (!res.ok) throw new Error('Fehler beim Aktualisieren des Fortschritts')

  return res.json()
}

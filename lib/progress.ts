// lib/progress.ts
import { API_URL } from './auth'

export type ModuleProgress = {
  id: number
  moduleId: number
  videoWatched: boolean
  quizCompleted: boolean
  completed: boolean
}

const BASE = (API_URL || '').replace(/\/$/, '')
const EP = `${BASE}/api/module-progresses`

// Strapi/Next-Antwort -> in ein flaches ModuleProgress mappen
function normalize(item: any): ModuleProgress {
  const a = item?.attributes ?? {}
  return {
    id: item?.id ?? 0,
    moduleId: a?.module?.data?.id ?? a?.moduleId ?? 0,
    videoWatched: !!a?.videoWatched,
    quizCompleted: !!a?.quizCompleted,
    completed: !!a?.completed,
  }
}

/** Alle Progress-Einträge des eingeloggten Users laden (optional: moduleId filtern) */
export async function getProgressByUser(moduleId?: number): Promise<ModuleProgress[]> {
  const url = moduleId ? `${EP}?moduleId=${encodeURIComponent(String(moduleId))}` : EP
  const res = await fetch(url, { credentials: 'include' })
  if (!res.ok) throw new Error('Fehler beim Laden des Fortschritts')
  const json = await res.json()
  // Server liefert { data: [...] }
  const arr = Array.isArray(json?.data) ? json.data : []
  return arr.map(normalize)
}

/** Genau einen Progress für ein Modul laden (oder null, falls keiner existiert) */
export async function getProgressForModule(moduleId: number): Promise<ModuleProgress | null> {
  const list = await getProgressByUser(moduleId)
  return list[0] ?? null
}

/**
 * Upsert-Speichern: existiert (user × module) -> Update, sonst Create.
 * patch: { videoWatched?: boolean; quizCompleted?: boolean }
 */
export async function saveProgress(
  moduleId: number,
  patch: { videoWatched?: boolean; quizCompleted?: boolean }
): Promise<ModuleProgress> {
  const res = await fetch(EP, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ moduleId, ...patch }),
  })
  if (!res.ok) throw new Error('Fehler beim Speichern des Fortschritts')

  const json = await res.json()
  // Serverantwort: { success, action, data: <strapiItem> }
  return normalize(json?.data ?? json)
}

/** Alias auf saveProgress (PUT per moduleId wäre falsch, die [id]-Route erwartet die Progress-ID) */
export async function updateProgress(
  moduleId: number,
  patch: { videoWatched?: boolean; quizCompleted?: boolean }
): Promise<ModuleProgress> {
  return saveProgress(moduleId, patch)
}

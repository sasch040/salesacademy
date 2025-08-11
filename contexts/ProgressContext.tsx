"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { ModuleProgress } from "@/lib/types"

interface ProgressContextType {
  progress: ModuleProgress[]
  refreshProgress: () => Promise<void>
  save: (data: Partial<ModuleProgress>) => Promise<void>
  update: (moduleId: number, updates: Partial<ModuleProgress>) => Promise<void>
}

export const ProgressContext = createContext<ProgressContextType | undefined>(undefined)

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<ModuleProgress[]>([])

  async function getUserEmail(): Promise<string | null> {
    try {
      const r = await fetch("/api/auth/me", { credentials: "include" })
      if (!r.ok) return null
      const j = await r.json()
      return j?.user?.email ?? null
    } catch {
      return null
    }
  }

  const refreshProgress = async () => {
    try {
      const email = await getUserEmail()
      if (!email) {
        setProgress([])
        return
      }

      const res = await fetch(
        `/api/module-progresses?userEmail=${encodeURIComponent(email)}`,
        { credentials: "include" }
      )
      if (!res.ok) {
        console.warn("⚠️ Progress GET failed:", res.status, await res.text())
        return
      }

      const json = await res.json()
      const items: any[] = json?.data ?? []

      const mapped: ModuleProgress[] = items.map((it) => ({
        id: it.id,
        moduleId: it.moduleId ?? it.module_id,
        // falls dein ModuleProgress-Typ courseId nicht hat, kannst du diese Zeile löschen
        courseId: it.courseId ?? it.course_id,
        videoWatched: !!(it.videoWatched ?? it.video_watched),
        quizCompleted: !!(it.quizCompleted ?? it.quiz_completed),
        completed: !!it.completed,
      }))

      setProgress(mapped)
    } catch (err) {
      console.error("💥 Fortschritt konnte nicht geladen werden:", err)
    }
  }

  const save = async (data: Partial<ModuleProgress>) => {
    const email = await getUserEmail()
    if (!email) return

    try {
      const res = await fetch("/api/module-progresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userEmail: email,
          moduleId: data.moduleId,
          // ggf. weglassen, falls du kein courseId speicherst
          courseId: (data as any).courseId,
          videoWatched: data.videoWatched,
          quizCompleted: data.quizCompleted,
        }),
      })
      if (!res.ok) {
        console.warn("⚠️ Progress save failed:", res.status, await res.text())
      }
    } catch (e) {
      console.error("💥 Progress save error:", e)
    } finally {
      await refreshProgress()
    }
  }

  const update = async (moduleId: number, updates: Partial<ModuleProgress>) => {
    // unsere /api/module-progresses POST ist idempotent (create/update),
    // daher reicht ein save() mit moduleId + Updates
    await save({ ...updates, moduleId })
  }

  useEffect(() => {
    refreshProgress()
  }, [])

  return (
    <ProgressContext.Provider value={{ progress, refreshProgress, save, update }}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider")
  return ctx
}

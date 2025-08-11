'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ModuleProgress } from '@/lib/progress';
import { getProgressList, saveProgress } from '@/lib/progress';

interface ProgressContextType {
  progress: ModuleProgress[];
  refreshProgress: () => Promise<void>;
  // speichert/updatet per moduleId + Patch
  save: (moduleId: number, patch: { videoWatched?: boolean; quizCompleted?: boolean }) => Promise<void>;
  update: (moduleId: number, patch: { videoWatched?: boolean; quizCompleted?: boolean }) => Promise<void>;
}

export const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<ModuleProgress[]>([]);

  const refreshProgress = async () => {
    try {
      const data = await getProgressList(); // liest User aus Cookie, keine Query-Params nötig
      setProgress(data);
    } catch (err) {
      console.error('⚠️ Fortschritt konnte nicht geladen werden:', err);
    }
  };

  const save = async (
    moduleId: number,
    patch: { videoWatched?: boolean; quizCompleted?: boolean }
  ) => {
    try {
      await saveProgress(moduleId, patch); // POST /api/module-progresses (upsert)
    } catch (e) {
      console.error('💥 Progress save error:', e);
    } finally {
      await refreshProgress();
    }
  };

  // alias – gleiche Signatur wie save
  const update = save;

  useEffect(() => {
    refreshProgress();
  }, []);

  return (
    <ProgressContext.Provider value={{ progress, refreshProgress, save, update }}>
      {children}
    </ProgressContext.Provider>
  );
}

// optionaler Hook
export const useProgress = () => {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
};

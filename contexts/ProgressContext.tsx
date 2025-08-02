'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ModuleProgress } from '@/lib/types';
import { getProgressByUser, saveProgress, updateProgress } from '@/lib/progress';
import { getToken } from '@/lib/auth'; // ✅ Gültig – gehört nach oben

interface ProgressContextType {
  progress: ModuleProgress[];
  refreshProgress: () => Promise<void>;
  save: (data: Partial<ModuleProgress>) => Promise<void>;
  update: (moduleId: number, updates: Partial<ModuleProgress>) => Promise<void>;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider = ({ children }: { children: React.ReactNode }) => {
  const [progress, setProgress] = useState<ModuleProgress[]>([]);

  const refreshProgress = async () => {
    const token = getToken();
    if (!token) {
      console.warn('⛔ Kein Token vorhanden – Fortschritt wird nicht geladen');
      return;
    }

    try {
      const data = await getProgressByUser();
      setProgress(data);
    } catch (err) {
      console.error('Progress konnte nicht geladen werden', err);
    }
  };

  const save = async (data: Partial<ModuleProgress>) => {
    await saveProgress(data);
    await refreshProgress();
  };

  const update = async (moduleId: number, updates: Partial<ModuleProgress>) => {
    await updateProgress(moduleId, updates);
    await refreshProgress();
  };

  useEffect(() => {
    refreshProgress();
  }, []);

  return (
    <ProgressContext.Provider value={{ progress, refreshProgress, save, update }}>
      {children}
    </ProgressContext.Provider>
  );
};

export function useProgress(): ProgressContextType {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}

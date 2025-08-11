// lib/progress.ts – client-safe, nur relative API-Calls

export type ModuleProgress = {
  id: number;
  moduleId: number;
  videoWatched: boolean;
  quizCompleted: boolean;
  completed: boolean;
};

function normalize(item: any): ModuleProgress {
  if (!item) {
    return { id: 0, moduleId: 0, videoWatched: false, quizCompleted: false, completed: false };
  }
  if (item.attributes) {
    const a = item.attributes;
    const moduleId = a.module?.data?.id ?? a.module_id ?? a.moduleId ?? 0;
    return {
      id: item.id,
      moduleId: Number(moduleId) || 0,
      videoWatched: Boolean(a.videoWatched ?? a.video_watched ?? a.video_completed ?? false),
      quizCompleted: Boolean(a.quizCompleted ?? a.quiz_completed ?? false),
      completed: Boolean(a.completed ?? false),
    };
  }
  return {
    id: item.id ?? 0,
    moduleId: Number(item.moduleId ?? item.module_id ?? 0),
    videoWatched: Boolean(item.videoWatched ?? item.video_watched ?? false),
    quizCompleted: Boolean(item.quizCompleted ?? item.quiz_completed ?? false),
    completed: Boolean(item.completed ?? false),
  };
}

export async function getProgressList(moduleId?: number): Promise<ModuleProgress[]> {
  const url = moduleId
    ? `/api/module-progresses?moduleId=${encodeURIComponent(String(moduleId))}`
    : `/api/module-progresses`;

  const res = await fetch(url, { method: "GET", credentials: "include", cache: "no-store" });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.warn("⚠️ Progress GET failed:", res.status, txt);
    throw new Error("Fehler beim Laden des Fortschritts");
  }
  const json = await res.json();
  const list = json?.data ?? json ?? [];
  return Array.isArray(list) ? list.map(normalize) : [];
}

export async function saveProgress(
  moduleId: number,
  patch: { videoWatched?: boolean; quizCompleted?: boolean }
): Promise<ModuleProgress> {
  const res = await fetch(`/api/module-progresses`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ moduleId, ...patch }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.warn("⚠️ Progress POST failed:", res.status, txt);
    throw new Error("Fehler beim Speichern des Fortschritts");
  }
  const json = await res.json();
  return normalize(json?.data ?? json);
}

// Für Alt-Code: gleicher Funktionsumfang wie getProgressList
export const getProgressByUser = getProgressList;

// Alias – wir nutzen immer POST (upsert)
export async function updateProgress(
  moduleId: number,
  patch: { videoWatched?: boolean; quizCompleted?: boolean }
): Promise<ModuleProgress> {
  return saveProgress(moduleId, patch);
}

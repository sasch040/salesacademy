// lib/progress.ts
export type ModuleProgress = {
  id: number
  moduleId: number
  videoWatched: boolean
  quizCompleted: boolean
  completed: boolean
};

// Liste des eingeloggten Users
export async function getProgressByUser(): Promise<ModuleProgress[]> {
  const res = await fetch("/api/module-progresses", { credentials: "include" });
  if (!res.ok) throw new Error("Fehler beim Laden des Fortschritts");
  const data = await res.json();
  return data?.data ?? []; // unsere GET-Route liefert { data, total }
}

// Upsert: existiert (user × module) -> Update, sonst Create
export async function saveProgress(
  moduleId: number,
  patch: Partial<Pick<ModuleProgress, "videoWatched" | "quizCompleted">>
) {
  const res = await fetch("/api/module-progresses", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ moduleId, ...patch }),
  });
  if (!res.ok) throw new Error("Fehler beim Speichern des Fortschritts");
  return res.json();
}

// Alias auf Upsert (PUT per moduleId wäre falsch, da [id]-Route die Progress-ID erwartet)
export async function updateProgress(
  moduleId: number,
  patch: Partial<Pick<ModuleProgress, "videoWatched" | "quizCompleted">>
) {
  return saveProgress(moduleId, patch);
}

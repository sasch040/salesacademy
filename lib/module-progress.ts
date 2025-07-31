// Module Progress API Client
export interface ModuleProgress {
  id?: number
  userEmail: string
  module_id: number
  course_id?: number
  video_completed: boolean
  quiz_completed: boolean
  completed: boolean
  last_accessed?: string
  completed_at?: string | null
}

export interface ModuleProgressResponse {
  success: boolean
  action: "created" | "updated"
  data: any
}

export interface ModuleProgressListResponse {
  data: ModuleProgress[]
  byUser: Record<string, ModuleProgress[]>
  byModule: Record<string, ModuleProgress[]>
  byCourse: Record<string, ModuleProgress[]>
}

// API-Funktionen für Module Progress
export async function saveModuleProgress(progress: {
  userEmail: string
  module_id: number
  course_id?: number
  video_completed?: boolean
  quiz_completed?: boolean
}): Promise<ModuleProgressResponse> {
  try {
    console.log("💾 Saving module progress:", progress)

    const response = await fetch("/api/module-progresses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(progress),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    const result = await response.json()
    console.log("✅ Module progress saved:", result)
    return result
  } catch (error) {
    console.error("💥 Error saving module progress:", error)
    throw error
  }
}

export async function getModuleProgress(params: {
  userEmail?: string
  moduleId?: number
  courseId?: number
}): Promise<ModuleProgressListResponse> {
  try {
    const searchParams = new URLSearchParams()
    if (params.userEmail) searchParams.set("userEmail", params.userEmail)
    if (params.moduleId) searchParams.set("moduleId", params.moduleId.toString())
    if (params.courseId) searchParams.set("courseId", params.courseId.toString())

    const url = `/api/module-progresses?${searchParams.toString()}`
    console.log("📡 Fetching module progress from:", url)

    const response = await fetch(url)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    const result = await response.json()
    console.log("✅ Module progress loaded:", result)
    return result
  } catch (error) {
    console.error("💥 Error fetching module progress:", error)
    throw error
  }
}

// Hilfsfunktionen
export function isModuleCompleted(progress: ModuleProgress): boolean {
  return progress.video_completed && progress.quiz_completed
}

export function getModuleProgressPercentage(progress: ModuleProgress): number {
  let completed = 0
  if (progress.video_completed) completed += 50
  if (progress.quiz_completed) completed += 50
  return completed
}

export function getUserProgressForCourse(
  progressData: ModuleProgressListResponse,
  userEmail: string,
  courseId: number,
): ModuleProgress[] {
  const userProgress = progressData.byUser[userEmail] || []
  return userProgress.filter((p) => p.course_id === courseId)
}

export function getCourseCompletionPercentage(
  progressData: ModuleProgressListResponse,
  userEmail: string,
  courseId: number,
  totalModules: number,
): number {
  const userProgress = getUserProgressForCourse(progressData, userEmail, courseId)
  const completedModules = userProgress.filter((p) => isModuleCompleted(p)).length
  return totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0
}

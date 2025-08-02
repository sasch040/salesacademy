// TypeScript Interfaces für Authentication & Progress
// TODO: Mit ChatGPT implementieren

export interface User {
  id: number
  email: string
  jwt: string
}

export interface ModuleProgress {
  id: number
  module: number
  user: number
  completed: boolean
  quizCompleted: boolean
  quizScore: number
}

// TODO: Weitere Interfaces nach Bedarf hinzufügen

"use client"

import { Progress } from "@/components/ui/progress"

interface ProgressTrackerProps {
  completed: number
  total: number
}

export default function ProgressTracker({ completed, total }: ProgressTrackerProps) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-slate-600 font-medium">
        <span>Fortschritt</span>
        <span>{percent}%</span>
      </div>
      <Progress value={percent} className="h-2 bg-slate-200" />
      <p className="text-xs text-slate-500">
        {completed} von {total} Modulen abgeschlossen
      </p>
    </div>
  )
}

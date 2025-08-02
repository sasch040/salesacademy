"use client"

import { CheckCircle, Video, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { ModuleProgress } from "@/lib/types"

interface ModuleProgressProps {
  title: string
  progress: Partial<ModuleProgress>
}

export default function ModuleProgressDisplay({ title, progress }: ModuleProgressProps) {
  const isDone = progress.completed
  const videoDone = progress.videoWatched
  const quizDone = progress.quizCompleted

  return (
    <div
      className={cn(
        "border rounded-xl px-4 py-3 flex items-center justify-between",
        isDone ? "bg-green-50 border-green-200" : "bg-white"
      )}
    >
      <div className="flex flex-col">
        <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
        <div className="text-xs text-slate-600 mt-1 flex gap-4">
          <span className={videoDone ? "text-green-600" : ""}>
            <Video className="inline w-4 h-4 mr-1" />
            Video
          </span>
          <span className={quizDone ? "text-green-600" : ""}>
            <HelpCircle className="inline w-4 h-4 mr-1" />
            Quiz
          </span>
        </div>
      </div>

      {isDone ? (
        <CheckCircle className="w-6 h-6 text-green-500" />
      ) : (
        <CheckCircle className="w-6 h-6 text-gray-300" />
      )}
    </div>
  )
}

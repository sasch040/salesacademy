"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, ExternalLink } from "lucide-react"

interface DocumentPreviewProps {
  title: string
  fileUrl: string | null
  type: string
  children: React.ReactNode
}

export function DocumentPreview({ title, fileUrl, type, children }: DocumentPreviewProps) {
  const [isOpen, setIsOpen] = useState(false)

  const lowerType = type?.toLowerCase() || ""

  const renderPreview = () => {
    if (!fileUrl) {
      return (
        <div className="p-6 text-center text-red-500">
          ⚠️ Für diese Datei ist keine Vorschau verfügbar.
        </div>
      )
    }

    if (lowerType === "pdf") {
      return (
        <div className="w-full h-[600px] bg-slate-50 rounded-lg overflow-hidden">
          <iframe
            src={`${fileUrl}#toolbar=1&navpanes=0&scrollbar=1`}
            className="w-full h-full border-0"
            title={`Preview of ${title}`}
          />
        </div>
      )
    }

    if (["image", "jpg", "jpeg", "png", "gif", "webp"].includes(lowerType)) {
      return (
        <div className="w-full max-h-[600px] flex items-center justify-center bg-slate-50 rounded-lg overflow-hidden">
          <img
            src={fileUrl}
            alt={title}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )
    }

    if (["video", "mp4", "webm", "ogg"].includes(lowerType)) {
      return (
        <div className="w-full bg-slate-50 rounded-lg overflow-hidden">
          <video controls className="w-full max-h-[600px]" preload="metadata">
            <source src={fileUrl} type={`video/${lowerType === "video" ? "mp4" : lowerType}`} />
            Ihr Browser unterstützt dieses Video nicht.
          </video>
        </div>
      )
    }

    // PowerPoint oder andere nicht unterstützte Formate
    return (
      <div className="text-center p-6">
        <p className="text-slate-600 mb-4">
          Diese Datei kann nicht direkt angezeigt werden.
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => window.open(fileUrl, "_blank")}
            className="bg-blue-600 text-white"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            In neuem Tab öffnen
          </Button>
          <Button
            onClick={() => {
              const link = document.createElement("a")
              link.href = fileUrl
              link.download = title
              link.click()
            }}
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            Herunterladen
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-lg font-bold text-slate-800 pr-8">
            {title}
          </DialogTitle>
          <DialogDescription>
            Vorschau einer Datei vom Typ <strong>{type}</strong>. Wenn die Vorschau nicht funktioniert, können Sie die Datei herunterladen oder in einem neuen Tab öffnen.
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 overflow-auto flex-1">{renderPreview()}</div>
      </DialogContent>
    </Dialog>
  )
}

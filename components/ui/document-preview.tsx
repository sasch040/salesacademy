"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Eye, X, Download, ExternalLink } from 'lucide-react'

interface DocumentPreviewProps {
  title: string
  fileUrl: string
  type: string
  children: React.ReactNode
}

export function DocumentPreview({ title, fileUrl, type, children }: DocumentPreviewProps) {
  const [isOpen, setIsOpen] = useState(false)

  const renderPreview = () => {
    const lowerType = type.toLowerCase()

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

    if (lowerType === "image" || ["jpg", "jpeg", "png", "gif", "webp"].includes(lowerType)) {
      return (
        <div className="w-full max-h-[600px] bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center">
          <img
            src={fileUrl || "/placeholder.svg"}
            alt={title}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )
    }

    if (lowerType === "video" || ["mp4", "webm", "ogg"].includes(lowerType)) {
      return (
        <div className="w-full bg-slate-50 rounded-lg overflow-hidden">
          <video
            controls
            className="w-full max-h-[600px]"
            preload="metadata"
          >
            <source src={fileUrl} type={`video/${lowerType === "video" ? "mp4" : lowerType}`} />
            Ihr Browser unterstützt das Video-Element nicht.
          </video>
        </div>
      )
    }

    // Für andere Dateitypen (PowerPoint, Excel, etc.)
    return (
      <div className="w-full h-[600px] bg-slate-50 rounded-lg flex flex-col items-center justify-center text-center p-8">
        <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mb-6">
          <ExternalLink className="h-12 w-12 text-slate-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Vorschau nicht verfügbar</h3>
        <p className="text-slate-600 mb-6">
          Für {type}-Dateien ist keine Vorschau verfügbar. Sie können die Datei herunterladen oder in einem neuen Tab öffnen.
        </p>
        <div className="flex gap-3">
          <Button
            onClick={() => window.open(fileUrl, "_blank")}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            In neuem Tab öffnen
          </Button>
          <Button
            onClick={() => {
              const link = document.createElement('a')
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
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold text-slate-800 pr-8">
              {title}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => window.open(fileUrl, "_blank")}
                variant="outline"
                size="sm"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Öffnen
              </Button>
              <Button
                onClick={() => {
                  const link = document.createElement('a')
                  link.href = fileUrl
                  link.download = title
                  link.click()
                }}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="p-6 overflow-auto flex-1">
          {renderPreview()}
        </div>
      </DialogContent>
    </Dialog>
  )
}

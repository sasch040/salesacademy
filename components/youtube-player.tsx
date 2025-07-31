"use client"

import { useState, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface YouTubePlayerProps {
  videoUrl: string
  title: string
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
}

export function YouTubePlayer({ videoUrl, title, onPlay, onPause, onEnded }: YouTubePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [embedUrl, setEmbedUrl] = useState("")

  // YouTube URL zu Embed URL konvertieren
  useEffect(() => {
    const convertToEmbedUrl = (url: string) => {
      try {
        // Verschiedene YouTube URL Formate unterstützen
        let videoId = ""

        if (url.includes("youtube.com/watch?v=")) {
          videoId = url.split("v=")[1]?.split("&")[0]
        } else if (url.includes("youtu.be/")) {
          videoId = url.split("youtu.be/")[1]?.split("?")[0]
        } else if (url.includes("youtube.com/embed/")) {
          videoId = url.split("embed/")[1]?.split("?")[0]
        }

        if (videoId) {
          // YouTube Embed URL mit Parametern für bessere Kontrolle
          const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1&showinfo=0&controls=1&autoplay=0`
          setEmbedUrl(embedUrl)
          console.log("✅ YouTube URL converted:", embedUrl)
        } else {
          console.warn("⚠️ Could not extract video ID from:", url)
          setEmbedUrl("")
        }
      } catch (error) {
        console.error("❌ Error converting YouTube URL:", error)
        setEmbedUrl("")
      }
    }

    if (videoUrl) {
      convertToEmbedUrl(videoUrl)
    }
  }, [videoUrl])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    if (!isPlaying) {
      onPlay?.()
    } else {
      onPause?.()
    }
  }

  const handleMuteToggle = () => {
    setIsMuted(!isMuted)
  }

  const openFullscreen = () => {
    if (embedUrl) {
      window.open(embedUrl, "_blank")
    }
  }

  const restartVideo = () => {
    // Reload iframe to restart video
    const iframe = document.querySelector(`iframe[src*="${embedUrl}"]`) as HTMLIFrameElement
    if (iframe) {
      iframe.src = iframe.src
    }
    setIsPlaying(false)
  }

  // Fallback für nicht-YouTube URLs
  if (!embedUrl) {
    return (
      <div className="aspect-video bg-slate-200 rounded-lg flex items-center justify-center">
        <div className="text-center p-6">
          <Play className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-slate-700 mb-2">{title}</h4>
          <p className="text-slate-600 mb-4">Video kann nicht geladen werden</p>
          <p className="text-xs text-slate-400 break-all">{videoUrl}</p>
          <Button
            onClick={() => window.open(videoUrl, "_blank")}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white"
          >
            Video extern öffnen
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative group">
      {/* Video Container */}
      <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => console.log("✅ YouTube iframe loaded")}
        />
      </div>

      {/* Custom Controls Overlay */}
      

      {/* Video Info */}
      <div className="mt-4 text-center">
        <h4 className="text-lg font-bold text-slate-800 mb-2">{title}</h4>
        <div className="flex items-center justify-center gap-4 text-sm text-slate-600">
          
          
        </div>
      </div>
    </div>
  )
}

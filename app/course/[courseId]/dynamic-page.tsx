"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Play,
  FileText,
  Award,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { YouTubePlayer } from "@/components/youtube-player"

// ✅ Progress-Helpers (gleiche wie in der normalen Course-Page)
import { getProgressList, saveProgress } from "@/lib/progress"

// Types
interface DynamicModule {
  id: number
  title: string
  description: string
  duration: string
  type: "video"
  completed: boolean
  videoUrl: string
  videoTitle: string
  quiz: {
    id: number
    questions: Array<{
      id: number
      question: string
      options: string[]
      correctAnswer: number
    }>
    passingScore: number
  }
}

interface DynamicCourse {
  id: number
  title: string
  description: string
  logo: string
  gradient: string
  modules: DynamicModule[]
}

export default function DynamicCoursePage() {
  const [course, setCourse] = useState<DynamicCourse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedModule, setExpandedModule] = useState<number | null>(null)

  const [videoStates, setVideoStates] = useState<{
    [key: number]: { isPlaying: boolean; currentTime: number; duration: number; completed: boolean }
  }>({})

  const [quizStates, setQuizStates] = useState<{
    [key: number]: {
      isOpen: boolean
      currentQuestion: number
      answers: number[]
      score: number | null
      completed: boolean
      showFeedback: boolean
      lastAnswerCorrect: boolean
    }
  }>({})

  const router = useRouter()
  const params = useParams<{ courseId: string }>()
  const courseId = params.courseId

  // ---- Data fetching -------------------------------------------------------

  // Kurs laden (über deine interne API)
  useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/courses/${courseId}`, {
          headers: { "Content-Type": "application/json" },
        })
        if (!response.ok) {
          const err = await response.json().catch(() => ({}))
          setError(err?.error || "Kurs konnte nicht geladen werden")
          return
        }
        const courseData = await response.json()
        setCourse(courseData)
      } catch (err) {
        setError("Fehler beim Laden des Kurses")
      } finally {
        setLoading(false)
      }
    }

    if (courseId) loadCourse()
    else {
      setError("Keine Kurs-ID gefunden")
      setLoading(false)
    }
  }, [courseId])

  // Auth prüfen (redirect wenn nicht eingeloggt)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", { method: "GET", credentials: "include" })
        if (!res.ok) {
          router.push("/auth/login")
        }
      } catch {
        router.push("/auth/login")
      }
    }
    checkAuth()
  }, [router])

  // Fortschritt hydratisieren (Video/Quiz-Flags je Modul)
  useEffect(() => {
    if (!course) return
    ;(async () => {
      try {
        const list = await getProgressList() // alle Progress-Einträge des eingeloggten Users
        const byModule = new Map(list.map((p) => [p.moduleId, p]))

        const vs: typeof videoStates = {}
        const qs: typeof quizStates = {}

        course.modules.forEach((m) => {
          const p = byModule.get(m.id)
          vs[m.id] = {
            isPlaying: false,
            currentTime: 0,
            duration: 0,
            completed: !!p?.videoWatched,
          }
          qs[m.id] = {
            isOpen: false,
            currentQuestion: 0,
            answers: [],
            score: null,
            completed: !!p?.quizCompleted,
            showFeedback: false,
            lastAnswerCorrect: false,
          }
        })

        setVideoStates(vs)
        setQuizStates(qs)
      } catch (e) {
        console.error("⚠️ Progress laden fehlgeschlagen:", e)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course?.id])

  // ---- UI-Handler ----------------------------------------------------------

  const toggleModule = (moduleId: number) => {
    setExpandedModule((prev) => (prev === moduleId ? null : moduleId))
  }

  const handleVideoPlay = (moduleId: number) => {
    setVideoStates((prev) => ({
      ...prev,
      [moduleId]: { ...prev[moduleId], isPlaying: true },
    }))
  }

  const handleVideoPause = (moduleId: number) => {
    setVideoStates((prev) => ({
      ...prev,
      [moduleId]: { ...prev[moduleId], isPlaying: false },
    }))
  }

  // ✅ Video-Ende -> lokal + Server via saveProgress
  const handleVideoEnded = async (moduleId: number) => {
    setVideoStates((prev) => ({
      ...prev,
      [moduleId]: { ...prev[moduleId], isPlaying: false, completed: true },
    }))
    try {
      await saveProgress(moduleId, { videoWatched: true }) // schickt { moduleId, videoWatched: true }
    } catch (e) {
      console.error("💥 Fortschritt speichern (Video) fehlgeschlagen:", e)
    }
  }

  const startQuiz = (moduleId: number) => {
    setQuizStates((prev) => ({
      ...prev,
      [moduleId]: {
        isOpen: true,
        currentQuestion: 0,
        answers: [],
        score: null,
        completed: false,
        showFeedback: false,
        lastAnswerCorrect: false,
      },
    }))
  }

  const answerQuestion = (moduleId: number, answerIndex: number) => {
    const module = course?.modules.find((m) => m.id === moduleId)
    if (!module) return

    const currentQuizState = quizStates[moduleId]
    const currentQuestion = module.quiz.questions[currentQuizState?.currentQuestion || 0]
    const isCorrect = answerIndex === currentQuestion?.correctAnswer

    setQuizStates((prev) => ({
      ...prev,
      [moduleId]: { ...prev[moduleId], showFeedback: true, lastAnswerCorrect: isCorrect },
    }))

    setTimeout(() => {
      const newAnswers = [...(currentQuizState?.answers || [])]
      newAnswers[currentQuizState?.currentQuestion || 0] = answerIndex

      const isLastQuestion = (currentQuizState?.currentQuestion || 0) >= module.quiz.questions.length - 1

      if (isLastQuestion) {
        const correctAnswers = newAnswers.reduce((count, answer, index) => {
          return answer === module.quiz.questions[index].correctAnswer ? count + 1 : count
        }, 0)
        const score = Math.round((correctAnswers / module.quiz.questions.length) * 100)

        setQuizStates((prev) => ({
          ...prev,
          [moduleId]: {
            ...prev[moduleId],
            answers: newAnswers,
            score,
            completed: true,
            showFeedback: false,
            lastAnswerCorrect: isCorrect,
          },
        }))

        // ✅ bestanden -> auf dem Server markieren
        if (score >= module.quiz.passingScore) {
          ;(async () => {
            try {
              await saveProgress(moduleId, { quizCompleted: true }) // schickt { moduleId, quizCompleted: true }
            } catch (e) {
              console.error("💥 Fortschritt speichern (Quiz) fehlgeschlagen:", e)
            }
          })()
        }
      } else {
        setQuizStates((prev) => ({
          ...prev,
          [moduleId]: {
            ...prev[moduleId],
            answers: newAnswers,
            currentQuestion: (prev[moduleId]?.currentQuestion || 0) + 1,
            showFeedback: false,
            lastAnswerCorrect: isCorrect,
          },
        }))
      }
    }, isCorrect ? 1500 : 2500)
  }

  const resetQuiz = (moduleId: number) => {
    setQuizStates((prev) => ({
      ...prev,
      [moduleId]: {
        isOpen: true,
        currentQuestion: 0,
        answers: [],
        score: null,
        completed: false,
        showFeedback: false,
        lastAnswerCorrect: false,
      },
    }))
  }

  const isYouTubeUrl = (url: string) => url.includes("youtube.com") || url.includes("youtu.be")

  // ---- UI ------------------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Kurs wird geladen...</p>
          <p className="text-xs text-slate-400 mt-2">Course ID: {courseId}</p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Kurs nicht gefunden</h3>
            <p className="text-slate-600 mb-6">{error}</p>
            <Link href="/dashboard">
              <Button>Zurück zum Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const completedModules =
    course?.modules.filter((m) => {
      const videoCompleted = videoStates[m.id]?.completed || false
      const quizCompleted = quizStates[m.id]?.completed || false
      return videoCompleted && quizCompleted
    }).length || 0

  const totalModules = course?.modules.length || 0
  const progressPercentage = totalModules > 0 ? (completedModules / totalModules) * 100 : 0

  const totalDurationMinutes =
    course?.modules.reduce((total, module) => {
      const duration = module.duration.replace(/[^\d]/g, "")
      return total + (Number.parseInt(duration) || 0)
    }, 0) || 0

  const allModulesCompleted = totalModules > 0 && completedModules === totalModules

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="backdrop-blur-sm bg-white/80 border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:bg-slate-100">
              <ArrowLeft className="h-4 w-4" />
              Zurück zum Dashboard
            </Button>
          </Link>
          <div className="w-px h-6 bg-slate-300 mx-2" />
          <div className="flex items-center gap-2">
            <Image
              src="/images/sales-academy-new-logo.png"
              alt="Sales Academy"
              width={150}
              height={45}
              className="h-6 w-auto drop-shadow-lg"
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).style.display = "none"
              }}
            />
            <span className="text-sm font-bold text-slate-800">Sales Academy</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Course Overview */}
        <Card className="mb-12 bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 flex items-center justify-center">
                <Image
                  src={course?.logo || "/placeholder.svg"}
                  alt={course?.title || "Kurs"}
                  width={64}
                  height={64}
                  className="w-full h-full object-contain drop-shadow-lg"
                  onError={(e) => {
                    ;(e.currentTarget as HTMLImageElement).src = "/placeholder.svg?height=64&width=64&text=Logo"
                  }}
                />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-slate-800">{course?.title || "Kurs"}</CardTitle>
                <p className="text-slate-600 font-light mt-1">{course?.description || "Kursbeschreibung"}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <Clock className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="font-semibold text-slate-800">{totalDurationMinutes} Min</p>
                  <p className="text-sm text-slate-600 font-light">Gesamtdauer</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <FileText className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="font-semibold text-slate-800">{totalModules} Module</p>
                  <p className="text-sm text-slate-600 font-light">Lerneinheiten</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <Award className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="font-semibold text-slate-800">{allModulesCompleted ? "Verfügbar" : "Zertifikat"}</p>
                  <p className="text-sm text-slate-600 font-light">
                    {allModulesCompleted ? "Jetzt downloaden" : "Nach Abschluss"}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-slate-800">Ihr Fortschritt</span>
                <span className="font-bold text-slate-800">{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden mb-2">
                <div
                  className={`bg-gradient-to-r ${course?.gradient || "from-slate-500 to-slate-600"} h-3 rounded-full transition-all duration-500 shadow-sm`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-sm text-slate-600 font-light">
                {completedModules} von {totalModules} Modulen abgeschlossen
              </p>

              {totalModules > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  {allModulesCompleted ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">✅ Kurs abgeschlossen</Badge>
                  ) : progressPercentage > 0 ? (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">📚 In Bearbeitung</Badge>
                  ) : (
                    <Badge className="bg-slate-100 text-slate-800 border-slate-200">🚀 Bereit zum Start</Badge>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Modules */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-8">Kursmodule ({course.modules.length})</h2>

          {course.modules.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Module werden aus der Courses API geladen...</p>
              <p className="text-xs text-slate-400 mt-2">Course ID: {courseId}</p>
            </div>
          ) : (
            course.modules.map((module, index) => {
              const isVideoCompleted = videoStates[module.id]?.completed || false
              const isQuizCompleted = quizStates[module.id]?.completed || false
              const isModuleCompleted = isVideoCompleted && isQuizCompleted

              return (
                <Card
                  key={module.id}
                  className={`bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
                    isModuleCompleted ? "ring-2 ring-green-200" : ""
                  }`}
                >
                  <CardContent className="p-8">
                    <div className="flex items-start gap-6">
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                            isModuleCompleted
                              ? "bg-gradient-to-br from-green-500 to-green-600"
                              : "bg-gradient-to-br from-slate-200 to-slate-300"
                          }`}
                        >
                          {isModuleCompleted ? (
                            <CheckCircle className="h-6 w-6 text-white" />
                          ) : (
                            <Play className="h-6 w-6 text-slate-600" />
                          )}
                        </div>
                        <span className="text-xs font-medium text-slate-500">#{index + 1}</span>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">{module.title}</h3>
                            <p className="text-slate-600 font-light leading-relaxed">{module.description}</p>
                          </div>
                          <Badge
                            className={`ml-4 ${
                              isModuleCompleted
                                ? "bg-green-100 text-green-700 border-green-200"
                                : isVideoCompleted || isQuizCompleted
                                  ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                  : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            {isModuleCompleted
                              ? "✅ Abgeschlossen"
                              : isVideoCompleted && !isQuizCompleted
                                ? "📝 Quiz offen"
                                : !isVideoCompleted && isQuizCompleted
                                  ? "📹 Video offen"
                                  : "🚀 Bereit"}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between mt-6">
                          <div className="flex items-center gap-4">
                            <Badge variant="default" className="px-3 py-1 rounded-full bg-slate-800 text-white">
                              {isYouTubeUrl(module.videoUrl) ? "📺 YouTube" : "📹 Video"}
                            </Badge>
                            <span className="text-sm text-slate-600 font-medium">{module.duration}</span>

                            {isVideoCompleted && (
                              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                ✅ Video abgeschlossen
                              </Badge>
                            )}

                            {isQuizCompleted && (
                              <Badge className="bg-green-100 text-green-700 border-green-200">
                                🎯 Quiz bestanden ({quizStates[module.id]?.score}%)
                              </Badge>
                            )}
                          </div>

                          <Button
                            onClick={() => toggleModule(module.id)}
                            className={`px-6 py-2 rounded-xl shadow-lg transition-all duration-200 flex items-center gap-2 ${
                              isModuleCompleted
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : `bg-gradient-to-r ${course.gradient} hover:shadow-xl text-white`
                            }`}
                          >
                            {expandedModule === module.id ? (
                              <>
                                Schließen
                                <ChevronUp className="h-4 w-4" />
                              </>
                            ) : (
                              <>
                                {isModuleCompleted ? "✓ Wiederholen" : "Ansehen"}
                                <ChevronDown className="h-4 w-4" />
                              </>
                            )}
                          </Button>
                        </div>

                        {/* Expanded Module Content */}
                        {expandedModule === module.id && (
                          <div className="mt-8 space-y-6">
                            {/* Video Section */}
                            <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-100">
                              {isYouTubeUrl(module.videoUrl) ? (
                                <div>
                                  <YouTubePlayer
                                    videoUrl={module.videoUrl}
                                    title={module.videoTitle || module.title}
                                    onPlay={() => handleVideoPlay(module.id)}
                                    onPause={() => handleVideoPause(module.id)}
                                    onEnded={() => handleVideoEnded(module.id)}
                                  />

                                  <div className="mt-6 text-center">
                                    {isVideoCompleted ? (
                                      <div className="flex items-center justify-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <span className="text-green-800 font-medium">Video abgeschlossen</span>
                                      </div>
                                    ) : (
                                      <Button
                                        onClick={() => handleVideoEnded(module.id)}
                                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Video als abgeschlossen markieren
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center mb-4">
                                  <h4 className="text-lg font-bold text-slate-800 mb-2">
                                    📹 {module.videoTitle || module.title}
                                  </h4>
                                  <div className="aspect-video bg-slate-200 rounded-lg flex items-center justify-center mb-4">
                                    <div className="text-center">
                                      <Play className="h-16 w-16 text-slate-400 mx-auto mb-2" />
                                      <p className="text-slate-600">Video wird geladen...</p>
                                      <p className="text-xs text-slate-400 mt-1 break-all">{module.videoUrl}</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-2 justify-center">
                                    <Button
                                      onClick={() => window.open(module.videoUrl, "_blank")}
                                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-xl"
                                    >
                                      <ExternalLink className="h-4 w-4 mr-2" />
                                      Video extern öffnen
                                    </Button>
                                    <Button
                                      onClick={() => handleVideoEnded(module.id)}
                                      variant="outline"
                                      className="px-6 py-2 rounded-xl"
                                    >
                                      Als angesehen markieren
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Quiz Section */}
                            <div className="p-6 bg-blue-50 rounded-2xl border-2 border-blue-100">
                              <div className="text-center">
                                <h4 className="text-lg font-bold text-slate-800 mb-2">🧠 Quiz</h4>
                                <p className="text-slate-600 mb-4">
                                  Testen Sie Ihr Wissen mit {module.quiz.questions.length} Fragen
                                </p>

                                {!quizStates[module.id]?.isOpen ? (
                                  <Button
                                    onClick={() => startQuiz(module.id)}
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-xl"
                                  >
                                    🚀 Quiz starten ({module.quiz.questions.length} Fragen)
                                  </Button>
                                ) : (
                                  <div className="text-left">
                                    {!quizStates[module.id]?.completed ? (
                                      <div>
                                        <div className="mb-4">
                                          <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-slate-700">
                                              Frage {(quizStates[module.id]?.currentQuestion || 0) + 1} von{" "}
                                              {module.quiz.questions.length}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                              Mindestpunktzahl: {module.quiz.passingScore}%
                                            </span>
                                          </div>
                                          <div className="w-full bg-slate-200 rounded-full h-2">
                                            <div
                                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                              style={{
                                                width: `${
                                                  ((quizStates[module.id]?.currentQuestion || 0) /
                                                    module.quiz.questions.length) *
                                                  100
                                                }%`,
                                              }}
                                            />
                                          </div>
                                        </div>

                                        <div className="bg-white p-4 rounded-lg mb-4">
                                          <h5 className="font-semibold text-slate-800 mb-3">
                                            {
                                              module.quiz.questions[quizStates[module.id]?.currentQuestion || 0]
                                                ?.question
                                            }
                                          </h5>
                                          <div className="space-y-2">
                                            {module.quiz.questions[
                                              quizStates[module.id]?.currentQuestion || 0
                                            ]?.options?.map((option, optionIndex) => (
                                              <button
                                                key={optionIndex}
                                                onClick={() => answerQuestion(module.id, optionIndex)}
                                                disabled={quizStates[module.id]?.showFeedback}
                                                className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                                                  quizStates[module.id]?.showFeedback
                                                    ? optionIndex ===
                                                      module.quiz.questions[quizStates[module.id]?.currentQuestion || 0]
                                                        ?.correctAnswer
                                                      ? "bg-green-100 border-green-300 text-green-800"
                                                      : "bg-red-100 border-red-300 text-red-800"
                                                    : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                                                }`}
                                              >
                                                {option}
                                              </button>
                                            ))}
                                          </div>
                                        </div>

                                        {quizStates[module.id]?.showFeedback && (
                                          <div
                                            className={`p-3 rounded-lg mb-4 ${
                                              quizStates[module.id]?.lastAnswerCorrect
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                            }`}
                                          >
                                            {quizStates[module.id]?.lastAnswerCorrect
                                              ? "✅ Richtig!"
                                              : "❌ Leider falsch."}
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="text-center">
                                        <div
                                          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                                            (quizStates[module.id]?.score || 0) >= module.quiz.passingScore
                                              ? "bg-green-100"
                                              : "bg-red-100"
                                          }`}
                                        >
                                          <span className="text-2xl">
                                            {(quizStates[module.id]?.score || 0) >= module.quiz.passingScore
                                              ? "🎉"
                                              : "😔"}
                                          </span>
                                        </div>
                                        <h5 className="text-xl font-bold text-slate-800 mb-2">Quiz abgeschlossen!</h5>
                                        <p className="text-slate-600 mb-4">
                                          Ihre Punktzahl: {quizStates[module.id]?.score || 0}% (Benötigt:{" "}
                                          {module.quiz.passingScore}%)
                                        </p>
                                        <Button
                                          onClick={() => resetQuiz(module.id)}
                                          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-xl"
                                        >
                                          🔄 Quiz wiederholen
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* Certificate Section */}
        {course && totalModules > 0 && allModulesCompleted && (
          <Card className="mt-12 bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Award className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-slate-800 mb-4">Herzlichen Glückwunsch!</h3>
              <p className="text-slate-600 mb-8 text-lg font-light max-w-2xl mx-auto">
                Sie haben den Kurs "{course.title}" erfolgreich abgeschlossen!
              </p>
              <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                📜 Zertifikat herunterladen
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

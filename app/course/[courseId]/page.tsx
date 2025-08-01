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

// Types für ID-basierte Daten
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
    timeLimit?: number
  }
}

interface DynamicCourse {
  id: number
  title: string
  description: string
  logo: any // Updated to any to handle different logo structures
  gradient: string
  modules: DynamicModule[]
}

export default function CoursePage() {
  const [course, setCourse] = useState<DynamicCourse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState("")
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

  // Course loading über direkte API
  useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true)
        console.log("🔍 === COURSE PAGE: Loading course ===")
        console.log("🎯 Course ID from URL:", courseId)

        // Direkte Course API Abfrage
        console.log("📡 Loading course data via direct Course API")
        const response = await fetch(`/api/courses/${courseId}`, {
          headers: {
            "Content-Type": "application/json",
          },
        })

        console.log("📡 Course API Response Status:", response.status)

        if (response.ok) {
          const courseData = await response.json()
          console.log("✅ Course API Data Received")
          console.log("📝 Course Title:", courseData.title)
          console.log("🔢 Course ID:", courseData.id)
          console.log("🖼️ Course Logo URL:", courseData.logo)
          console.log("🔗 Logo Source:", courseData.logo ? "API" : "Placeholder")
          console.log("📚 Modules Count:", courseData.modules?.length || 0)

          // NEUE DEBUG INFO FÜR LOGO
          console.log("=== LOGO DEBUG INFO ===")
          console.log("Raw Logo Value:", JSON.stringify(courseData.logo))
          console.log("Logo Type:", typeof courseData.logo)
          console.log("Logo Length:", courseData.logo?.length || 0)
          console.log("Is Logo Truthy:", !!courseData.logo)
          console.log("========================")

          setCourse(courseData)
          console.log("✅ Course state updated")
        } else {
          const errorData = await response.json()
          console.error("❌ Course API failed:", errorData)
          setError(errorData.error || "Kurs konnte nicht geladen werden")
        }
      } catch (err) {
        console.error("💥 Course loading error:", err)
        setError("Fehler beim Laden des Kurses")
      } finally {
        setLoading(false)
        console.log("🏁 Course loading finished")
      }
    }

    if (courseId) {
      console.log("🚀 Starting course load for ID:", courseId)
      loadCourse()
    } else {
      console.error("❌ No courseId provided")
      setError("Keine Kurs-ID gefunden")
      setLoading(false)
    }
  }, [courseId])

  // User authentication
  useEffect(() => {
    const email = localStorage.getItem("userEmail")
    if (!email) {
      router.push("/login")
    } else {
      setUserEmail(email)
    }
  }, [router])

  // ID-basierte Funktionen
  const toggleModule = (moduleId: number) => {
    console.log("🔄 Toggling module:", moduleId)
    setExpandedModule((prev) => (prev === moduleId ? null : moduleId))
  }

  const handleVideoPlay = (moduleId: number) => {
    console.log("🎥 Video started for module:", moduleId)
    setVideoStates((prev) => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        isPlaying: true,
      },
    }))
  }

  const handleVideoPause = (moduleId: number) => {
    console.log("⏸️ Video paused for module:", moduleId)
    setVideoStates((prev) => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        isPlaying: false,
      },
    }))
  }

  const handleVideoEnded = (moduleId: number) => {
    console.log("✅ Video completed for module:", moduleId)
    setVideoStates((prev) => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        isPlaying: false,
        completed: true,
      },
    }))
  }

  const startQuiz = (moduleId: number) => {
    console.log("🧠 Starting quiz for module:", moduleId)
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
    console.log("📝 Answering question for module:", moduleId, "answer:", answerIndex)
    const module = course?.modules.find((m) => m.id === moduleId)
    if (!module) return

    const currentQuizState = quizStates[moduleId]
    const currentQuestion = module.quiz.questions[currentQuizState?.currentQuestion || 0]
    const isCorrect = answerIndex === currentQuestion?.correctAnswer

    console.log(`📝 Question: "${currentQuestion.question}"`)
    console.log(`📝 Selected: "${currentQuestion.options[answerIndex]}" (index: ${answerIndex})`)
    console.log(
      `📝 Correct: "${currentQuestion.options[currentQuestion.correctAnswer]}" (index: ${currentQuestion.correctAnswer})`,
    )
    console.log(`📝 Is Correct: ${isCorrect}`)

    setQuizStates((prev) => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        showFeedback: true,
        lastAnswerCorrect: isCorrect,
      },
    }))

    setTimeout(
      () => {
        const newAnswers = [...(currentQuizState?.answers || [])]
        newAnswers[currentQuizState?.currentQuestion || 0] = answerIndex

        const isLastQuestion = (currentQuizState?.currentQuestion || 0) >= module.quiz.questions.length - 1

        if (isLastQuestion) {
          const correctAnswers = newAnswers.reduce((count, answer, index) => {
            return answer === module.quiz.questions[index].correctAnswer ? count + 1 : count
          }, 0)
          const score = Math.round((correctAnswers / module.quiz.questions.length) * 100)

          console.log(
            `🎯 Quiz completed for module ${moduleId}: ${correctAnswers}/${module.quiz.questions.length} correct (${score}%)`,
          )

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
      },
      isCorrect ? 1500 : 2500,
    )
  }

  const resetQuiz = (moduleId: number) => {
    console.log("🔄 Resetting quiz for module:", moduleId)
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

  // Hilfsfunktion um zu prüfen ob URL ein YouTube-Link ist
  const isYouTubeUrl = (url: string) => {
    return url.includes("youtube.com") || url.includes("youtu.be")
  }

  // Loading State
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

  // Error State
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

  // Fortschrittsberechnung
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
          <div className="w-px h-6 bg-slate-300 mx-2"></div>
          <div className="flex items-center gap-2">
            <Image
              src="/images/sales-academy-logo.png"
              alt="Sales Academy"
              width={150}
              height={45}
              className="h-6 w-auto drop-shadow-lg"
              onError={(e) => {
                e.currentTarget.style.display = "none"
              }}
            />
            <span className="text-sm font-bold text-slate-800">Sales Academy</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Course Overview */}
        <Card className="mb-12 bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 flex items-center justify-center">
                <Image
                  src={
                    course?.logo?.formats?.thumbnail?.url ||
                    course?.logo?.url ||
                    `/placeholder.svg?height=64&width=64&text=${encodeURIComponent(course?.title || "Kurs")}`
                  }
                  alt={course?.title || "Kurs"}
                  width={64}
                  height={64}
                  className="w-full h-full object-contain drop-shadow-lg rounded-lg"
                  onError={(e) => {
                    const fallback = `/placeholder.svg?height=64&width=64&text=${encodeURIComponent(
                      course?.title || "Kurs",
                    )}`
                    console.warn("❌ Logo konnte nicht geladen werden:", e.currentTarget.src)
                    e.currentTarget.src = fallback
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
                ></div>
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

        {/* Modules Section */}
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
                            className={`px-8 py-3 rounded-xl shadow-lg transition-all duration-300 flex items-center gap-3 transform hover:scale-105 hover:-translate-y-1 ${
                              isModuleCompleted
                                ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800 hover:from-green-200 hover:to-green-300 border-2 border-green-300"
                                : `bg-gradient-to-r ${course.gradient} hover:shadow-2xl text-white`
                            }`}
                          >
                            <div
                              className={`transition-transform duration-300 ${expandedModule === module.id ? "rotate-180" : "rotate-0"}`}
                            >
                              {expandedModule === module.id ? (
                                <ChevronUp className="h-5 w-5" />
                              ) : (
                                <ChevronDown className="h-5 w-5" />
                              )}
                            </div>
                            <span className="font-semibold">
                              {expandedModule === module.id
                                ? "Schließen"
                                : isModuleCompleted
                                  ? "✓ Wiederholen"
                                  : "Ansehen"}
                            </span>
                            {!expandedModule && !isModuleCompleted && (
                              <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse"></div>
                            )}
                          </Button>
                        </div>

                        {/* Expanded Module Content */}
                        {expandedModule === module.id && (
                          <div className="mt-8 overflow-hidden">
                            <div className="animate-in slide-in-from-top-2 duration-500 ease-out space-y-6">
                              {/* Video Section */}
                              <div className="transform transition-all duration-300 hover:scale-[1.01]">
                                <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                                  <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                      <Play className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                      <h4 className="text-lg font-bold text-slate-800">📹 Video-Lektion</h4>
                                      <p className="text-sm text-slate-600">{module.videoTitle || module.title}</p>
                                    </div>
                                  </div>

                                  {isYouTubeUrl(module.videoUrl) ? (
                                    <div className="space-y-4">
                                      <div className="transform transition-all duration-300 hover:shadow-xl rounded-lg overflow-hidden">
                                        <YouTubePlayer
                                          videoUrl={module.videoUrl}
                                          title={module.videoTitle || module.title}
                                          onPlay={() => handleVideoPlay(module.id)}
                                          onPause={() => handleVideoPause(module.id)}
                                          onEnded={() => handleVideoEnded(module.id)}
                                        />
                                      </div>

                                      {/* Video Completion Button */}
                                      <div className="text-center">
                                        {isVideoCompleted ? (
                                          <div className="animate-in fade-in duration-500 flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-xl">
                                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                                              <CheckCircle className="h-5 w-5 text-white" />
                                            </div>
                                            <span className="text-green-800 font-semibold">
                                              Video erfolgreich abgeschlossen! 🎉
                                            </span>
                                          </div>
                                        ) : (
                                          <Button
                                            onClick={() => handleVideoEnded(module.id)}
                                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                                          >
                                            <CheckCircle className="h-5 w-5 mr-2" />
                                            Video als abgeschlossen markieren
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-center space-y-4">
                                      <div className="aspect-video bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-400 hover:border-slate-500 transition-colors duration-300">
                                        <div className="text-center p-6">
                                          <div className="w-16 h-16 bg-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                            <Play className="h-8 w-8 text-white" />
                                          </div>
                                          <p className="text-slate-600 font-medium">Video wird geladen...</p>
                                          <p className="text-xs text-slate-400 mt-2 break-all max-w-md">
                                            {module.videoUrl}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex gap-3 justify-center">
                                        <Button
                                          onClick={() => window.open(module.videoUrl, "_blank")}
                                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                        >
                                          <ExternalLink className="h-4 w-4 mr-2" />
                                          Video extern öffnen
                                        </Button>
                                        <Button
                                          onClick={() => handleVideoEnded(module.id)}
                                          variant="outline"
                                          className="px-6 py-2 rounded-xl border-2 hover:bg-slate-50 transition-all duration-300 transform hover:scale-105"
                                        >
                                          Als angesehen markieren
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Quiz Section */}
                              <div className="transform transition-all duration-300 hover:scale-[1.01]">
                                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
                                  <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                      <span className="text-lg">🧠</span>
                                    </div>
                                    <div>
                                      <h4 className="text-lg font-bold text-slate-800">Quiz-Challenge</h4>
                                      <p className="text-sm text-slate-600">
                                        Testen Sie Ihr Wissen mit {module.quiz.questions.length} Fragen
                                      </p>
                                    </div>
                                  </div>

                                  <div className="text-center">
                                    {!quizStates[module.id]?.isOpen ? (
                                      <div className="space-y-4">
                                        <div className="p-4 bg-white/70 rounded-xl border border-blue-200">
                                          <div className="flex items-center justify-center gap-6 text-sm text-slate-600">
                                            <div className="flex items-center gap-2">
                                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                              <span>{module.quiz.questions.length} Fragen</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                              <span>{module.quiz.passingScore}% zum Bestehen</span>
                                            </div>
                                            {module.quiz.timeLimit && (
                                              <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                                <span>{module.quiz.timeLimit} Min</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        <Button
                                          onClick={() => startQuiz(module.id)}
                                          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                                        >
                                          <span className="text-lg mr-2">🚀</span>
                                          Quiz starten ({module.quiz.questions.length} Fragen)
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="text-left animate-in slide-in-from-bottom-4 duration-500">
                                        {!quizStates[module.id]?.completed ? (
                                          <div className="space-y-6">
                                            {/* Progress Header */}
                                            <div className="bg-white/80 p-4 rounded-xl border border-blue-200">
                                              <div className="flex justify-between items-center mb-3">
                                                <span className="text-sm font-semibold text-slate-700">
                                                  Frage {(quizStates[module.id]?.currentQuestion || 0) + 1} von{" "}
                                                  {module.quiz.questions.length}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                  <span className="text-xs text-slate-500">Mindestpunktzahl:</span>
                                                  <Badge className="bg-green-100 text-green-800 border-green-200">
                                                    {module.quiz.passingScore}%
                                                  </Badge>
                                                </div>
                                              </div>
                                              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                                                <div
                                                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-700 ease-out shadow-sm"
                                                  style={{
                                                    width: `${((quizStates[module.id]?.currentQuestion || 0) / module.quiz.questions.length) * 100}%`,
                                                  }}
                                                ></div>
                                              </div>
                                            </div>

                                            {/* Question Card */}
                                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-right-4 duration-500">
                                              <h5 className="font-bold text-xl text-slate-800 mb-6 leading-relaxed">
                                                {
                                                  module.quiz.questions[quizStates[module.id]?.currentQuestion || 0]
                                                    ?.question
                                                }
                                              </h5>
                                              <div className="space-y-3">
                                                {module.quiz.questions[
                                                  quizStates[module.id]?.currentQuestion || 0
                                                ]?.options?.map((option, optionIndex) => (
                                                  <button
                                                    key={optionIndex}
                                                    onClick={() => answerQuestion(module.id, optionIndex)}
                                                    disabled={quizStates[module.id]?.showFeedback}
                                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                                                      quizStates[module.id]?.showFeedback
                                                        ? optionIndex ===
                                                          module.quiz.questions[
                                                            quizStates[module.id]?.currentQuestion || 0
                                                          ]?.correctAnswer
                                                          ? "bg-gradient-to-r from-green-100 to-green-50 border-green-300 text-green-800 shadow-lg scale-[1.02]"
                                                          : "bg-gradient-to-r from-red-100 to-red-50 border-red-300 text-red-800 opacity-75"
                                                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300 hover:shadow-md"
                                                    }`}
                                                  >
                                                    <div className="flex items-center gap-3">
                                                      <div
                                                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                                                          quizStates[module.id]?.showFeedback
                                                            ? optionIndex ===
                                                              module.quiz.questions[
                                                                quizStates[module.id]?.currentQuestion || 0
                                                              ]?.correctAnswer
                                                              ? "bg-green-500 border-green-500 text-white"
                                                              : "bg-red-500 border-red-500 text-white"
                                                            : "border-slate-300 text-slate-600"
                                                        }`}
                                                      >
                                                        {String.fromCharCode(65 + optionIndex)}
                                                      </div>
                                                      <span className="font-medium">{option}</span>
                                                    </div>
                                                  </button>
                                                ))}
                                              </div>
                                            </div>

                                            {/* Feedback */}
                                            {quizStates[module.id]?.showFeedback && (
                                              <div
                                                className={`animate-in slide-in-from-bottom-2 duration-300 p-4 rounded-xl border-2 ${
                                                  quizStates[module.id]?.lastAnswerCorrect
                                                    ? "bg-gradient-to-r from-green-100 to-green-50 border-green-300 text-green-800"
                                                    : "bg-gradient-to-r from-red-100 to-red-50 border-red-300 text-red-800"
                                                }`}
                                              >
                                                <div className="flex items-center gap-3">
                                                  <div
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                      quizStates[module.id]?.lastAnswerCorrect
                                                        ? "bg-green-500"
                                                        : "bg-red-500"
                                                    }`}
                                                  >
                                                    <span className="text-white text-lg">
                                                      {quizStates[module.id]?.lastAnswerCorrect ? "✅" : "❌"}
                                                    </span>
                                                  </div>
                                                  <span className="font-semibold">
                                                    {quizStates[module.id]?.lastAnswerCorrect
                                                      ? "Richtig! Gut gemacht! 🎉"
                                                      : "Leider falsch. Nicht aufgeben! 💪"}
                                                  </span>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        ) : (
                                          <div className="text-center animate-in zoom-in duration-500">
                                            <div className="space-y-6">
                                              <div
                                                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-xl animate-bounce ${
                                                  (quizStates[module.id]?.score || 0) >= module.quiz.passingScore
                                                    ? "bg-gradient-to-br from-green-400 to-green-600"
                                                    : "bg-gradient-to-br from-red-400 to-red-600"
                                                }`}
                                              >
                                                <span className="text-3xl">
                                                  {(quizStates[module.id]?.score || 0) >= module.quiz.passingScore
                                                    ? "🎉"
                                                    : "😔"}
                                                </span>
                                              </div>
                                              <div>
                                                <h5 className="text-2xl font-bold text-slate-800 mb-3">
                                                  Quiz abgeschlossen!
                                                </h5>
                                                <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6">
                                                  <p className="text-lg text-slate-700 mb-2">
                                                    <span className="font-bold text-2xl">
                                                      {quizStates[module.id]?.score || 0}%
                                                    </span>
                                                  </p>
                                                  <p className="text-sm text-slate-600">
                                                    Benötigt: {module.quiz.passingScore}% • Status:{" "}
                                                    {(quizStates[module.id]?.score || 0) >= module.quiz.passingScore ? (
                                                      <span className="text-green-600 font-semibold">
                                                        {" "}
                                                        Bestanden ✅
                                                      </span>
                                                    ) : (
                                                      <span className="text-red-600 font-semibold">
                                                        {" "}
                                                        Nicht bestanden ❌
                                                      </span>
                                                    )}
                                                  </p>
                                                </div>
                                                <Button
                                                  onClick={() => resetQuiz(module.id)}
                                                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                                >
                                                  <span className="text-lg mr-2">🔄</span>
                                                  Quiz wiederholen
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
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

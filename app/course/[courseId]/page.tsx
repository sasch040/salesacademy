"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Play, FileText, Award, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const courseData = {
  "smart-nexus": {
    title: "Smart Nexus Schulung",
    description: "Umfassende Schulung für die Smart Nexus Plattform und Funktionen",
    logo: "/images/smart-nexus-clean.png",
    gradient: "from-blue-500 to-blue-600",
    modules: [
      {
        id: 1,
        title: "Einführung in Smart Nexus",
        description: "Lernen Sie die Grundlagen und den Aufbau der Smart Nexus Plattform kennen",
        duration: "15 Min",
        type: "video",
        completed: true,
      },
      {
        id: 2,
        title: "Plattform-Navigation",
        description: "Entdecken Sie alle wichtigen Bereiche und lernen Sie sich effizient zu bewegen",
        duration: "20 Min",
        type: "video",
        completed: true,
      },
      {
        id: 3,
        title: "Erweiterte Funktionen",
        description: "Nutzen Sie fortgeschrittene Features für maximale Produktivität",
        duration: "25 Min",
        type: "video",
        completed: true,
      },
      {
        id: 4,
        title: "Praktische Anwendung",
        description: "Wenden Sie Ihr Wissen in realen Szenarien und Projekten an",
        duration: "30 Min",
        type: "video",
        completed: false,
      },
      {
        id: 5,
        title: "Best Practices",
        description: "Erfahren Sie bewährte Methoden und Tipps von Experten",
        duration: "30 Min",
        type: "video",
        completed: false,
      },
    ],
  },
  "smart-lens": {
    title: "Smart Lens Schulung",
    description: "Lernen Sie Smart Lens für optimale Ergebnisse zu nutzen",
    logo: "/images/smart-lens-clean.png",
    gradient: "from-slate-600 to-slate-700",
    modules: [
      {
        id: 1,
        title: "Smart Lens Grundlagen",
        description: "Verstehen Sie die Kernkonzepte und Einsatzmöglichkeiten von Smart Lens",
        duration: "18 Min",
        type: "video",
        completed: false,
      },
      {
        id: 2,
        title: "Konfiguration",
        description: "Richten Sie Smart Lens optimal für Ihre Bedürfnisse ein",
        duration: "22 Min",
        type: "video",
        completed: false,
      },
      {
        id: 3,
        title: "Erweiterte Analytik",
        description: "Nutzen Sie fortgeschrittene Analyse-Tools für tiefere Einblicke",
        duration: "28 Min",
        type: "video",
        completed: false,
      },
      {
        id: 4,
        title: "Praktische Übungen",
        description: "Festigen Sie Ihr Wissen durch hands-on Übungen und Beispiele",
        duration: "25 Min",
        type: "video",
        completed: false,
      },
      {
        id: 5,
        title: "Implementierungsleitfaden",
        description: "Schritt-für-Schritt Anleitung zur erfolgreichen Umsetzung",
        duration: "35 Min",
        type: "video",
        completed: false,
      },
    ],
  },
  hacktracks: {
    title: "Hacktracks Schulung",
    description: "Meistern Sie Hacktracks Tools und Methoden",
    logo: "/images/hacktracks-clean.png",
    gradient: "from-slate-700 to-slate-800",
    modules: [
      {
        id: 1,
        title: "Hacktracks Überblick",
        description: "Verschaffen Sie sich einen umfassenden Überblick über die Hacktracks Suite",
        duration: "20 Min",
        type: "video",
        completed: false,
      },
      {
        id: 2,
        title: "Sicherheitsgrundlagen",
        description: "Lernen Sie die fundamentalen Sicherheitsprinzipien und -konzepte",
        duration: "30 Min",
        type: "video",
        completed: false,
      },
      {
        id: 3,
        title: "Praktische Anwendungen",
        description: "Setzen Sie Sicherheitstools in realen Umgebungen effektiv ein",
        duration: "40 Min",
        type: "video",
        completed: false,
      },
      {
        id: 4,
        title: "Sicherheitsanalyse",
        description: "Führen Sie professionelle Sicherheitsbewertungen und Audits durch",
        duration: "35 Min",
        type: "video",
        completed: false,
      },
      {
        id: 5,
        title: "Erweiterte Techniken",
        description: "Meistern Sie fortgeschrittene Methoden und spezialisierte Werkzeuge",
        duration: "45 Min",
        type: "video",
        completed: false,
      },
    ],
  },
}

export default function CoursePage() {
  const [userEmail, setUserEmail] = useState("")
  const router = useRouter()
  const params = useParams()
  const courseId = params.courseId as string

  useEffect(() => {
    const email = localStorage.getItem("userEmail")
    if (!email) {
      router.push("/login")
    } else {
      setUserEmail(email)
    }
  }, [router])

  const course = courseData[courseId as keyof typeof courseData]

  if (!course) {
    return <div>Course not found</div>
  }

  const completedModules = course.modules.filter((m) => m.completed).length
  const progressPercentage = (completedModules / course.modules.length) * 100

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
              className="h-6 w-auto"
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
                  src={course.logo || "/placeholder.svg"}
                  alt={course.title}
                  width={64}
                  height={64}
                  className="w-full h-full object-contain drop-shadow-lg"
                />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-slate-800">{course.title}</CardTitle>
                <p className="text-slate-600 font-light mt-1">{course.description}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <Clock className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="font-semibold text-slate-800">
                    {course.modules.reduce((total, module) => total + Number.parseInt(module.duration), 0)} Min
                  </p>
                  <p className="text-sm text-slate-600 font-light">Gesamtdauer</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <FileText className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="font-semibold text-slate-800">{course.modules.length} Module</p>
                  <p className="text-sm text-slate-600 font-light">Lerneinheiten</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <Award className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="font-semibold text-slate-800">Zertifikat</p>
                  <p className="text-sm text-slate-600 font-light">Nach Abschluss</p>
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
                  className={`bg-gradient-to-r ${course.gradient} h-3 rounded-full transition-all duration-500 shadow-sm`}
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <p className="text-sm text-slate-600 font-light">
                {completedModules} von {course.modules.length} Modulen abgeschlossen
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Modules List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-8">Kursmodule</h2>

          {course.modules.map((module, index) => (
            <Card
              key={module.id}
              className={`bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${module.completed ? "ring-2 ring-green-200" : ""}`}
            >
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                        module.completed
                          ? "bg-gradient-to-br from-green-500 to-green-600"
                          : "bg-gradient-to-br from-slate-200 to-slate-300"
                      }`}
                    >
                      {module.completed ? (
                        <CheckCircle className="h-6 w-6 text-white" />
                      ) : module.type === "video" ? (
                        <Play className="h-6 w-6 text-slate-600" />
                      ) : (
                        <FileText className="h-6 w-6 text-slate-600" />
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
                    </div>

                    <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center gap-4">
                        <Badge
                          variant={module.type === "video" ? "default" : "secondary"}
                          className="px-3 py-1 rounded-full"
                        >
                          {module.type === "video" ? "📹 Video" : "📝 Test"}
                        </Badge>
                        <span className="text-sm text-slate-600 font-medium">{module.duration}</span>
                      </div>

                      <Button
                        className={`px-6 py-2 rounded-xl shadow-lg transition-all duration-200 ${
                          module.completed
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : `bg-gradient-to-r ${course.gradient} hover:shadow-xl text-white`
                        }`}
                        disabled={module.completed}
                      >
                        {module.completed ? "✓ Abgeschlossen" : module.type === "video" ? "Ansehen" : "Test starten"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Certificate Section */}
        {progressPercentage === 100 && (
          <Card className="mt-12 bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Award className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-slate-800 mb-4">Herzlichen Glückwunsch!</h3>
              <p className="text-slate-600 mb-8 text-lg font-light max-w-2xl mx-auto">
                Sie haben diesen Kurs erfolgreich abgeschlossen. Laden Sie Ihr professionelles Zertifikat herunter und
                teilen Sie Ihren Erfolg.
              </p>
              <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                Zertifikat herunterladen
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

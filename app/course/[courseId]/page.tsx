"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Play, FileText, Award, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

function getLogoUrl(logo?: string) {
  if (!logo) return "/placeholder.svg"
  if (logo.startsWith("http")) return logo
  return `https://strapi-speicher.s3.eu-central-1.amazonaws.com${logo}`
}

const courseData = {
  "smart-nexus": {
    title: "Smart Nexus Schulung",
    description: "Umfassende Schulung für die Smart Nexus Plattform und Funktionen",
    logo: "https://strapi-speicher.s3.eu-central-1.amazonaws.com/Smart_Nexus_Logo_7e2c4832ff.png",
    gradient: "from-blue-500 to-blue-600",
    modules: [
      { id: 1, title: "Einführung in Smart Nexus", description: "Lernen Sie die Grundlagen", duration: "15", type: "video", completed: true },
      { id: 2, title: "Plattform-Navigation", description: "Entdecken Sie wichtige Bereiche", duration: "20", type: "video", completed: true },
      { id: 3, title: "Erweiterte Funktionen", description: "Fortgeschrittene Features", duration: "25", type: "video", completed: true },
      { id: 4, title: "Praktische Anwendung", description: "Anwendung in realen Szenarien", duration: "30", type: "video", completed: false },
      { id: 5, title: "Best Practices", description: "Bewährte Methoden", duration: "30", type: "video", completed: false }
    ]
  },
  "smart-lens": {
    title: "Smart Lens Schulung",
    description: "Lernen Sie Smart Lens effektiv zu nutzen",
    logo: "https://strapi-speicher.s3.eu-central-1.amazonaws.com/Smart_Lens_Logo_092c7a8838.png",
    gradient: "from-slate-600 to-slate-700",
    modules: [
      { id: 1, title: "Smart Lens Grundlagen", description: "Kernkonzepte und Einsatz", duration: "18", type: "video", completed: false },
      { id: 2, title: "Konfiguration", description: "Optimale Einrichtung", duration: "22", type: "video", completed: false },
      { id: 3, title: "Erweiterte Analytik", description: "Analyse-Tools nutzen", duration: "28", type: "video", completed: false },
      { id: 4, title: "Praktische Übungen", description: "hands-on Beispiele", duration: "25", type: "video", completed: false },
      { id: 5, title: "Implementierungsleitfaden", description: "Schritt-für-Schritt Umsetzung", duration: "35", type: "video", completed: false }
    ]
  },
  hacktracks: {
    title: "Hacktracks Schulung",
    description: "Meistern Sie Hacktracks Tools und Methoden",
    logo: "https://strapi-speicher.s3.eu-central-1.amazonaws.com/Hacks_Tracks_Logo_881c55ef70.png",
    gradient: "from-slate-700 to-slate-800",
    modules: [
      { id: 1, title: "Hacktracks Überblick", description: "Überblick Hacktracks Suite", duration: "20", type: "video", completed: false },
      { id: 2, title: "Sicherheitsgrundlagen", description: "Sicherheitsprinzipien", duration: "30", type: "video", completed: false },
      { id: 3, title: "Praktische Anwendungen", description: "Sicherheitstools nutzen", duration: "40", type: "video", completed: false },
      { id: 4, title: "Sicherheitsanalyse", description: "Sicherheitsbewertungen", duration: "35", type: "video", completed: false },
      { id: 5, title: "Erweiterte Techniken", description: "Spezialisierte Werkzeuge", duration: "45", type: "video", completed: false }
    ]
  }
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

  if (!course) return <div>Course not found</div>

  const completedModules = course.modules.filter((m) => m.completed).length
  const progressPercentage = (completedModules / course.modules.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="backdrop-blur-sm bg-white/80 border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:bg-slate-100">
              <ArrowLeft className="h-4 w-4" /> Zurück zum Dashboard
            </Button>
          </Link>
          <div className="w-px h-6 bg-slate-300 mx-2"></div>
          <div className="flex items-center gap-2">
            <Image src="/images/sales-academy-logo.png" alt="Sales Academy" width={150} height={45} className="h-6 w-auto" />
            <span className="text-sm font-bold text-slate-800">Sales Academy</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <Card className="mb-12 bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 flex items-center justify-center">
                <Image
                  src={getLogoUrl(course.logo)}
                  alt={course.title}
                  width={64}
                  height={64}
                  className="w-full h-full object-contain drop-shadow-lg"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg"
                  }}
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
                    {course.modules.reduce((total, m) => total + Number.parseInt(m.duration), 0)} Min
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

        {/* Weitere UI folgt wie gehabt */}
      </main>
    </div>
  )
}

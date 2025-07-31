// UPDATED DYNAMIC COURSE PAGE (Frontend with API integration)

"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Play, FileText, Award, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function CoursePage() {
  const [course, setCourse] = useState(null)
  const [userEmail, setUserEmail] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const courseId = params.courseId

  useEffect(() => {
    const email = localStorage.getItem("userEmail")
    if (!email) {
      router.push("/login")
    } else {
      setUserEmail(email)
    }
  }, [router])

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(
          `https://strapi-elearning-8rff.onrender.com/api/courses?populate=*&filters[documentId][$eq]=${courseId}`
        )
        const data = await res.json()
        const courseData = data.data?.[0] ?? null
        setCourse(courseData)
      } catch (error) {
        console.error("Fehler beim Laden des Kurses:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (courseId) fetchCourse()
  }, [courseId])

  if (isLoading) return <div className="p-10 text-center">Lade Kursdaten...</div>
  if (!course) return <div className="p-10 text-center">Kurs nicht gefunden</div>

  const modules = course.attributes.modules || []
  const logoUrl =
    course.attributes.logo?.formats?.thumbnail?.url ||
    course.attributes.logo?.url ||
    "/placeholder.svg"

  const completedModules = modules.filter((m) => m.completed).length
  const progressPercentage = (completedModules / modules.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="backdrop-blur-sm bg-white/80 border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:bg-slate-100">
              <ArrowLeft className="h-4 w-4" /> Zurück zum Dashboard
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

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Kursübersicht */}
        <Card className="mb-12 bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 flex items-center justify-center">
                <Image
                  src={logoUrl}
                  alt={course.attributes.title}
                  width={64}
                  height={64}
                  className="w-full h-full object-contain drop-shadow-lg rounded-lg"
                />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-slate-800">
                  {course.attributes.title}
                </CardTitle>
                <p className="text-slate-600 font-light mt-1">{course.attributes.description}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <Clock className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="font-semibold text-slate-800">
                    {modules.reduce((total, m) => total + parseInt(m.duration || "0"), 0)} Min
                  </p>
                  <p className="text-sm text-slate-600 font-light">Gesamtdauer</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <FileText className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="font-semibold text-slate-800">{modules.length} Module</p>
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

            {/* Fortschritt */}
            <div className="p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-slate-800">Ihr Fortschritt</span>
                <span className="font-bold text-slate-800">{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden mb-2">
                <div
                  className={`bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 shadow-sm`}
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <p className="text-sm text-slate-600 font-light">
                {completedModules} von {modules.length} Modulen abgeschlossen
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Module */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-8">Kursmodule</h2>

          {modules.map((module, index) => (
            <Card
              key={module.id}
              className={`bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
                module.completed ? "ring-2 ring-green-200" : ""
              }`}
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
                        <p className="text-slate-600 font-light leading-relaxed">
                          {module.description}
                        </p>
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
                            : `bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-xl text-white`
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
      </main>
    </div>
  )
}

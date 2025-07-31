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
  const [userEmail, setUserEmail] = useState("")
  const [course, setCourse] = useState(null)
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

  useEffect(() => {
    const fetchCourse = async () => {
      const res = await fetch(
        `https://strapi-elearning-8rff.onrender.com/api/courses/${courseId}?populate=logo,modules`
      )
      const json = await res.json()
      setCourse(json.data?.attributes || null)
    }
    fetchCourse()
  }, [courseId])

  if (!course) return <div>Kurs wird geladen ...</div>

  const completedModules = course.modules.filter((m: any) => m.completed).length
  const progressPercentage = (completedModules / course.modules.length) * 100

  const getLogoUrl = () => {
    const logo = course.logo?.data?.attributes
    return (
      logo?.formats?.thumbnail?.url || logo?.url || "/placeholder.svg?height=64&width=64&text=Logo"
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
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

      <main className="max-w-5xl mx-auto px-6 py-12">
        <Card className="mb-12 bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 flex items-center justify-center">
                <Image
                  src={getLogoUrl()}
                  alt={course.title}
                  width={64}
                  height={64}
                  className="w-full h-full object-contain drop-shadow-lg rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=64&width=64&text=Logo"
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
                    {course.modules.reduce((total: number, m: any) => total + parseInt(m.duration), 0)} Min
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
                  className={`bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 shadow-sm`}
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <p className="text-sm text-slate-600 font-light">
                {completedModules} von {course.modules.length} Modulen abgeschlossen
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

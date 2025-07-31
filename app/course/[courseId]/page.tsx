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
      try {
        const res = await fetch(
          `https://strapi-elearning-8rff.onrender.com/api/courses?filters[documentId][$eq]=${courseId}&populate=logo,modules`
        )
        const json = await res.json()
        if (json.data.length > 0) {
          const attributes = json.data[0].attributes
          setCourse(attributes)
        }
      } catch (error) {
        console.error("❌ Fehler beim Laden des Kurses:", error)
      }
    }

    fetchCourse()
  }, [courseId])

  if (!course) {
    return <div>Kurs wird geladen...</div>
  }

  const completedModules = course.modules.filter((m: any) => m.completed).length
  const progressPercentage = (completedModules / course.modules.length) * 100

  const logoUrl =
    course.logo?.data?.attributes?.formats?.thumbnail?.url ||
    course.logo?.data?.attributes?.url ||
    "/placeholder.svg"

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
                  src={logoUrl}
                  alt={course.title}
                  width={64}
                  height={64}
                  className="w-full h-full object-contain drop-shadow-lg rounded-lg"
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
                    {course.modules.reduce((total: number, m: any) => total + parseInt(m.duration || 0), 0)} Min
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
          </CardContent>
        </Card>

        {/* Weitere Sektionen wie Fortschrittsbalken, Module usw. hier einfügen */}
      </main>
    </div>
  )
}

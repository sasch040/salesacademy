"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, Trophy, Users, TrendingUp, FileText, ArrowRight, LogOut, User, Settings } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"

interface User {
  id: number
  email: string
  isActive: boolean
  role: string
  lastLogin: string
}

interface Course {
  id: number
  title: string
  description: string
  slug: string
  gradient: string
  modules: Array<{
    id: number
    title: string
    completed: boolean
  }>
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        })

        if (!res.ok) {
          router.push("/auth/login")
          return
        }

        const data = await res.json()
        console.log("✅ Authentifizierter User:", data.user)
        setUser(data.user)
      } catch (err) {
        console.error("Fehler bei Auth-Check:", err)
        router.push("/auth/login")
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    if (!user) return
    loadCourses()
  }, [user])

  const loadCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/products")

      if (!response.ok) {
        throw new Error("Failed to load courses")
      }

      const data = await response.json()
      setCourses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
      router.push("/auth/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const calculateProgress = (modules: Course["modules"]) => {
    if (!modules || modules.length === 0) return 0
    const completed = modules.filter((m) => m.completed).length
    return Math.round((completed / modules.length) * 100)
  }

  const totalModules = courses.reduce((acc, course) => acc + (course.modules?.length || 0), 0)
  const completedModules = courses.reduce(
    (acc, course) => acc + (course.modules?.filter((m) => m.completed).length || 0),
    0,
  )
  const overallProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Dashboard wird geladen...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Fehler</h3>
            <p className="text-slate-600 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>Erneut versuchen</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="backdrop-blur-sm bg-white/80 border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/images/sales-academy-logo.png"
              alt="Sales Academy"
              width={150}
              height={45}
              className="h-8 w-auto drop-shadow-lg"
              onError={(e) => {
                e.currentTarget.style.display = "none"
              }}
            />
            <div className="w-px h-6 bg-slate-300"></div>
            <span className="text-sm font-bold text-slate-800">Dashboard</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <User className="h-4 w-4" />
              <span>{user?.email}</span>
              <Badge variant="outline" className="text-xs">
                {user?.role}
              </Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Abmelden
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Willkommen zurück, {user?.email?.split("@")[0]}!
          </h1>
          <p className="text-xl text-slate-600 font-light">
            Setzen Sie Ihr Lernen fort und erreichen Sie Ihre Ziele in der Sales Academy.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Kurse verfügbar</p>
                  <p className="text-3xl font-bold text-slate-800">{courses.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Module insgesamt</p>
                  <p className="text-3xl font-bold text-slate-800">{totalModules}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Abgeschlossen</p>
                  <p className="text-3xl font-bold text-slate-800">{completedModules}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Fortschritt</p>
                  <p className="text-3xl font-bold text-slate-800">{overallProgress}%</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Ihre Kurse</h2>
            <Badge variant="outline" className="text-sm">
              {courses.length} verfügbar
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const progress = calculateProgress(course.modules)
              return (
                <Card
                  key={course.id}
                  className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <CardHeader className="pb-4">
                    <div className={`w-full h-32 rounded-lg bg-gradient-to-r ${course.gradient} mb-4 flex items-center justify-center`}>
                      <BookOpen className="h-12 w-12 text-white drop-shadow-lg" />
                    </div>
                    <CardTitle className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="text-slate-600 line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Fortschritt</span>
                        <span className="font-semibold text-slate-800">{progress}%</span>
                      </div>

                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-slate-600">
                        <span>{course.modules?.length || 0} Module</span>
                        <span>{course.modules?.filter((m) => m.completed).length || 0} abgeschlossen</span>
                      </div>

                      <Link href={`/course/${course.slug}`}>
                        <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white group-hover:shadow-lg transition-all duration-300">
                          {progress > 0 ? "Fortsetzen" : "Starten"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Sales Materials Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-8">Zusätzliche Ressourcen</h2>
          
          <Card className="w-full bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="p-6 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl">
                  <FileText className="h-12 w-12 text-white drop-shadow-lg" />
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Sales Materials</h3>
                  <p className="text-slate-600 text-lg">
                    Zugriff auf umfangreiche Verkaufsunterlagen, Präsentationen und Marketing-Materialien
                  </p>
                </div>
                
                <Link href="/sales-materials">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-3 text-lg group-hover:shadow-lg transition-all duration-300"
                  >
                    Materialien ansehen
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

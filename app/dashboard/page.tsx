"use client"
import { useProgress } from "@/hooks/useProgress"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  Target,
  ChevronRight,
  Play,
  CheckCircle,
  BarChart3,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContext"

interface Product {
  id: number
  title: string
  description: string
  logo: string
  gradient: string
  modules: any[]
  courseId: number
  documentId: string
}

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { progress } = useProgress()
  const { user, logout } = useAuth()

  const completedCount = progress.filter((p) => p.completed).length
  const totalCount = progress.length
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // 1. PRODUCTS LOADING - useEffect holt Daten von der API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        console.log("🚀 === DASHBOARD: Loading products ===")

        // API-Aufruf an /api/products
        const response = await fetch("/api/products", {
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          console.log("✅ Products API Data Received")
          console.log("📦 Products Count:", data.products?.length || 0)

          if (data.products && Array.isArray(data.products)) {
            setProducts(data.products) // Hier werden die Produkte mit Logos gesetzt

            // Debug-Ausgabe für jedes Produkt
            data.products.forEach((product: Product, index: number) => {
              console.log(`📚 Product ${index + 1}: "${product.title}"`)
              console.log(`🖼️ Logo: ${product.logo}`) // Das Logo kommt aus der API
              console.log(`🎨 Gradient: ${product.gradient}`)
              console.log(`🔢 Course ID: ${product.courseId}`)
            })
          }
        }
      } catch (err) {
        console.error("💥 Products loading error:", err)
        setError("Fehler beim Laden der Produkte")
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
      // Fallback: redirect manually if logout fails
      router.push("/auth/login")
    }
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Dashboard wird geladen...</p>
        </div>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Fehler beim Laden</h3>
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
                  console.warn("⚠️ Sales Academy logo failed to load")
                  e.currentTarget.src = "/placeholder.svg?height=32&width=32&text=SA"
                }}
              />
              <div>
                <h1 className="text-xl font-bold text-slate-800">Sales Academy</h1>
                <p className="text-sm text-slate-600">Lernplattform</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-800">Willkommen zurück!</p>
                <p className="text-xs text-slate-600">{user?.email || user?.username || "Benutzer"}</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 bg-transparent"
              >
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
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Willkommen in Ihrer Sales Academy! 🚀</h2>
            <p className="text-xl text-slate-600 font-light max-w-3xl">
              Entdecken Sie unsere hochwertigen Kurse und erweitern Sie Ihre Fähigkeiten mit interaktiven Lernmodulen,
              Quizzes und Zertifikaten.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{products.length}</p>
                    <p className="text-sm text-slate-600 font-light">Verfügbare Kurse</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">0</p>
                    <p className="text-sm text-slate-600 font-light">Abgeschlossene Kurse</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">0</p>
                    <p className="text-sm text-slate-600 font-light">Zertifikate erhalten</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{percent}%</p>
                    <p className="text-sm text-slate-600 font-light">Gesamtfortschritt</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Courses Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Verfügbare Kurse</h3>
                <p className="text-slate-600 font-light">Wählen Sie einen Kurs aus, um mit dem Lernen zu beginnen</p>
              </div>
              <Link href="/sales-materials">
                <Button className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  📄 Sales Materials
                </Button>
              </Link>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600">Kurse werden aus der API geladen...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => (
                  <Card
                    key={product.id}
                    className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-2 group"
                  >
                    <CardContent className="p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 flex items-center justify-center">
                          {/* 2. IMAGE COMPONENT - Verwendung des Logos */}
                          <Image
                            src={product.logo || "/placeholder.svg"} // Logo aus API oder Fallback
                            alt={product.title}
                            width={64}
                            height={64}
                            className="w-full h-full object-contain drop-shadow-lg rounded-lg"
                            onError={(e) => {
                              console.warn(`⚠️ Product logo failed to load for ${product.title}:`, product.logo)
                              console.log("🔄 Using placeholder for product:", product.title)
                              // Fallback bei Fehler
                              e.currentTarget.src = `/placeholder.svg?height=64&width=64&text=${encodeURIComponent(product.title)}`
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-slate-900 transition-colors">
                            {product.title}
                          </h4>
                          <Badge className="bg-slate-100 text-slate-700 border-slate-200">🚀 Verfügbar</Badge>
                        </div>
                      </div>

                      <p className="text-slate-600 font-light leading-relaxed mb-6 line-clamp-3">
                        {product.description}
                      </p>

                      <div className="mb-6">
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>~45 Min</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-xl">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-slate-700">Fortschritt</span>
                            <span className="text-sm font-bold text-slate-800">0%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className={`bg-gradient-to-r ${product.gradient} h-2 rounded-full transition-all duration-500`}
                              style={{ width: "0%" }}
                            ></div>
                          </div>
                          <p className="text-xs text-slate-500 mt-2">Bereit zum Start</p>
                        </div>

                        <Link href={`/course/${product.courseId}`}>
                          <Button
                            className={`w-full bg-gradient-to-r ${product.gradient} hover:shadow-xl text-white py-3 rounded-xl shadow-lg transition-all duration-300 transform group-hover:scale-105 flex items-center justify-center gap-2`}
                          >
                            <Play className="h-5 w-5" />
                            <span className="font-semibold">Kurs starten</span>
                            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-800">Lernziele setzen</h4>
                    <p className="text-sm text-slate-600">Definieren Sie Ihre persönlichen Lernziele</p>
                  </div>
                </div>
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  Ziele definieren
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-800">Fortschritt verfolgen</h4>
                    <p className="text-sm text-slate-600">Sehen Sie Ihre Lernstatistiken ein</p>
                  </div>
                </div>
                <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  Statistiken ansehen
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
  )
}

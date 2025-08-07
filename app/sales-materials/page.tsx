"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DocumentPreview } from "@/components/ui/document-preview"
import { ArrowLeft, Search, Download, FileText, Video, ImageIcon, Presentation, Filter, ExternalLink, Eye } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"

interface SalesMaterial {
  id: number
  title: string
  description: string
  type: string
  file_url: string
  thumbnail: string
  category: string
  tags: string[]
  created_at: string
  updated_at: string
  productId?: string
  productTitle?: string
  productLogo?: string
  gradient?: string
}

export default function SalesMaterialsPage() {
  const [materials, setMaterials] = useState<SalesMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const router = useRouter()

const [isAuthenticated, setIsAuthenticated] = useState(false)

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
        setIsAuthenticated(true)
      } catch (err) {
        console.error("Fehler bei Auth-Check:", err)
        router.push("/auth/login")
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    if (!isAuthenticated) return
    loadSalesMaterials()
  }, [isAuthenticated])

  const loadSalesMaterials = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/sales-materials")

      if (!response.ok) {
        throw new Error("Failed to load sales materials")
      }

      const data = await response.json()
      setMaterials(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }


  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return <FileText className="h-5 w-5" />
      case "video":
        return <Video className="h-5 w-5" />
      case "image":
        return <ImageIcon className="h-5 w-5" />
      case "powerpoint":
      case "presentation":
        return <Presentation className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return "bg-red-100 text-red-800 border-red-200"
      case "video":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "image":
        return "bg-green-100 text-green-800 border-green-200"
      case "powerpoint":
      case "presentation":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || material.category === selectedCategory
    const matchesType = selectedType === "all" || material.type.toLowerCase() === selectedType.toLowerCase()

    return matchesSearch && matchesCategory && matchesType
  })

  const categories = Array.from(new Set(materials.map((m) => m.category)))
  const types = Array.from(new Set(materials.map((m) => m.type)))

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Sales Materials werden geladen...</p>
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
            <Link href="/dashboard">
              <Button>Zurück zum Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

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
            <span className="text-sm font-bold text-slate-800">Sales Materials</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Sales Materials</h1>
          <p className="text-xl text-slate-600 font-light">
            Entdecken Sie unsere umfangreiche Sammlung von Verkaufsunterlagen und Marketing-Materialien
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Kategorien</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Dateityp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Typen</SelectItem>
                  {types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                className="flex items-center gap-2 bg-transparent"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("all")
                  setSelectedType("all")
                }}
              >
                <Filter className="h-4 w-4" />
                Filter zurücksetzen
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-slate-600">
            {filteredMaterials.length} von {materials.length} Materialien gefunden
          </p>
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <Card
              key={material.id}
              className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${getTypeColor(material.type)}`}>{getTypeIcon(material.type)}</div>
                    <Badge variant="outline" className={getTypeColor(material.type)}>
                      {material.type}
                    </Badge>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {material.category}
                  </Badge>
                </div>

                <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden mb-4">
                  <Image
                    src={material.thumbnail || "/placeholder.svg?height=200&width=300&text=Preview"}
                    alt={material.title}
                    width={300}
                    height={200}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=200&width=300&text=Preview"
                    }}
                  />
                </div>

                <CardTitle className="text-lg font-bold text-slate-800 line-clamp-2">{material.title}</CardTitle>
                <CardDescription className="text-slate-600 line-clamp-3">{material.description}</CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {material.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {material.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{material.tags.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <DocumentPreview
                    title={material.title}
                    fileUrl={material.file_url}
                    type={material.type}
                  >
                    <Button
                      variant="outline"
                      className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Vorschau
                    </Button>
                  </DocumentPreview>
                  
                  <Button
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = material.file_url
                      link.download = material.title
                      link.click()
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>

                {/* Metadata */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500">
                    Erstellt: {new Date(material.created_at).toLocaleDateString("de-DE")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredMaterials.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Keine Materialien gefunden</h3>
            <p className="text-slate-600 mb-6">Versuchen Sie andere Suchbegriffe oder Filter-Einstellungen</p>
            <Button
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("all")
                setSelectedType("all")
              }}
              variant="outline"
            >
              Filter zurücksetzen
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Eye, FileText, ImageIcon, Video, ArrowLeft, Filter, Grid, List, Calendar, Tag, ExternalLink } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"
import { salesMaterialsData } from "@/lib/sales-materials-data"

interface SalesMaterial {
  id: number
  title: string
  description: string
  type: string
  category: string
  fileUrl: string
  thumbnailUrl?: string
  createdAt: string
  updatedAt: string
  fileSize?: string
  product?: {
    title: string
    logo?: string
  }
}

export default function SalesMaterialsPage() {
  const [materials, setMaterials] = useState<SalesMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    const loadSalesMaterials = async () => {
      try {
        setLoading(true)
        console.log("🚀 === SALES MATERIALS: Loading materials ===")

        const response = await fetch("/api/sales-materials", {
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          console.log("✅ Sales Materials API Data Received:", data)

          // Handle both grouped and flat array responses
          let materialsArray: SalesMaterial[] = []
          
          if (data.materials) {
            if (Array.isArray(data.materials)) {
              // If materials is already an array
              materialsArray = data.materials
            } else if (typeof data.materials === 'object') {
              // If materials is grouped by product, flatten it
              materialsArray = Object.values(data.materials).flat() as SalesMaterial[]
            }
          }

          console.log("📦 Materials Count:", materialsArray.length)
          setMaterials(materialsArray)
        } else {
          console.warn("⚠️ API failed, using fallback data")
          // Use fallback data if API fails
          const fallbackMaterials = Object.values(salesMaterialsData).flat()
          setMaterials(fallbackMaterials)
        }
      } catch (err) {
        console.error("💥 Sales Materials loading error:", err)
        console.log("🔄 Using fallback data")
        // Use fallback data on error
        const fallbackMaterials = Object.values(salesMaterialsData).flat()
        setMaterials(fallbackMaterials)
      } finally {
        setLoading(false)
      }
    }

    loadSalesMaterials()
  }, [])

  // Filter materials based on search and filters
  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || material.category === selectedCategory
    const matchesType = selectedType === "all" || material.type === selectedType
    
    return matchesSearch && matchesCategory && matchesType
  })

  // Get unique categories and types for filters
  const categories = Array.from(new Set(materials.map(m => m.category)))
  const types = Array.from(new Set(materials.map(m => m.type)))

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
      case 'document':
        return <FileText className="h-5 w-5" />
      case 'image':
        return <ImageIcon className="h-5 w-5" />
      case 'video':
        return <Video className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
      case 'document':
        return 'bg-red-100 text-red-800'
      case 'image':
        return 'bg-green-100 text-green-800'
      case 'video':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Sales Materials werden geladen...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="backdrop-blur-sm bg-white/80 border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Zurück zum Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Sales Materials</h1>
                <p className="text-sm text-slate-600">Verkaufsunterlagen und Ressourcen</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Nach Materials suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
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
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-slate-600">
            {filteredMaterials.length} von {materials.length} Materials gefunden
          </p>
        </div>

        {/* Materials Grid/List */}
        {filteredMaterials.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Keine Materials gefunden</h3>
            <p className="text-slate-600">Versuchen Sie andere Suchbegriffe oder Filter.</p>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {filteredMaterials.map((material) => (
              <Card
                key={material.id}
                className={`bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
                  viewMode === "grid" ? "transform hover:scale-[1.02]" : ""
                }`}
              >
                <CardContent className={viewMode === "grid" ? "p-6" : "p-4"}>
                  {viewMode === "grid" ? (
                    // Grid View
                    <>
                      {material.thumbnailUrl && (
                        <div className="mb-4">
                          <Image
                            src={material.thumbnailUrl || "/placeholder.svg"}
                            alt={material.title}
                            width={300}
                            height={200}
                            className="w-full h-40 object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg?height=200&width=300&text=Preview"
                            }}
                          />
                        </div>
                      )}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                          {getFileIcon(material.type)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-800 mb-1">{material.title}</h3>
                          <p className="text-sm text-slate-600 line-clamp-2">{material.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                        <Badge className={getTypeColor(material.type)}>{material.type}</Badge>
                        <Badge variant="outline">{material.category}</Badge>
                        {material.fileSize && (
                          <Badge variant="outline">{material.fileSize}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          Ansehen
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    // List View
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                        {getFileIcon(material.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-800 mb-1">{material.title}</h3>
                        <p className="text-sm text-slate-600 mb-2">{material.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge className={getTypeColor(material.type)}>{material.type}</Badge>
                          <Badge variant="outline">{material.category}</Badge>
                          {material.fileSize && (
                            <Badge variant="outline">{material.fileSize}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Ansehen
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

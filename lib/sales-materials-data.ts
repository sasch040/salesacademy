// Sales Materials Data Types and Functions

export interface SalesMaterial {
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
}

export interface SalesMaterialsResponse {
  data: SalesMaterial[]
  meta: {
    total: number
    categories: string[]
    types: string[]
  }
}

// Mock data for development
export const mockSalesMaterials: SalesMaterial[] = [
  {
    id: 1,
    title: "Smart Lens Produktbroschüre",
    description: "Detaillierte Übersicht über alle Smart Lens Features und Anwendungsbereiche",
    type: "PDF",
    file_url: "/files/smart-lens-brochure.pdf",
    thumbnail: "/images/smart-lens-clean.png",
    category: "Produktinformation",
    tags: ["smart-lens", "broschüre", "features", "produktinfo"],
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  },
  {
    id: 2,
    title: "Smart Nexus ROI Calculator",
    description: "Excel-Tool zur Berechnung des Return on Investment für Smart Nexus Implementierungen",
    type: "Excel",
    file_url: "/files/nexus-roi-calculator.xlsx",
    thumbnail: "/images/smart-nexus-clean.png",
    category: "Tools",
    tags: ["smart-nexus", "roi", "calculator", "excel", "investment"],
    created_at: "2024-01-20T14:30:00Z",
    updated_at: "2024-01-20T14:30:00Z",
  },
  {
    id: 3,
    title: "Hacktracks Demo Video",
    description: "Umfassende Demonstration aller Hacktracks Funktionen und Sicherheitsfeatures",
    type: "Video",
    file_url: "/videos/hacktracks-demo.mp4",
    thumbnail: "/images/hacktracks-clean.png",
    category: "Demo",
    tags: ["hacktracks", "demo", "video", "security", "features"],
    created_at: "2024-02-01T09:15:00Z",
    updated_at: "2024-02-01T09:15:00Z",
  },
  {
    id: 4,
    title: "Sales Presentation Template",
    description: "Professionelle PowerPoint-Vorlage für Verkaufspräsentationen mit allen Produkten",
    type: "PowerPoint",
    file_url: "/files/sales-template.pptx",
    thumbnail: "/images/sales-academy-new-logo.png",
    category: "Template",
    tags: ["sales", "presentation", "template", "powerpoint", "verkauf"],
    created_at: "2024-02-05T16:45:00Z",
    updated_at: "2024-02-05T16:45:00Z",
  },
  {
    id: 5,
    title: "Competitive Analysis Report",
    description: "Detaillierte Wettbewerbsanalyse mit Vergleichstabellen und Marktpositionierung",
    type: "PDF",
    file_url: "/files/competitive-analysis.pdf",
    thumbnail: "/placeholder.svg?height=200&width=300&text=Analysis",
    category: "Marktanalyse",
    tags: ["wettbewerb", "analyse", "markt", "positioning", "vergleich"],
    created_at: "2024-02-10T11:20:00Z",
    updated_at: "2024-02-10T11:20:00Z",
  },
  {
    id: 6,
    title: "Customer Success Stories",
    description: "Sammlung von Kundenreferenzen und Erfolgsgeschichten aus verschiedenen Branchen",
    type: "PDF",
    file_url: "/files/customer-stories.pdf",
    thumbnail: "/placeholder.svg?height=200&width=300&text=Success",
    category: "Referenzen",
    tags: ["kunden", "erfolg", "referenzen", "case-studies", "testimonials"],
    created_at: "2024-02-15T13:10:00Z",
    updated_at: "2024-02-15T13:10:00Z",
  },
  {
    id: 7,
    title: "Product Comparison Matrix",
    description: "Übersichtliche Matrix zum Vergleich aller Produktfeatures und -varianten",
    type: "Excel",
    file_url: "/files/product-comparison.xlsx",
    thumbnail: "/placeholder.svg?height=200&width=300&text=Matrix",
    category: "Produktvergleich",
    tags: ["produkte", "vergleich", "matrix", "features", "übersicht"],
    created_at: "2024-02-20T08:30:00Z",
    updated_at: "2024-02-20T08:30:00Z",
  },
  {
    id: 8,
    title: "Implementation Roadmap",
    description: "Schritt-für-Schritt Implementierungsplan für alle Produktlösungen",
    type: "PowerPoint",
    file_url: "/files/implementation-roadmap.pptx",
    thumbnail: "/placeholder.svg?height=200&width=300&text=Roadmap",
    category: "Implementation",
    tags: ["implementierung", "roadmap", "planung", "schritte", "timeline"],
    created_at: "2024-02-25T15:00:00Z",
    updated_at: "2024-02-25T15:00:00Z",
  },
]

// Helper functions
export function getSalesMaterialsByCategory(materials: SalesMaterial[], category: string): SalesMaterial[] {
  if (category === "all") return materials
  return materials.filter((material) => material.category === category)
}

export function getSalesMaterialsByType(materials: SalesMaterial[], type: string): SalesMaterial[] {
  if (type === "all") return materials
  return materials.filter((material) => material.type.toLowerCase() === type.toLowerCase())
}

export function searchSalesMaterials(materials: SalesMaterial[], searchTerm: string): SalesMaterial[] {
  if (!searchTerm) return materials

  const term = searchTerm.toLowerCase()
  return materials.filter(
    (material) =>
      material.title.toLowerCase().includes(term) ||
      material.description.toLowerCase().includes(term) ||
      material.tags.some((tag) => tag.toLowerCase().includes(term)),
  )
}

export function getUniqueCategories(materials: SalesMaterial[]): string[] {
  return Array.from(new Set(materials.map((material) => material.category)))
}

export function getUniqueTypes(materials: SalesMaterial[]): string[] {
  return Array.from(new Set(materials.map((material) => material.type)))
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toUpperCase() || "FILE"
}

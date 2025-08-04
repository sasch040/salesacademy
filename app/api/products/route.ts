import { cookies } from "next/headers"
import { NextResponse } from "next/server"

interface StrapiLogo {
  id: number
  documentId: string
  name: string
  alternativeText?: string
  caption?: string
  width: number
  height: number
  formats?: {
    thumbnail?: {
      ext: string
      url: string
      hash: string
      mime: string
      name: string
      path?: string
      size: number
      width: number
      height: number
      sizeInBytes: number
    }
    small?: {
      ext: string
      url: string
      hash: string
      mime: string
      name: string
      path?: string
      size: number
      width: number
      height: number
      sizeInBytes: number
    }
  }
  url?: string
}

interface StrapiCourse {
  id: number
  documentId: string
  title: string
  description: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  logo?: StrapiLogo
}

interface StrapiResponse {
  data: StrapiCourse[]
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

// Gradient mapping basierend auf Kursnamen
const getGradientForCourse = (title: string): string => {
  const titleLower = title.toLowerCase()

  if (titleLower.includes("nexus")) {
    return "from-blue-500 to-blue-700"
  } else if (titleLower.includes("lens")) {
    return "from-green-500 to-green-700"
  } else if (titleLower.includes("hack") || titleLower.includes("track")) {
    return "from-purple-500 to-purple-700"
  } else if (titleLower.includes("sales")) {
    return "from-orange-500 to-orange-700"
  } else {
    return "from-slate-500 to-slate-700"
  }
}

// Logo URL extrahieren mit Priorität auf S3-URLs
const extractLogoUrl = (logo: StrapiLogo | undefined): string => {
  if (!logo) {
    console.log("❌ No logo found in course data")
    return ""
  }

  console.log("🖼️ Processing logo:", logo.name)

  // Priorität: thumbnail > small > original URL
  if (logo.formats?.thumbnail?.url) {
    console.log("✅ Using thumbnail URL:", logo.formats.thumbnail.url)
    return logo.formats.thumbnail.url
  }

  if (logo.formats?.small?.url) {
    console.log("✅ Using small format URL:", logo.formats.small.url)
    return logo.formats.small.url
  }

  if (logo.url) {
    console.log("✅ Using original URL:", logo.url)
    return logo.url
  }

  console.log("❌ No usable URL found in logo data")
  return ""
}

export async function GET() {
  try {
    console.log("🚀 === PRODUCTS API: Starting ===")

    // Course API mit Logo-Population
    const courseApiUrl = "https://strapi-elearning-8rff.onrender.com/api/courses?populate=*"
    console.log("📡 Fetching courses from:", courseApiUrl)
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      console.warn("❌ Kein Token im Cookie – Zugriff verweigert")
      return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 })
    }
    const response = await fetch(courseApiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
    const data: StrapiResponse = await response.json()
    if (!response.ok) {
      console.error("❌ Course API failed:", response.status, data)
      throw new Error(`Course API failed: ${response.status}`)
    }
    console.log("✅ Course API Response received")
    console.log("📊 Total courses found:", data.data?.length || 0)

    if (!data.data || data.data.length === 0) {
      console.log("⚠️ No courses found in API response")
      return NextResponse.json({ products: [] })
    }

    // Courses zu Products transformieren
    const products = data.data.map((course) => {
      console.log(`\n🔄 Processing course: "${course.title}" (ID: ${course.id})`)

      const logoUrl = extractLogoUrl(course.logo)
      const gradient = getGradientForCourse(course.title)

      console.log(`📝 Course: ${course.title}`)
      console.log(`🖼️ Logo URL: ${logoUrl || "No logo"}`)
      console.log(`🎨 Gradient: ${gradient}`)

      return {
        id: course.id,
        title: course.title,
        description: course.description || "Keine Beschreibung verfügbar",
        logo: logoUrl || `/placeholder.svg?height=64&width=64&text=${encodeURIComponent(course.title)}`,
        gradient: gradient,
        modules: [], // Modules werden in der Course-Detail API geladen
        courseId: course.id,
        documentId: course.documentId,
      }
    })

    console.log("✅ Products transformation completed")
    console.log("📦 Total products:", products.length)

    // Detaillierte Logo-Statistik
    const withLogos = products.filter((p) => !p.logo.includes("placeholder")).length
    const withoutLogos = products.length - withLogos
    console.log(`📊 Logo Statistics: ${withLogos} with S3 logos, ${withoutLogos} with placeholders`)

    return NextResponse.json({ products })

  } catch (error) {
    console.error("💥 Products API Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch products", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

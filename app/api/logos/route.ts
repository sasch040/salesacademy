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

// Logo URL extrahieren mit Priorität auf S3-URLs
const extractLogoUrl = (logo: StrapiLogo | undefined): string => {
  if (!logo) return ""

  // Priorität: thumbnail > small > original URL
  if (logo.formats?.thumbnail?.url) {
    return logo.formats.thumbnail.url
  }

  if (logo.formats?.small?.url) {
    return logo.formats.small.url
  }

  if (logo.url) {
    return logo.url
  }

  return ""
}

export async function GET() {
  try {
    console.log("🚀 === LOGOS API: Starting ===")

    // Course API mit Logo-Population (gleiche Quelle wie Products API)
    const courseApiUrl = "https://strapi-elearning-8rff.onrender.com/api/courses?populate=*"
    console.log("📡 Fetching courses with logos from:", courseApiUrl)

    const response = await fetch(courseApiUrl, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error("❌ Course API failed:", response.status, response.statusText)
      throw new Error(`Course API failed: ${response.status}`)
    }

    const data: StrapiResponse = await response.json()
    console.log("✅ Course API Response received")
    console.log("📊 Total courses found:", data.data?.length || 0)

    if (!data.data || data.data.length === 0) {
      console.log("⚠️ No courses found in API response")
      return NextResponse.json({ logos: [] })
    }

    // Logos aus Courses extrahieren
    const logos = data.data
      .filter((course) => course.logo) // Nur Courses mit Logos
      .map((course) => {
        console.log(`\n🔄 Processing logo for course: "${course.title}" (ID: ${course.id})`)

        const logoUrl = extractLogoUrl(course.logo)

        console.log(`📝 Course: ${course.title}`)
        console.log(`🖼️ Logo URL: ${logoUrl || "No usable URL"}`)
        console.log(`🏷️ Logo Name: ${course.logo?.name || "No name"}`)

        return {
          id: course.logo!.id,
          documentId: course.logo!.documentId,
          name: course.logo!.name,
          url: logoUrl,
          courseId: course.id,
          courseTitle: course.title,
          courseDocumentId: course.documentId,
          alternativeText: course.logo!.alternativeText,
          caption: course.logo!.caption,
          width: course.logo!.width,
          height: course.logo!.height,
        }
      })
      .filter((logo) => logo.url) // Nur Logos mit gültigen URLs

    console.log("✅ Logo extraction completed")
    console.log("📦 Total logos extracted:", logos.length)

    // Detaillierte Logo-Statistik
    logos.forEach((logo) => {
      console.log(`📊 Logo: ${logo.name} → Course: ${logo.courseTitle} (ID: ${logo.courseId})`)
    })

    return NextResponse.json({ logos })
  } catch (error) {
    console.error("💥 Logos API Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch logos", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

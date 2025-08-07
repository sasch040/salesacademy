import { type NextRequest, NextResponse } from "next/server"

const STRAPI_URL = "https://strapi-elearning-8rff.onrender.com"
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || "DEIN_TOKEN_HIER"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 === SALES MATERIALS API DEBUG INFO ===")
    console.log("🌐 Strapi URL:", STRAPI_URL)
    console.log("🔑 API Token present:", !!STRAPI_TOKEN)

    if (!STRAPI_TOKEN) {
      console.error("❌ STRAPI_API_TOKEN is missing!")
      throw new Error("STRAPI_API_TOKEN environment variable is not set")
    }

    const salesMaterialsUrl = `${STRAPI_URL}/api/sales-materials?populate=*`
    console.log("📡 Fetching from:", salesMaterialsUrl)

    const response = await fetch(salesMaterialsUrl, {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("💥 API error:", response.status, response.statusText, errorText)
      throw new Error(`Strapi returned ${response.status}: ${response.statusText}`)
    }

    const { data } = await response.json()
    console.log("📊 Sales Materials fetched:", data?.length || 0)

    // 🎯 FLACHES ARRAY (statt gruppiert nach Produkt)
    const materials = data.map((item: any) => {
      const itemAttributes = item.attributes || item
      const product = itemAttributes.product?.data || itemAttributes.product
      const productAttributes = product?.attributes || product || {}

      const file = itemAttributes.file?.data || itemAttributes.file
      const fileAttributes = file?.attributes || file || {}

      return {
        id: item.id,
        title: itemAttributes.title,
        description: itemAttributes.description,
        type: itemAttributes.type,
        category: itemAttributes.category,
        fileUrl: fileAttributes.url?.startsWith("http")
          ? fileAttributes.url
          : fileAttributes.url
          ? `${STRAPI_URL}${fileAttributes.url}`
          : null,
        fileSize: formatFileSize(fileAttributes?.size || 0),
        language: itemAttributes.language || "de",
        lastUpdated: formatDate(itemAttributes.updatedAt || item.updatedAt),
        tags: Array.isArray(itemAttributes.tags) ? itemAttributes.tags : [],
        productId: product?.id || null,
        productTitle: productAttributes.titel || productAttributes.name || "Produkt",
        productLogo: productAttributes.logo?.data?.attributes?.url
          ? `${STRAPI_URL}${productAttributes.logo.data.attributes.url}`
          : productAttributes.logo?.url
          ? `${STRAPI_URL}${productAttributes.logo.url}`
          : null,
        gradient: productAttributes.gradient || "from-slate-500 to-slate-600",
      }
    })

    console.log("✅ Materials ready for frontend:", materials.length)
    return NextResponse.json(materials)
  } catch (error) {
    console.error("💥 Sales Materials API error:", error)

    const { getSalesMaterialsData } = await import("@/lib/sales-materials-data")
    const fallbackData = await getSalesMaterialsData()

    console.log("🔄 Using fallback data")
    return NextResponse.json(fallbackData)
  }
}

// 📦 Hilfsfunktionen
function formatFileSize(bytes: number): string {
  if (!bytes) return "0 MB"
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(1)} MB`
}

function formatDate(dateString: string): string {
  if (!dateString) return "Unbekannt"
  return new Date(dateString).toLocaleDateString("de-DE")
}

import { type NextRequest, NextResponse } from "next/server"

const STRAPI_URL = "https://strapi-elearning-8rff.onrender.com"
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || "<dein fallback token>"

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
    console.log("📡 Request to:", salesMaterialsUrl)

    const response = await fetch(salesMaterialsUrl, {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("💥 API Error:", response.status, response.statusText, errorText)
      throw new Error(`Strapi returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("📦 Materials count:", data.data?.length || 0)

    const groupedByProduct: Record<string, any> = {}

    if (data.data && Array.isArray(data.data)) {
      data.data.forEach((item: any) => {
        const itemAttributes = item.attributes || item
        const product = itemAttributes.product?.data || itemAttributes.product

        if (!product) {
          console.warn("⚠️ Material without product:", item.id)
          return
        }

        const productAttributes = product.attributes || product
        const productId = product.id || "unknown"
        const productName = productAttributes.name || productAttributes.title || `Product ${productId}`

        if (!groupedByProduct[productId]) {
          groupedByProduct[productId] = {
            id: productId,
            title: productName,
            logo: productAttributes.logo?.data?.attributes?.url
              ? `${STRAPI_URL}${productAttributes.logo.data.attributes.url}`
              : productAttributes.logo?.url
                ? `${STRAPI_URL}${productAttributes.logo.url}`
                : `/images/product-${productId}-logo.png`,
            gradient: productAttributes.gradient || "from-slate-500 to-slate-600",
            materials: [],
          }
        }

        const fileData = itemAttributes.file?.data || itemAttributes.file
        const fileAttributes = fileData?.attributes || fileData

        groupedByProduct[productId].materials.push({
          id: item.id,
          title: itemAttributes.title,
          description: itemAttributes.description,
          type: itemAttributes.type,
          category: itemAttributes.category,
          fileUrl: fileAttributes?.url ? `${STRAPI_URL}${fileAttributes.url}` : "/placeholder.svg",
          fileSize: formatFileSize(fileAttributes?.size || 0),
          language: itemAttributes.language || "de",
          lastUpdated: formatDate(itemAttributes.updatedAt || item.updatedAt),
          tags: Array.isArray(itemAttributes.tags) ? itemAttributes.tags : [], // ✅ Wichtig!
        })
      }) // ✅ <- HIER war die Klammer vorher **nicht** da
    }

    console.log("✅ Processed products:", Object.keys(groupedByProduct).length)

    const flatMaterials = Object.values(groupedByProduct).flatMap((product: any) =>
      product.materials.map((material: any) => ({
        ...material,
        productId: product.id,
        productTitle: product.title,
        productLogo: product.logo,
        gradient: product.gradient,
      }))
    )

    return NextResponse.json(flatMaterials)
  } catch (error) {
    console.error("💥 Fallback wegen Fehler:", error)

    const { getSalesMaterialsData } = await import("@/lib/sales-materials-data")
    const fallbackData = await getSalesMaterialsData()

    console.log("🔄 Using fallback data")
    return NextResponse.json(fallbackData)
  }
}

// Hilfsfunktionen
function formatFileSize(bytes: number): string {
  if (!bytes) return "0 MB"
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(1)} MB`
}

function formatDate(dateString: string): string {
  if (!dateString) return "Unbekannt"
  return new Date(dateString).toLocaleDateString("de-DE")
}

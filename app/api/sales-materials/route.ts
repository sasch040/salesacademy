import { type NextRequest, NextResponse } from "next/server"

const STRAPI_URL = "https://strapi-elearning-8rff.onrender.com"
const STRAPI_TOKEN =
  process.env.STRAPI_API_TOKEN ||
  "992949dd37394d8faa798febe2bcd19c61aaa07c1b30873b4fe6cc4c6dce0db003fee18d71e12ec0ac5af64c61ffca2b4069eff02d5f3bfbe744a4dd6eab540a53479d68375cf0a3f2ee4231c245e5d1b09ae58356ef2744a3757bc3ca01a6189fe687cd06517aaa3b1e91a28f8a943a1c97abe4958ded8d7e99b376d8203277"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 === SALES MATERIALS API DEBUG INFO ===")
    console.log("🌐 Strapi URL:", STRAPI_URL)
    console.log("🔑 API Token present:", !!STRAPI_TOKEN)

    if (!STRAPI_TOKEN) {
      console.error("❌ STRAPI_API_TOKEN is missing!")
      throw new Error("STRAPI_API_TOKEN environment variable is not set")
    }

    // 🎯 DIREKTE SALES MATERIALS API ABFRAGE
    const salesMaterialsUrl = `${STRAPI_URL}/api/sales-materials?populate=*`
    console.log("📡 Making request to Sales Materials API:", salesMaterialsUrl)

    const response = await fetch(salesMaterialsUrl, {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("💥 Sales Materials API error:", response.status, response.statusText, errorText)
      throw new Error(`Strapi returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("📊 Raw Strapi Sales Materials Response:")
    console.log("📊 Sales Materials count:", data.data?.length || 0)

    // 🎯 TRANSFORMATION DER SALES MATERIALS
    const groupedByProduct: Record<string, any> = {}

    if (data.data && Array.isArray(data.data)) {
      data.data.forEach((item: any) => {
        const itemAttributes = item.attributes || item
        const product = itemAttributes.product?.data || itemAttributes.product

        if (!product) {
          console.warn("⚠️ Sales material without product reference:", item.id)
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

        // File handling
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
        })
      })
    }

    console.log("✅ Sales materials processed:", Object.keys(groupedByProduct).length, "products")
    console.log("📋 Products with materials:", Object.keys(groupedByProduct))

        // Flaches Array für das Frontend erstellen
    const flatMaterials = Object.values(groupedByProduct).flatMap((product: any) =>
      product.materials.map((material: any) => ({
        ...material,
        productId: product.id,
        productTitle: product.title,
        productLogo: product.logo,
        gradient: product.gradient,
      }))
    )
    
    console.log("✅ Returning flat materials:", flatMaterials.length)
    return NextResponse.json(flatMaterials)
    
  } catch (error) {
    console.error("💥 Sales Materials API error:", error)

    // Fallback zu lokalen Daten
    const { getSalesMaterialsData } = await import("@/lib/sales-materials-data")
    const fallbackData = await getSalesMaterialsData()

    console.log("🔄 Using fallback sales materials data")
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

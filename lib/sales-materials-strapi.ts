// Strapi API functions for Sales Materials

const STRAPI_URL = "https://strapi-elearning-8rff.onrender.com"
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN

export interface StrapiSalesMaterial {
  id: number
  attributes: {
    title: string
    description: string
    type: string
    file_url: string
    thumbnail: string
    category: string
    tags: string[]
    createdAt: string
    updatedAt: string
  }
}

export interface StrapiSalesMaterialsResponse {
  data: StrapiSalesMaterial[]
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

export async function fetchSalesMaterialsFromStrapi(): Promise<StrapiSalesMaterialsResponse> {
  try {
    console.log("📡 Fetching sales materials from Strapi...")

    const response = await fetch(`${STRAPI_URL}/api/sales-materials?populate=*`, {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Strapi API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ Sales materials fetched successfully:", data.data?.length || 0, "items")

    return data
  } catch (error) {
    console.error("💥 Error fetching sales materials from Strapi:", error)
    throw error
  }
}

export async function fetchSalesMaterialByIdFromStrapi(id: number): Promise<StrapiSalesMaterial> {
  try {
    console.log("📡 Fetching sales material by ID from Strapi:", id)

    const response = await fetch(`${STRAPI_URL}/api/sales-materials/${id}?populate=*`, {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Strapi API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ Sales material fetched successfully:", data.data?.attributes?.title)

    return data.data
  } catch (error) {
    console.error("💥 Error fetching sales material by ID from Strapi:", error)
    throw error
  }
}

export function transformStrapiSalesMaterial(strapiMaterial: StrapiSalesMaterial) {
  return {
    id: strapiMaterial.id,
    title: strapiMaterial.attributes.title,
    description: strapiMaterial.attributes.description,
    type: strapiMaterial.attributes.type,
    file_url: strapiMaterial.attributes.file_url,
    thumbnail: strapiMaterial.attributes.thumbnail,
    category: strapiMaterial.attributes.category,
    tags: strapiMaterial.attributes.tags || [],
    created_at: strapiMaterial.attributes.createdAt,
    updated_at: strapiMaterial.attributes.updatedAt,
  }
}

export function transformStrapiSalesMaterials(strapiResponse: StrapiSalesMaterialsResponse) {
  return {
    data: strapiResponse.data.map(transformStrapiSalesMaterial),
    meta: {
      total: strapiResponse.meta.pagination.total,
      categories: [],
      types: [],
    },
  }
}

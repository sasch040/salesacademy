// lib/sales-materials-strapi.ts
// ⚠️ Client-safe: ruft NUR deine Next-API auf, nicht Strapi direkt

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

// Hilfsmapper: flaches Objekt -> Strapi-ähnliches Objekt
function toStrapiOne(flat: any): StrapiSalesMaterial {
  return {
    id: flat.id,
    attributes: {
      title: flat.title,
      description: flat.description,
      type: flat.type,
      file_url: flat.file_url,
      thumbnail: flat.thumbnail,
      category: flat.category,
      tags: flat.tags ?? [],
      createdAt: flat.created_at || flat.createdAt || new Date().toISOString(),
      updatedAt: flat.updated_at || flat.updatedAt || new Date().toISOString(),
    },
  }
}

function toStrapiList(payload: any): StrapiSalesMaterialsResponse {
  // Wenn bereits Strapi-Format (data[].attributes vorhanden) -> durchreichen
  if (Array.isArray(payload?.data) && payload.data[0]?.attributes) {
    return payload as StrapiSalesMaterialsResponse
  }

  const items = Array.isArray(payload?.data) ? payload.data : []
  const data = items.map(toStrapiOne)
  const total = payload?.meta?.pagination?.total ?? data.length

  return {
    data,
    meta: {
      pagination: {
        page: 1,
        pageSize: data.length,
        pageCount: 1,
        total,
      },
    },
  }
}

/**
 * Liste holen – gleicher Name wie vorher, aber nun über deine Next-API.
 * Gibt weiterhin ein Strapi-ähnliches Response-Objekt zurück.
 */
export async function fetchSalesMaterialsFromStrapi(): Promise<StrapiSalesMaterialsResponse> {
  try {
    const res = await fetch(`/api/sales-materials`, { cache: "no-store" })
    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`)
    }
    const payload = await res.json()
    return toStrapiList(payload)
  } catch (error) {
    console.error("💥 Error fetching sales materials:", error)
    throw error
  }
}

/**
 * Einzelnes Material holen – gleicher Name wie vorher.
 * Gibt weiterhin ein Strapi-ähnliches Objekt (mit attributes) zurück.
 */
export async function fetchSalesMaterialByIdFromStrapi(id: number): Promise<StrapiSalesMaterial> {
  try {
    const res = await fetch(`/api/sales-materials/${id}`, { cache: "no-store" })
    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`)
    }
    const payload = await res.json()

    // Wenn bereits Strapi-Format (attributes vorhanden)
    if (payload?.attributes) return payload as StrapiSalesMaterial

    // sonst vom flachen Format mappen
    return toStrapiOne(payload)
  } catch (error) {
    console.error("💥 Error fetching sales material by ID:", error)
    throw error
  }
}

// Deine Transform-Helfer bleiben 1:1 erhalten
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

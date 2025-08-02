import { NextResponse } from "next/server"
import { STRAPI_URL } from "@/config"

export async function GET(request, { params }) {
  const { courseId } = params
  const response = await fetch(`${STRAPI_URL}/api/courses/${courseId}`)
  const data = await response.json()
  const courseAttributes = data.data.attributes

  // 🎯 LOGO HANDLING - KORREKTE EXTRAKTION AUS STRAPI
  let courseLogo = null

  console.log("🖼️ === LOGO EXTRACTION ===")

  // Extrahiere Logo aus Strapi Course Response
  const logoAttributes = courseAttributes.logo
  console.log("Logo Data Structure:", JSON.stringify(logoAttributes, null, 2))

  if (logoAttributes) {
    console.log("Logo Attributes:", JSON.stringify(logoAttributes, null, 2))

    // Priorisiere thumbnail URL aus formats
    if (logoAttributes?.formats?.thumbnail?.url) {
      courseLogo = logoAttributes.formats.thumbnail.url.startsWith("http")
        ? logoAttributes.formats.thumbnail.url
        : `${STRAPI_URL}${logoAttributes.formats.thumbnail.url}`
      console.log(`📷 Using thumbnail URL: ${courseLogo}`)
    }
    // Fallback auf normale URL
    else if (logoAttributes?.url) {
      courseLogo = logoAttributes.url.startsWith("http") ? logoAttributes.url : `${STRAPI_URL}${logoAttributes.url}`
      console.log(`📷 Using direct URL: ${courseLogo}`)
    }
  }

  // ** rest of code here **/

  return NextResponse.json({ ...courseAttributes, logo: courseLogo })
}

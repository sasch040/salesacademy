import { NextResponse } from "next/server"
import { headers } from "next/headers"

export async function GET() {
  try {
    // ⏬ Cookie-Header analysieren
    const headersList = await headers()
    const cookieHeader = headersList.get("cookie") || ""
    const tokenMatch = cookieHeader.match(/token=([^;]+)/)
    const token = tokenMatch ? tokenMatch[1] : null

    if (!token) {
      console.warn("❌ Kein Token gefunden")
      return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 })
    }

    // ⏬ Hole STRAPI_URL aus Server-Umgebung (nicht NEXT_PUBLIC!)
    const STRAPI_URL = process.env.STRAPI_URL
    if (!STRAPI_URL) {
      console.error("❌ STRAPI_URL nicht gesetzt!")
      return NextResponse.json({ error: "Fehlende Backend-URL" }, { status: 500 })
    }

    // ⏬ Anfrage an Strapi
    const strapiRes = await fetch(`${STRAPI_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!strapiRes.ok) {
      console.error("❌ Strapi-Fehler bei /me:", strapiRes.status)
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const user = await strapiRes.json()
    return NextResponse.json({ user })
  } catch (error) {
    console.error("💥 Fehler in /api/auth/me:", error)
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 })
  }
}

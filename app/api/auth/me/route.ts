import { NextResponse } from "next/server"
import { headers } from "next/headers"

export async function GET() {
  try {
    const headersList = await headers()
    const cookieHeader = headersList.get("cookie") || ""
    const tokenMatch = cookieHeader.match(/token=([^;]+)/)
    const token = tokenMatch ? tokenMatch[1] : null

    if (!token) {
      console.warn("❌ Kein Token gefunden")
      return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 })
    }

    const strapiRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/me`, {
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

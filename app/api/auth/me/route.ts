// /app/api/auth/me/route.ts
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    // 1) Token aus HttpOnly-Cookie holen
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      // kein Cookie -> nicht eingeloggt
      return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 })
    }

    // 2) STRAPI_URL nur serverseitig (kein NEXT_PUBLIC)
    const STRAPI_URL = process.env.STRAPI_URL
    if (!STRAPI_URL) {
      console.error("❌ STRAPI_URL nicht gesetzt!")
      return NextResponse.json({ error: "Fehlende Backend-URL" }, { status: 500 })
    }

    // 3) User aus Strapi holen
    const meRes = await fetch(`${STRAPI_URL}/api/users/me?populate=*`, {
      headers: { Authorization: `Bearer ${token}` },
      // wichtig: keine Zwischenspeicherung in Edge/CDN
      cache: "no-store",
      // bei Next.js RSC hilft das zusätzlich:
      next: { revalidate: 0 },
    })

    if (!meRes.ok) {
      // Token abgelaufen/ungültig -> 401
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const me = await meRes.json()

    // 4) Antwort normalisieren (nice für Frontend)
    const user = {
      id: me.id,
      email: me.email,
      username: me.username,
      confirmed: Boolean(me.confirmed),
      role: typeof me.role === "object" ? (me.role?.name ?? me.role) : me.role,
    }

    // 5) Keine Caches
    const res = NextResponse.json({ user }, { status: 200 })
    res.headers.set("Cache-Control", "no-store")
    return res
  } catch (err) {
    console.error("💥 Fehler in /api/auth/me:", err)
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 })
  }
}

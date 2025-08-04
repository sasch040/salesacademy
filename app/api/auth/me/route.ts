import { cookies } from "next/headers"
import { NextResponse } from "next/server"

const STRAPI_URL = "https://strapi-elearning-8rff.onrender.com"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      console.warn("❌ Kein Token gefunden")
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const res = await fetch(`${STRAPI_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      console.warn("❌ Token ungültig oder Strapi down:", res.status)
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const user = await res.json()
    return NextResponse.json({ user }, { status: 200 })
  } catch (err) {
    console.error("💥 Fehler in /api/auth/me:", err)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}

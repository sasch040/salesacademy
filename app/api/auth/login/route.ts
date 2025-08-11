// /app/api/auth/login/route.ts
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const STRAPI_URL =
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  "https://strapi-elearning-8rff.onrender.com"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Strapi Login mit Timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)
    let strapiRes: Response

    try {
      strapiRes = await fetch(`${STRAPI_URL}/api/auth/local`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: email, password }),
        signal: controller.signal,
      })
    } catch (e: any) {
      clearTimeout(timeoutId)
      const isTimeout = e?.name === "AbortError"
      return NextResponse.json(
        { error: isTimeout ? "Strapi timeout" : "Strapi connection failed" },
        { status: 502 }
      )
    } finally {
      clearTimeout(timeoutId)
    }

    const contentType = strapiRes.headers.get("content-type") || ""
    if (!contentType.includes("application/json")) {
      const text = await strapiRes.text().catch(() => "")
      return NextResponse.json(
        { error: "Invalid Strapi response", details: text.slice(0, 300) },
        { status: 502 }
      )
    }

    const data = await strapiRes.json()

    if (!strapiRes.ok) {
      // Strapi v4 schickt bei invaliden Credentials/Status 400 mit message
      const msg: string = data?.error?.message || data?.message || "Authentication failed"

      // Spezifische Hinweise durchreichen
      if (/confirmed/i.test(msg)) {
        return NextResponse.json({ error: "E-Mail ist noch nicht bestätigt" }, { status: 403 })
      }
      if (/blocked/i.test(msg)) {
        return NextResponse.json({ error: "Account ist blockiert" }, { status: 403 })
      }
      if (strapiRes.status === 400) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 400 })
      }
      return NextResponse.json({ error: "Strapi authentication failed", details: msg }, { status: strapiRes.status })
    }

    const strapiJwt: string | undefined = data?.jwt
    const user = data?.user
    if (!strapiJwt || !user?.email) {
      return NextResponse.json({ error: "Invalid Strapi payload" }, { status: 502 })
    }

    // (Optional) lastLogin aktualisieren — non-blocking
    ;(async () => {
      try {
        const ctl = new AbortController()
        const t = setTimeout(() => ctl.abort(), 5000)
        await fetch(`${STRAPI_URL}/api/users/${user.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${strapiJwt}`,
          },
          body: JSON.stringify({ lastLogin: new Date().toISOString() }),
          signal: ctl.signal,
        })
        clearTimeout(t)
      } catch {}
    })()

    // Cookie-Lebensdauer an JWT exp angleichen, wenn möglich
    let maxAge = 60 * 60 * 24 * 7 // Fallback: 7 Tage
    try {
      const decoded = jwt.decode(strapiJwt) as { exp?: number } | null
      if (decoded?.exp) {
        const secondsToExp = decoded.exp - Math.floor(Date.now() / 1000)
        if (secondsToExp > 0) maxAge = secondsToExp
      }
    } catch {
      // ignore – fallback bleibt 7 Tage
    }

    const res = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          role: user.role?.name || user.role || "student",
          username: user.username,
        },
      },
      { status: 200 }
    )

    // Sichere HttpOnly-Cookie setzen
    res.cookies.set("token", strapiJwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    })
    // Vorsichtshalber Caching aus
    res.headers.set("Cache-Control", "no-store")

    return res
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Internal server error during login",
        details: error?.message || "Unknown error occurred",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

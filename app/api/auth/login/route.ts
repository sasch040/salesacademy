import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "https://strapi-elearning-8rff.onrender.com"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Strapi Login
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
      // Strapi 400 -> falsche Credentials
      if (strapiRes.status === 400) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 400 })
      }
      return NextResponse.json(
        { error: "Strapi authentication failed", details: data?.error?.message || "Unknown error" },
        { status: strapiRes.status }
      )
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

    // Cookie sicher setzen (in Dev ohne secure)
    const res = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        role: user.role?.name || user.role || "student",
        username: user.username,
      },
    })

    res.cookies.set("token", strapiJwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 Woche
    })

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

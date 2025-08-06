import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const STRAPI_URL = "https://strapi-elearning-8rff.onrender.com"
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    console.log("🔍 Attempting login for:", email)
    console.log("🌐 Strapi URL:", STRAPI_URL)
    console.log("🔑 API Token present:", !!process.env.STRAPI_API_TOKEN)

    // Prüfe gegen Strapi Authorized Users mit Timeout
    try {
      const strapiUrl = `${STRAPI_URL}/api/auth/local`
      console.log("📡 Fetching from:", strapiUrl)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 Sekunden für Render

      const response = await fetch(strapiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          identifier: email,
          password,
        }),
        signal: controller.signal,
      })
      const data = await response.json()
      const strapiJwt = data.jwt
      const user = data.user

      clearTimeout(timeoutId)

      console.log("📊 Strapi response status:", response.status)
      console.log("📊 Strapi response headers:", Object.fromEntries(response.headers.entries()))

      // Check if response is JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.error("❌ Strapi returned non-JSON response:", contentType)
        const textResponse = await response.text()
        console.error("❌ Response body:", textResponse.substring(0, 500))
        throw new Error(`Strapi returned non-JSON response: ${response.status}`)
      }
      console.log("✅ Strapi response received")
      if (!response.ok) {
        console.error("❌ Strapi API Error:", response.status, data)

        if (response.status === 400) {
          return NextResponse.json({ error: "Invalid email or password" }, { status: 400 })
        }
          return NextResponse.json(
              {
                error: "Strapi authentication failed",
                details: data?.error?.message || "Unknown error",
              },
              { status: response.status }
            )
          }

      // 🔧 Verbesserte Datenstruktur-Prüfung
      if (data && data.user && data.jwt) {
        const user = data.user
        console.log("👤 User found in Strapi")

        // Prüfe verschiedene mögliche Datenstrukturen
        let userEmail = null
        let userRole = "student"

        if (user.email) {
          // Direktes Format
          userEmail = user.email
          userRole = user.role?.name || user.role || "student"
        } else {
          console.error("❌ Unexpected user data structure:", user)
          throw new Error("User data structure not recognized")
        }

        console.log("✅ User authorized:", userEmail)

        // Optional: lastLogin updaten (mit verbesserter Fehlerbehandlung)
        try {
          const updateController = new AbortController()
          const updateTimeoutId = setTimeout(() => updateController.abort(), 5000)

          const updateResponse = await fetch(`${STRAPI_URL}/api/users/${user.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.jwt}`,
            },
            body: JSON.stringify({
              lastLogin: new Date().toISOString(),
            }),
            signal: updateController.signal,
          })

          clearTimeout(updateTimeoutId)

          if (updateResponse.ok) {
            console.log("📅 Last login updated successfully")
          } else {
            console.warn("⚠️ Could not update lastLogin:", updateResponse.status)
          }
        } catch (updateError: unknown) {
          const err = updateError as Error
          console.warn("⚠️ Could not update lastLogin (non-critical):", err.message)
        }

        // JWT Token Handling
        console.log("✅ JWT Token generated successfully")
        const token = strapiJwt // ← Das kommt direkt aus der Strapi-Antwort
        const response = NextResponse.json({
          success: true,
          message: "Login successful via Strapi",
          user: {
            id: user.id,
            email: userEmail,
            role: userRole,
            username: user.username,
          },
          token,
        });

        response.cookies.set("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 1 Woche
        });

        console.log("🍪 Cookie gesetzt")
        return response;
        
      } else {
        console.log("❌ Invalid credentials or user not found in Strapi")
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
      }
    } catch (strapiError: unknown) {
      const err = strapiError as Error
      console.error("🚨 Strapi connection failed:", err.message)

      // Detaillierte Fehleranalyse
      if (err.name === "AbortError") {
        console.error("⏰ Strapi request timeout (15s)")
      } else if (err.message.includes("ECONNREFUSED")) {
        console.error("🔌 Connection refused - is Strapi running on", STRAPI_URL, "?")
      } else if (err.message.includes("fetch")) {
        console.error("🌐 Network error - check Strapi connection")
      }
    }
  } catch (error: unknown) {
    const err = error as Error
    console.error("💥 Login API critical error:", err.message)

    // Always return valid JSON, even for critical errors
    return NextResponse.json(
      {
        error: "Internal server error during login",
        details: err.message || "Unknown error occurred",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

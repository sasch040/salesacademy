import { type NextRequest, NextResponse } from "next/server"

const STRAPI_URL = "https://strapi-elearning-8rff.onrender.com"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    console.log("🔍 Attempting login for:", email)
    console.log("🌐 Strapi URL:", STRAPI_URL)
    console.log("🔑 API Token present:", !!process.env.STRAPI_API_TOKEN)

    // Prüfe gegen Strapi Authorized Users mit Timeout
    try {
      const strapiUrl = `${STRAPI_URL}/api/authorized-users?filters[email][$eq]=${email}&filters[isActive][$eq]=true`
      console.log("📡 Fetching from:", strapiUrl)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 Sekunden für Render

      const response = await fetch(strapiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        console.error("❌ Strapi API Error:", response.status, response.statusText)
        throw new Error(`Strapi returned ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("✅ Strapi response received")

      // 🔧 Verbesserte Datenstruktur-Prüfung
      if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
        const user = data.data[0]
        console.log("👤 User found in Strapi")

        // Prüfe verschiedene mögliche Datenstrukturen
        let userEmail = null
        let userRole = "student"

        if (user.attributes && user.attributes.email) {
          // Strapi v4 Format
          userEmail = user.attributes.email
          userRole = user.attributes.role || "student"
        } else if (user.email) {
          // Direktes Format
          userEmail = user.email
          userRole = user.role || "student"
        } else {
          console.error("❌ Unexpected user data structure:", user)
          throw new Error("User data structure not recognized")
        }

        console.log("✅ User authorized:", userEmail)

        // Optional: lastLogin updaten (mit verbesserter Fehlerbehandlung)
        try {
          const updateController = new AbortController()
          const updateTimeoutId = setTimeout(() => updateController.abort(), 5000)

          const updateResponse = await fetch(`${STRAPI_URL}/api/authorized-users/${user.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
            },
            body: JSON.stringify({
              data: {
                lastLogin: new Date().toISOString(),
              },
            }),
            signal: updateController.signal,
          })

          clearTimeout(updateTimeoutId)

          if (updateResponse.ok) {
            console.log("📅 Last login updated successfully")
          } else {
            console.warn("⚠️ Could not update lastLogin:", updateResponse.status)
          }
        } catch (updateError) {
          console.warn("⚠️ Could not update lastLogin (non-critical):", updateError.message)
        }

        return NextResponse.json({
          success: true,
          message: "Login successful via Strapi",
          user: {
            email: userEmail,
            role: userRole,
          },
        })
      } else {
        console.log("❌ User not found or inactive in Strapi")
        return NextResponse.json(
          { error: "Access denied. Your email is not authorized for this platform." },
          { status: 403 },
        )
      }
    } catch (strapiError) {
      console.error("🚨 Strapi connection failed:", strapiError.message)

      // Detaillierte Fehleranalyse
      if (strapiError.name === "AbortError") {
        console.error("⏰ Strapi request timeout (10s)")
      } else if (strapiError.message.includes("ECONNREFUSED")) {
        console.error("🔌 Connection refused - is Strapi running on", STRAPI_URL, "?")
      } else if (strapiError.message.includes("fetch")) {
        console.error("🌐 Network error - check Strapi connection")
      }

      // Fallback zu hardcoded Liste
      console.log("🔄 Falling back to hardcoded authorization list...")

      const FALLBACK_EMAILS = [
        "admin@example.com",
        "student1@example.com",
        "student2@example.com",
        "teacher@example.com",
        "demo@elearning.com",
        "test@test.com",
        email.toLowerCase(), // Aktuelle E-Mail auch erlauben für Testing
      ]

      const isAuthorized = FALLBACK_EMAILS.includes(email.toLowerCase())

      if (isAuthorized) {
        console.log("✅ User authorized via fallback list")
        return NextResponse.json({
          success: true,
          message: "Login successful (fallback mode - Strapi unavailable)",
          user: { email, role: "student" },
          warning: "Strapi connection failed, using fallback authentication",
        })
      } else {
        return NextResponse.json(
          {
            error: "Access denied. Strapi unavailable and email not in fallback list.",
            details: `Please check if Strapi is running on ${STRAPI_URL} or contact administrator.`,
            strapiError: strapiError.message,
            fallbackEmails: FALLBACK_EMAILS,
          },
          { status: 503 },
        )
      }
    }
  } catch (error) {
    console.error("💥 Login API critical error:", error)

    // Always return valid JSON, even for critical errors
    return NextResponse.json(
      {
        error: "Internal server error during login",
        details: error.message || "Unknown error occurred",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

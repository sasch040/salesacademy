import { type NextRequest, NextResponse } from "next/server"

const STRAPI_URL = "https://strapi-elearning-8rff.onrender.com"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "E-Mail-Adresse ist erforderlich" }, { status: 400 })
    }

    console.log("🔍 Requesting password reset for:", email)
    console.log("🌐 Strapi URL:", STRAPI_URL)

    try {
      const strapiUrl = `${STRAPI_URL}/api/auth/forgot-password`
      console.log("📡 Sending forgot password request to:", strapiUrl)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(strapiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      const data = await response.json()
      if (!response.ok) {
        console.error("❌ Strapi Forgot Password Error:", response.status, data)

        if (response.status === 400) {
          return NextResponse.json(
            {
              error: "Diese E-Mail-Adresse ist nicht in unserem System registriert",
            },
            { status: 400 },
          )
        }

        throw new Error(`Strapi returned ${response.status}: ${response.statusText}`)
      }
      console.log("✅ Strapi forgot password request successful")

      return NextResponse.json({
        success: true,
        message: "E-Mail zum Zurücksetzen des Passworts wurde gesendet",
      })
    } catch (strapiError: unknown) {
      const err = strapiError as Error
      console.error("🚨 Strapi forgot password failed:", err.message)

      if (err.name === "AbortError") {
        return NextResponse.json({ error: "Anfrage dauert zu lange. Bitte versuchen Sie es erneut." }, { status: 408 })
      }

      // Fallback: Immer Erfolg melden (Security Best Practice)
      console.log("🔄 Using fallback response for security")
      return NextResponse.json({
        success: true,
        message: "Falls diese E-Mail-Adresse registriert ist, wurde eine Reset-E-Mail gesendet.",
        warning: "Strapi connection failed, using fallback response",
      })
    }
  } catch (error) {
    const e = error as Error
    console.error("💥 Forgot Password API critical error:", e)

    return NextResponse.json(
      {
        error: "Interner Serverfehler",
        details: e.message || "Unbekannter Fehler",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

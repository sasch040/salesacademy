import { type NextRequest, NextResponse } from "next/server"

const STRAPI_URL = "https://strapi-elearning-8rff.onrender.com"

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Token und Passwort sind erforderlich" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Passwort muss mindestens 6 Zeichen lang sein" }, { status: 400 })
    }

    console.log("🔍 Resetting password with token:", token.substring(0, 10) + "...")
    console.log("🌐 Strapi URL:", STRAPI_URL)

    try {
      const strapiUrl = `${STRAPI_URL}/api/auth/reset-password`
      console.log("📡 Sending reset password request to:", strapiUrl)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(strapiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: token,
          password,
          passwordConfirmation: password,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      const data = await response.json()
      if (!response.ok) {
        console.error("❌ Strapi Reset Password Error:", response.status, data)

        if (response.status === 400) {
          return NextResponse.json(
            {
              error: "Reset-Token ist ungültig oder abgelaufen",
            },
            { status: 400 },
          )
        }

        throw new Error(`Strapi returned ${response.status}: ${response.statusText}`)
      }
      console.log("✅ Strapi reset password successful")

      if (data && data.user) {
        return NextResponse.json({
          success: true,
          message: "Passwort erfolgreich zurückgesetzt",
          user: {
            email: data.user.email,
          },
        })
      } else {
        throw new Error("Invalid response from Strapi")
      }
    } catch (strapiError: unknown) {
      const err = strapiError as Error
      console.error("🚨 Strapi reset password failed:", err.message)

      if (err.name === "AbortError") {
        return NextResponse.json({ error: "Anfrage dauert zu lange. Bitte versuchen Sie es erneut." }, { status: 408 })
      }

      return NextResponse.json(
        {
          error: "Fehler beim Zurücksetzen des Passworts. Token könnte ungültig oder abgelaufen sein.",
          details: err.message,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    const e = error as Error
    console.error("💥 Reset Password API critical error:", e)

    return NextResponse.json(
      {
        error: "Interner Serverfehler beim Zurücksetzen des Passworts",
        details: e.message || "Unbekannter Fehler",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

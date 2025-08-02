import { type NextRequest, NextResponse } from "next/server"

const STRAPI_URL = "https://strapi-elearning-8rff.onrender.com"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email und Passwort sind erforderlich" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Passwort muss mindestens 6 Zeichen lang sein" }, { status: 400 })
    }

    console.log("🔍 Attempting registration for:", email)
    console.log("🌐 Strapi URL:", STRAPI_URL)

    try {
      const strapiUrl = `${STRAPI_URL}/api/auth/local/register`
      console.log("📡 Registering at:", strapiUrl)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(strapiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email, // Strapi verwendet username
          email,
          password,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("❌ Strapi Registration Error:", response.status, errorData)

        if (response.status === 400 && errorData.error?.message?.includes("Email or Username are already taken")) {
          return NextResponse.json({ error: "Diese E-Mail-Adresse ist bereits registriert" }, { status: 400 })
        }

        throw new Error(`Strapi returned ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("✅ Strapi registration successful")

      if (data && data.user && data.jwt) {
        console.log("👤 User registered successfully:", data.user.email)

        return NextResponse.json({
          success: true,
          message: "Registrierung erfolgreich",
          user: {
            email: data.user.email,
            role: data.user.role || "student",
          },
        })
      } else {
        throw new Error("Invalid response from Strapi")
      }
    } catch (strapiError) {
      console.error("🚨 Strapi registration failed:", strapiError.message)

      if (strapiError.name === "AbortError") {
        return NextResponse.json(
          { error: "Registrierung dauert zu lange. Bitte versuchen Sie es erneut." },
          { status: 408 },
        )
      }

      return NextResponse.json(
        {
          error: "Registrierung fehlgeschlagen. Bitte versuchen Sie es später erneut.",
          details: strapiError.message,
        },
        { status: 503 },
      )
    }
  } catch (error) {
    console.error("💥 Registration API critical error:", error)

    return NextResponse.json(
      {
        error: "Interner Serverfehler bei der Registrierung",
        details: error.message || "Unbekannter Fehler",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

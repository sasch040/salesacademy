// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server"

const STRAPI_URL = process.env.STRAPI_URL || "https://strapi-elearning-8rff.onrender.com";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email und Passwort sind erforderlich" }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Passwort muss mindestens 6 Zeichen lang sein" }, { status: 400 })
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    let strapiRes: Response
    try {
      strapiRes = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, email, password }),
        signal: controller.signal,
      })
    } catch (e: any) {
      clearTimeout(timeoutId)
      const isTimeout = e?.name === "AbortError"
      return NextResponse.json(
        { error: isTimeout ? "Registrierung dauert zu lange. Bitte erneut versuchen." : "Strapi nicht erreichbar." },
        { status: 503 }
      )
    } finally {
      clearTimeout(timeoutId)
    }

    const contentType = strapiRes.headers.get("content-type") || ""
    if (!contentType.includes("application/json")) {
      const text = await strapiRes.text().catch(() => "")
      return NextResponse.json(
        { error: "Ungültige Antwort von Strapi", details: text.slice(0, 300) },
        { status: 502 }
      )
    }

    const data: any = await strapiRes.json()

    if (!strapiRes.ok) {
      const msg = data?.error?.message || data?.message || "Registrierung fehlgeschlagen"
      const details = data?.error?.details || data?.data || null
      const alreadyTaken =
        typeof msg === "string" &&
        (msg.toLowerCase().includes("already taken") ||
         (msg.toLowerCase().includes("email") && msg.toLowerCase().includes("unique")))

      if (strapiRes.status === 400 && alreadyTaken) {
        return NextResponse.json({ error: "Diese E-Mail-Adresse ist bereits registriert" }, { status: 400 })
      }
      return NextResponse.json({ error: msg, details }, { status: strapiRes.status || 500 })
    }

    // E-Mail-Bestätigung aktiviert: Strapi liefert user ohne jwt
    if (data?.user && !data?.jwt) {
      return NextResponse.json(
        {
          success: true,
          requiresEmailConfirmation: true,
          message: "Registrierung erfolgreich. Bitte bestätige deine E-Mail.",
          user: { id: data.user.id, email: data.user.email, confirmed: !!data.user.confirmed },
        },
        { status: 201 }
      )
    }

    // Falls Bestätigung aus ist (selten): direkt eingeloggt
    if (data?.user && data?.jwt) {
      return NextResponse.json(
        {
          success: true,
          message: "Registrierung erfolgreich",
          user: { email: data.user.email, role: data.user.role || "student" },
          jwt: data.jwt,
        },
        { status: 201 }
      )
    }

    // Fallback
    return NextResponse.json(
      { success: true, message: "Registrierung abgeschlossen. Prüfe bitte deine E-Mail zur Bestätigung.", raw: data },
      { status: 201 }
    )
  } catch (e: any) {
    return NextResponse.json(
      {
        error: "Interner Serverfehler bei der Registrierung",
        details: e?.message || "Unbekannter Fehler",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

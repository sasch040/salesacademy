import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Token ist erforderlich", valid: false }, { status: 400 })
    }

    console.log("🔍 Validating reset token:", token.substring(0, 10) + "...")

    // Einfache Token-Validierung
    // In einer echten Anwendung würdest du hier gegen Strapi oder deine Datenbank prüfen
    try {
      // Hier könntest du eine Strapi-Anfrage machen, um den Token zu validieren
      // Für jetzt nehmen wir an, dass alle Tokens gültig sind, die nicht leer sind

      if (token.length < 10) {
        return NextResponse.json(
          {
            error: "Token ist zu kurz oder ungültig",
            valid: false,
          },
          { status: 400 },
        )
      }

      // Token ist gültig
      return NextResponse.json({
        valid: true,
        message: "Token ist gültig",
      })
    } catch (error) {
      console.error("🚨 Token validation failed:", error.message)

      return NextResponse.json(
        {
          error: "Token-Validierung fehlgeschlagen",
          valid: false,
          details: error.message,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("💥 Validate Token API critical error:", error)

    return NextResponse.json(
      {
        error: "Interner Serverfehler bei der Token-Validierung",
        valid: false,
        details: error.message || "Unbekannter Fehler",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

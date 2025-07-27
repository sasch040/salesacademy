import { type NextRequest, NextResponse } from "next/server"

// Simulierte Datenbank mit autorisierten E-Mail-Adressen
const AUTHORIZED_EMAILS = [
  "admin@example.com",
  "student1@example.com",
  "student2@example.com",
  "teacher@example.com",
  "demo@elearning.com",
]

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Überprüfen, ob die E-Mail-Adresse autorisiert ist
    const isAuthorized = AUTHORIZED_EMAILS.includes(email.toLowerCase())

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Access denied. Your email is not authorized for this platform." },
        { status: 403 },
      )
    }

    // Erfolgreiche Authentifizierung
    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: { email },
      },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

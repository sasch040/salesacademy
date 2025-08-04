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

       let data: any = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        console.error("❌ Strapi Registration Error:", response.status, data);

        const msg = data?.error?.message || data?.message || "Registrierung fehlgeschlagen";
        const details = data?.error?.details || data?.data || null;

        const alreadyTaken =
          typeof msg === "string" &&
          (msg.includes("already taken") ||
           msg.toLowerCase().includes("email") && msg.toLowerCase().includes("unique"));

        if (response.status === 400 && alreadyTaken) {
          return NextResponse.json({ error: "Diese E-Mail-Adresse ist bereits registriert" }, { status: 400 });
        }

        return NextResponse.json({ error: msg, details }, { status: response.status || 500 });
      }

      console.log("✅ Strapi registration successful");

      if (data?.user && !data?.jwt) {
        console.log("ℹ️ Email confirmation flow detected for:", data.user.email);
        return NextResponse.json(
          {
            success: true,
            requiresEmailConfirmation: true,
            message: "Registrierung erfolgreich. Bitte bestätige deine E‑Mail, um dich anzumelden.",
            user: {
              email: data.user.email,
              confirmed: Boolean(data.user.confirmed),
              id: data.user.id,
            },
          },
          { status: 201 }
        );
      }

      if (data?.user && data?.jwt) {
        console.log("👤 User registered (no email confirmation required):", data.user.email);
        return NextResponse.json(
          {
            success: true,
            message: "Registrierung erfolgreich",
            user: {
              email: data.user.email,
              role: data.user.role || "student",
            },
            jwt: data.jwt,
          },
          { status: 201 }
        );
      }

      console.warn("⚠️ Unerwartete Strapi-Antwortstruktur:", data);
      return NextResponse.json(
        {
          success: true,
          message: "Registrierung abgeschlossen. Prüfe bitte deine E‑Mail zur Bestätigung.",
          raw: data,
        },
        { status: 201 }
      );
    } catch (strapiError: unknown) {
      const err = strapiError as Error
      console.error("🚨 Strapi registration failed:", err.message)

      if (err.name === "AbortError") {
        return NextResponse.json(
          { error: "Registrierung dauert zu lange. Bitte versuchen Sie es erneut." },
          { status: 408 },
        )
      }

      return NextResponse.json(
        {
          error: "Registrierung fehlgeschlagen. Bitte versuchen Sie es später erneut.",
          details: err.message,
        },
        { status: 503 },
      )
    }
  } catch (error) {
    const e = error as Error
    console.error("💥 Registration API critical error:", e)

    return NextResponse.json(
      {
        error: "Interner Serverfehler bei der Registrierung",
        details: e.message || "Unbekannter Fehler",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

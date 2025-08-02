// app/api/progress/route.ts

import { NextRequest, NextResponse } from "next/server"
import { API_URL } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")

  if (!token) {
    return NextResponse.json({ error: "Kein Token vorhanden" }, { status: 401 })
  }

  try {
    const strapiRes = await fetch(`${API_URL}/api/module-progress?populate=module`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await strapiRes.json()

    return NextResponse.json(data)
  } catch (err) {
    console.error("Fehler beim Laden des Fortschritts:", err)
    return NextResponse.json({ error: "Fehler beim Abrufen des Fortschritts" }, { status: 500 })
  }
}

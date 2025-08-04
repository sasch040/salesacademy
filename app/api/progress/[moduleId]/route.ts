// app/api/progress/[moduleId]/route.ts

import { NextRequest, NextResponse } from "next/server"
import { API_URL } from "@/lib/auth"

export async function PUT(req: NextRequest, { params }: { params: { moduleId: string } }) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) {
    return NextResponse.json({ error: "Kein Token vorhanden" }, { status: 401 })
  }

  const updates = await req.json()

  try {
    const strapiRes = await fetch(`${API_URL}/api/module-progress/${params.moduleId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data: updates }),
    })

    const updated = await strapiRes.json()

    return NextResponse.json(updated)
  } catch (err) {
    console.error("Fehler beim Updaten des Modul-Fortschritts:", err)
    return NextResponse.json({ error: "Update fehlgeschlagen" }, { status: 500 })
  }
}

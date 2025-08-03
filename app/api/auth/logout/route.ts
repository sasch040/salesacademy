import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  cookies().set("token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0, // löscht Cookie sofort
  })

  return NextResponse.json({ message: "Logout erfolgreich" })
}
import { NextResponse } from "next/server"

export async function POST() {
  const res = NextResponse.json({ message: "Logout erfolgreich" })
  res.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0, // sofort löschen
  })
  return res
}

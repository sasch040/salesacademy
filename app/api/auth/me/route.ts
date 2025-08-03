import { cookies } from "next/headers"
import { NextResponse } from "next/server"

const STRAPI_URL = "https://strapi-elearning-8rff.onrender.com"

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) {
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 })
  }

  const res = await fetch(`${STRAPI_URL}/api/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    return NextResponse.json({ error: "Ungültiger Token" }, { status: 401 })
  }

  const user = await res.json()
  return NextResponse.json({ user })
}

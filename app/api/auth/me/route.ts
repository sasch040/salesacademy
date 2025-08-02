// app/api/auth/me/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Kein Token übergeben' }, { status: 401 })
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Ungültiger Token' }, { status: res.status })
    }

    const user = await res.json()
    return NextResponse.json(user)
  } catch (err) {
    console.error('Fehler bei /api/auth/me:', err)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}

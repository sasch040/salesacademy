import { NextRequest, NextResponse } from "next/server"

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL!
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN!

// Fortschritt GET: hole für Modul + User
export async function GET(req: NextRequest, { params }: { params: { moduleId: string } }) {
  const email = req.nextUrl.searchParams.get("email")
  if (!email) return NextResponse.json({ error: "E-Mail fehlt" }, { status: 400 })

  // User holen
  const userRes = await fetch(`${STRAPI_URL}/api/users?filters[email][$eq]=${email}`,
    { headers: { Authorization: `Bearer ${STRAPI_TOKEN}` } })
  const users = await userRes.json()
  const user = users[0]
  if (!user) return NextResponse.json({ error: "User nicht gefunden" }, { status: 404 })

  // Modulfortschritt holen
  const progressRes = await fetch(
    `${STRAPI_URL}/api/module-progresses?filters[users_permissions_user][id][$eq]=${user.id}&filters[module][id][$eq]=${params.moduleId}&populate=*`,
    { headers: { Authorization: `Bearer ${STRAPI_TOKEN}` } }
  )
  const progress = await progressRes.json()
  return NextResponse.json(progress.data?.[0] || null)
}

// Fortschritt POST: neuen Eintrag anlegen
export async function POST(req: NextRequest, { params }: { params: { moduleId: string } }) {
  const body = await req.json()
  const { email, completed, quizCompleted, videoWatched } = body
  if (!email) return NextResponse.json({ error: "E-Mail fehlt" }, { status: 400 })

  // User holen
  const userRes = await fetch(`${STRAPI_URL}/api/users?filters[email][$eq]=${email}`,
    { headers: { Authorization: `Bearer ${STRAPI_TOKEN}` } })
  const users = await userRes.json()
  const user = users[0]
  if (!user) return NextResponse.json({ error: "User nicht gefunden" }, { status: 404 })

  // Fortschritt anlegen
  const createRes = await fetch(`${STRAPI_URL}/api/module-progresses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STRAPI_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: {
        module: params.moduleId,
        users_permissions_user: user.id,
        completed,
        quizCompleted,
        videoWatched,
      },
    }),
  })

  const result = await createRes.json()
  return NextResponse.json(result)
}

// Fortschritt PUT: bestehenden Eintrag aktualisieren oder neuen erstellen
export async function PUT(req: NextRequest, { params }: { params: { moduleId: string } }) {
  const body = await req.json()
  const { email, completed, quizCompleted, videoWatched } = body

  if (!email) return NextResponse.json({ error: "E-Mail fehlt" }, { status: 400 })

  // User holen
  const userRes = await fetch(`${STRAPI_URL}/api/users?filters[email][$eq]=${email}`,
    { headers: { Authorization: `Bearer ${STRAPI_TOKEN}` } })
  const users = await userRes.json()
  const user = users[0]
  if (!user) return NextResponse.json({ error: "User nicht gefunden" }, { status: 404 })

  // Fortschritt-Eintrag finden
  const findRes = await fetch(
    `${STRAPI_URL}/api/module-progresses?filters[users_permissions_user][id][$eq]=${user.id}&filters[module][id][$eq]=${params.moduleId}`,
    { headers: { Authorization: `Bearer ${STRAPI_TOKEN}` } }
  )
  const existing = await findRes.json()
  const existingId = existing?.data?.[0]?.id

  if (!existingId) {
    // Kein Eintrag -> POST
    const createRes = await fetch(`${STRAPI_URL}/api/module-progresses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          module: params.moduleId,
          users_permissions_user: user.id,
          completed,
          quizCompleted,
          videoWatched,
        },
      }),
    })
    const created = await createRes.json()
    return NextResponse.json(created)
  } else {
    // Eintrag vorhanden -> PUT
    const updateRes = await fetch(`${STRAPI_URL}/api/module-progresses/${existingId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          completed,
          quizCompleted,
          videoWatched,
        },
      }),
    })
    const updated = await updateRes.json()
    return NextResponse.json(updated)
  }
}

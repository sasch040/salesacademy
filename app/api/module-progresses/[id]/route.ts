import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "https://strapi-elearning-8rff.onrender.com"
// ⚠️ Server-Secret (kein NEXT_PUBLIC!)
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN

function json(status: number, body: any) {
  return NextResponse.json(body, { status })
}

async function getCurrentUserEmail(): Promise<string | null> {
  const userJwt = cookies().get("token")?.value
  if (!userJwt) return null
  const r = await fetch(`${STRAPI_URL}/api/users/me`, {
    headers: { Authorization: `Bearer ${userJwt}` },
    cache: "no-store",
  })
  if (!r.ok) return null
  const u = await r.json()
  return u?.email || null
}

async function fetchProgressWithOwner(id: string) {
  const r = await fetch(`${STRAPI_URL}/api/module-progresses/${id}?populate=authorized_user`, {
    headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` },
    cache: "no-store",
  })
  const data = await r.json().catch(() => null)
  return { ok: r.ok, status: r.status, data }
}

function mapProgress(item: any) {
  return {
    id: item.id,
    userEmail: item.attributes?.authorized_user?.data?.attributes?.email || "",
    module_id: item.attributes?.module_id ?? null,
    course_id: item.attributes?.course_id ?? null,
    video_completed: !!item.attributes?.video_completed,
    quiz_completed: !!item.attributes?.quiz_completed,
    completed: !!item.attributes?.completed,
    last_accessed: item.attributes?.last_accessed,
    completed_at: item.attributes?.completed_at,
  }
}

/** GET /api/module-progresses/[id] */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!STRAPI_API_TOKEN) return json(500, { error: "Server misconfigured" })

    const email = await getCurrentUserEmail()
    if (!email) return json(401, { error: "Unauthorized" })

    const { ok, status, data } = await fetchProgressWithOwner(params.id)
    if (!ok) {
      if (status === 404) return json(404, { error: "Progress entry not found" })
      return json(status, { error: "Failed to fetch from Strapi", details: data })
    }

    const ownerEmail = data?.data?.attributes?.authorized_user?.data?.attributes?.email || ""
    if (!ownerEmail || ownerEmail !== email) {
      return json(403, { error: "Forbidden" })
    }

    return json(200, { data: mapProgress(data.data) })
  } catch (e: any) {
    return json(500, { error: "Failed to fetch module progress", details: e?.message })
  }
}

/** PUT /api/module-progresses/[id] */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!STRAPI_API_TOKEN) return json(500, { error: "Server misconfigured" })

    const email = await getCurrentUserEmail()
    if (!email) return json(401, { error: "Unauthorized" })

    // 1) Eintrag + Owner prüfen
    const fetched = await fetchProgressWithOwner(params.id)
    if (!fetched.ok) {
      if (fetched.status === 404) return json(404, { error: "Progress entry not found" })
      return json(fetched.status, { error: "Failed to fetch from Strapi", details: fetched.data })
    }
    const ownerEmail = fetched.data?.data?.attributes?.authorized_user?.data?.attributes?.email || ""
    if (!ownerEmail || ownerEmail !== email) return json(403, { error: "Forbidden" })

    // 2) Body whitelisten & abgeleitete Felder setzen
    const body = await req.json().catch(() => ({}))
    const allow = ["video_completed", "quiz_completed", "last_accessed"] as const
    const patch: any = {}
    for (const k of allow) if (k in body) patch[k] = body[k]

    const prev = mapProgress(fetched.data.data)
    const nowIso = new Date().toISOString()

    // last_accessed immer aktualisieren (falls nicht explizit gesetzt)
    patch.last_accessed = patch.last_accessed || nowIso

    const nextVideo = "video_completed" in patch ? !!patch.video_completed : prev.video_completed
    const nextQuiz = "quiz_completed" in patch ? !!patch.quiz_completed : prev.quiz_completed
    const nextCompleted = nextVideo && nextQuiz

    patch.completed = nextCompleted
    patch.completed_at = nextCompleted ? (prev.completed_at || nowIso) : null

    // 3) Update an Strapi (korrektes Format!)
    const r = await fetch(`${STRAPI_URL}/api/module-progresses/${params.id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: patch }),
    })
    const data = await r.json().catch(() => null)
    if (!r.ok) return json(r.status, { error: "Failed to update progress", details: data })

    return json(200, { success: true, action: "updated", data: mapProgress(data.data) })
  } catch (e: any) {
    return json(500, { error: "Failed to update module progress", details: e?.message })
  }
}

/** DELETE /api/module-progresses/[id] */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!STRAPI_API_TOKEN) return json(500, { error: "Server misconfigured" })

    const email = await getCurrentUserEmail()
    if (!email) return json(401, { error: "Unauthorized" })

    // Owner prüfen
    const fetched = await fetchProgressWithOwner(params.id)
    if (!fetched.ok) {
      if (fetched.status === 404) return json(404, { error: "Progress entry not found" })
      return json(fetched.status, { error: "Failed to fetch from Strapi", details: fetched.data })
    }
    const ownerEmail = fetched.data?.data?.attributes?.authorized_user?.data_

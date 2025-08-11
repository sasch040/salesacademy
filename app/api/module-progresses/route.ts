import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "https://strapi-elearning-8rff.onrender.com"
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN

async function getUser() {
  const jwt = cookies().get("token")?.value
  if (!jwt) return null
  const r = await fetch(`${STRAPI_URL}/api/users/me`, {
    headers: { Authorization: `Bearer ${jwt}` },
    cache: "no-store",
  })
  if (!r.ok) return null
  return r.json()
}

export async function GET(req: NextRequest) {
  if (!STRAPI_API_TOKEN) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })
  const me = await getUser()
  if (!me?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const moduleId = searchParams.get("moduleId")

  const qs = [
    "populate=module,users_permissions_user",
    `filters[users_permissions_user][id][$eq]=${me.id}`,
  ]
  if (moduleId) qs.push(`filters[module][id][$eq]=${encodeURIComponent(moduleId)}`)

  const url = `${STRAPI_URL}/api/module-progresses?${qs.join("&")}`
  const r = await fetch(url, { headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }, cache: "no-store" })
  const data = await r.json().catch(() => null)
  if (!r.ok) return NextResponse.json({ error: "Fetch failed", details: data }, { status: r.status })

  const items = (data?.data ?? []).map((it: any) => ({
    id: it.id,
    moduleId: it.attributes?.module?.data?.id ?? null,
    userId: it.attributes?.users_permissions_user?.data?.id ?? null,
    videoWatched: !!it.attributes?.videoWatched,
    quizCompleted: !!it.attributes?.quizCompleted,
    completed: !!it.attributes?.completed,
  }))
  return NextResponse.json({ data: items, total: items.length })
}

export async function POST(req: NextRequest) {
  if (!STRAPI_API_TOKEN) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })
  const me = await getUser()
  if (!me?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { moduleId, videoWatched = false, quizCompleted = false } = await req.json().catch(() => ({}))
  if (!moduleId) return NextResponse.json({ error: "moduleId required" }, { status: 400 })

  // exists?
  const existUrl =
    `${STRAPI_URL}/api/module-progresses?` +
    `filters[users_permissions_user][id][$eq]=${me.id}&` +
    `filters[module][id][$eq]=${encodeURIComponent(String(moduleId))}&populate=*`

  const existRes = await fetch(existUrl, { headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` } })
  const existJson = await existRes.json().catch(() => null)
  if (!existRes.ok) return NextResponse.json({ error: "Check failed", details: existJson }, { status: existRes.status })

  const payload = {
    data: {
      users_permissions_user: me.id,
      module: Number(moduleId),
      videoWatched: !!videoWatched,
      quizCompleted: !!quizCompleted,
      completed: !!videoWatched && !!quizCompleted,
    },
  }

  // update or create
  if (existJson?.data?.length) {
    const id = existJson.data[0].id
    const up = await fetch(`${STRAPI_URL}/api/module-progresses/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const j = await up.json().catch(() => null)
    if (!up.ok) return NextResponse.json({ error: "Update failed", details: j }, { status: up.status })
    return NextResponse.json({ success: true, action: "updated", data: j.data })
  } else {
    const cr = await fetch(`${STRAPI_URL}/api/module-progresses`, {
      method: "POST",
      headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const j = await cr.json().catch(() => null)
    if (!cr.ok) {
      // Duplikat-Schutz (falls Race): erneut lesen und als updated ausgeben
      if ((j?.error?.message || "").toLowerCase().includes("exists")) {
        return NextResponse.json({ success: true, action: "noop", note: "already exists" })
      }
      return NextResponse.json({ error: "Create failed", details: j }, { status: cr.status })
    }
    return NextResponse.json({ success: true, action: "created", data: j.data })
  }
}

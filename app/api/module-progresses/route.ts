// app/api/module-progresses/route.ts
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "https://strapi-elearning-8rff.onrender.com"
// ⚠️ serverseitiges Secret – NICHT NEXT_PUBLIC verwenden
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN

async function getLoggedInEmail(): Promise<string | null> {
  const userJwt = cookies().get("token")?.value
  if (!userJwt) return null
  const me = await fetch(`${STRAPI_URL}/api/users/me`, {
    headers: { Authorization: `Bearer ${userJwt}` },
    cache: "no-store",
  })
  if (!me.ok) return null
  const u = await me.json()
  return u?.email || null
}

export async function GET(req: NextRequest) {
  try {
    if (!STRAPI_API_TOKEN) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })

    const email = await getLoggedInEmail()
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const moduleId = searchParams.get("moduleId")
    const courseId = searchParams.get("courseId")

    // Nur den eingeloggten User abfragen
    const qs: string[] = [
      "populate=*",
      `filters[authorized_user][email][$eq]=${encodeURIComponent(email)}`,
    ]
    if (moduleId) qs.push(`filters[module_id][$eq]=${encodeURIComponent(moduleId)}`)
    if (courseId) qs.push(`filters[course_id][$eq]=${encodeURIComponent(courseId)}`)

    const url = `${STRAPI_URL}/api/module-progresses?${qs.join("&")}`
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` },
      cache: "no-store",
    })
    const data = await r.json().catch(() => null)
    if (!r.ok) return NextResponse.json({ error: "Failed to fetch from Strapi", details: data }, { status: r.status })

    const items =
      data?.data?.map((item: any) => ({
        id: item.id,
        userEmail: item.attributes?.authorized_user?.data?.attributes?.email || "",
        module_id: item.attributes?.module_id ?? null,
        course_id: item.attributes?.course_id ?? null,
        video_completed: !!item.attributes?.video_completed,
        quiz_completed: !!item.attributes?.quiz_completed,
        completed: !!item.attributes?.completed,
        last_accessed: item.attributes?.last_accessed,
        completed_at: item.attributes?.completed_at,
      })) ?? []

    return NextResponse.json({
      data: items,
      meta: { total: items.length, filters: { moduleId, courseId } },
    })
  } catch (e: any) {
    return NextResponse.json({ error: "Internal server error", details: e?.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!STRAPI_API_TOKEN) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })

    const email = await getLoggedInEmail()
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const { module_id, course_id, video_completed = false, quiz_completed = false } = body || {}

    if (!module_id) return NextResponse.json({ error: "Missing required field: module_id" }, { status: 400 })

    // 1) authorized_user via Email finden
    const userRes = await fetch(
      `${STRAPI_URL}/api/authorized-users?filters[email][$eq]=${encodeURIComponent(email)}`,
      { headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` } }
    )
    const userJson = await userRes.json().catch(() => null)
    if (!userRes.ok || !userJson?.data?.length) {
      return NextResponse.json({ error: "Authorized user not found" }, { status: 404 })
    }
    const authorizedUserId = userJson.data[0].id

    // 2) bestehenden Fortschritt finden
    const existUrl =
      `${STRAPI_URL}/api/module-progresses?` +
      `filters[authorized_user][id][$eq]=${authorizedUserId}&` +
      `filters[module_id][$eq]=${encodeURIComponent(String(module_id))}&populate=*`
    const existRes = await fetch(existUrl, { headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` } })
    const existJson = await existRes.json().catch(() => null)
    if (!existRes.ok) {
      return NextResponse.json({ error: "Failed to check existing progress", details: existJson }, { status: existRes.status })
    }

    // 3) Daten vorbereiten
    const now = new Date().toISOString()
    const willBeCompleted = !!video_completed && !!quiz_completed

    const progressData = {
      authorized_user: authorizedUserId,
      module_id: Number(module_id),
      course_id: course_id ? Number(course_id) : null,
      video_completed: !!video_completed,
      quiz_completed: !!quiz_completed,
      completed: willBeCompleted,
      last_accessed: now,
      completed_at: willBeCompleted ? now : null,
    }

    // 4) Update oder Create
    if (existJson?.data?.length) {
      const progressId = existJson.data[0].id
      const updateRes = await fetch(`${STRAPI_URL}/api/module-progresses/${progressId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${STRAPI_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: progressData }),
      })
      const updateJson = await updateRes.json().catch(() => null)
      if (!updateRes.ok) {
        return NextResponse.json({ error: "Failed to update progress", details: updateJson }, { status: updateRes.status })
      }
      return NextResponse.json({ success: true, action: "updated", data: updateJson.data })
    } else {
      const createRes = await fetch(`${STRAPI_URL}/api/module-progresses`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${STRAPI_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: progressData }),
      })
      const createJson = await createRes.json().catch(() => null)
      if (!createRes.ok) {
        return NextResponse.json({ error: "Failed to create progress", details: createJson }, { status: createRes.status })
      }
      return NextResponse.json({ success: true, action: "created", data: createJson.data })
    }
  } catch (e: any) {
    return NextResponse.json({ error: "Internal server error", details: e?.message }, { status: 500 })
  }
}

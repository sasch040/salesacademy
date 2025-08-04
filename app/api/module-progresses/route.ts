import { type NextRequest, NextResponse } from "next/server"

const STRAPI_URL = "https://strapi-elearning-8rff.onrender.com"
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get("userEmail")
    const moduleId = searchParams.get("moduleId")
    const courseId = searchParams.get("courseId")

    console.log("📡 GET /api/module-progresses")
    console.log("🔍 Query params:", { userEmail, moduleId, courseId })

    if (!STRAPI_TOKEN) {
      console.error("❌ Missing STRAPI_TOKEN")
      return NextResponse.json({ error: "Missing API token" }, { status: 500 })
    }

    // Build Strapi query
    let strapiQuery = `${STRAPI_URL}/api/module-progresses?populate=*`

    const filters = []
    if (userEmail) {
      filters.push(`filters[authorized_user][email][$eq]=${encodeURIComponent(userEmail)}`)
    }
    if (moduleId) {
      filters.push(`filters[module_id][$eq]=${moduleId}`)
    }
    if (courseId) {
      filters.push(`filters[course_id][$eq]=${courseId}`)
    }

    if (filters.length > 0) {
      strapiQuery += "&" + filters.join("&")
    }

    console.log("📡 Strapi Query:", strapiQuery)

    const response = await fetch(strapiQuery, {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        "Content-Type": "application/json",
      },
    })
    const data = await response.json()
    if (!response.ok) {
      console.error("❌ Strapi API failed:", response.status, data)
      return NextResponse.json({ error: "Failed to fetch from Strapi" }, { status: response.status })
    }

    console.log("✅ Strapi response:", data.data?.length || 0, "items")

    // Transform data
    const transformedData =
      data.data?.map((item: any) => ({
        id: item.id,
        userEmail: item.attributes.authorized_user?.data?.attributes?.email || "",
        module_id: item.attributes.module_id,
        course_id: item.attributes.course_id,
        video_completed: item.attributes.video_completed || false,
        quiz_completed: item.attributes.quiz_completed || false,
        completed: item.attributes.completed || false,
        last_accessed: item.attributes.last_accessed || new Date().toISOString(),
        completed_at: item.attributes.completed_at,
      })) || []

    // Group data
    const byUser: Record<string, any[]> = {}
    const byModule: Record<string, any[]> = {}
    const byCourse: Record<string, any[]> = {}

    transformedData.forEach((item: any) => {
      // By User
      if (item.userEmail) {
        if (!byUser[item.userEmail]) byUser[item.userEmail] = []
        byUser[item.userEmail].push(item)
      }

      // By Module
      if (item.module_id) {
        if (!byModule[item.module_id]) byModule[item.module_id] = []
        byModule[item.module_id].push(item)
      }

      // By Course
      if (item.course_id) {
        if (!byCourse[item.course_id]) byCourse[item.course_id] = []
        byCourse[item.course_id].push(item)
      }
    })

    return NextResponse.json({
      data: transformedData,
      byUser,
      byModule,
      byCourse,
      meta: {
        total: transformedData.length,
        filters: { userEmail, moduleId, courseId },
      },
    })
  } catch (error) {
    console.error("💥 Error in GET /api/module-progresses:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("📡 POST /api/module-progresses")
    console.log("📝 Request body:", body)

    const { userEmail, module_id, course_id, video_completed, quiz_completed } = body

    if (!userEmail || !module_id) {
      return NextResponse.json({ error: "Missing required fields: userEmail, module_id" }, { status: 400 })
    }

    if (!STRAPI_TOKEN) {
      return NextResponse.json({ error: "Missing API token" }, { status: 500 })
    }

    // 1. Find user by email
    console.log("🔍 Looking up user by email:", userEmail)
    const userResponse = await fetch(
      `${STRAPI_URL}/api/authorized-users?filters[email][$eq]=${encodeURIComponent(userEmail)}`,
      {
        headers: {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    )

    if (!userResponse.ok) {
      console.error("❌ User lookup failed:", userResponse.status)
      return NextResponse.json({ error: "User lookup failed" }, { status: userResponse.status })
    }

    const userData = await userResponse.json()
    console.log("👤 User lookup result:", userData.data?.length || 0, "users found")

    if (!userData.data || userData.data.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userId = userData.data[0].id
    console.log("✅ User ID found:", userId)

    // 2. Check for existing progress
    console.log("🔍 Checking for existing progress...")
    const existingResponse = await fetch(
      `${STRAPI_URL}/api/module-progresses?filters[authorized_user][id][$eq]=${userId}&filters[module_id][$eq]=${module_id}&populate=*`,
      {
        headers: {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    )

    if (!existingResponse.ok) {
      console.error("❌ Existing progress check failed:", existingResponse.status)
      return NextResponse.json({ error: "Failed to check existing progress" }, { status: existingResponse.status })
    }

    const existingData = await existingResponse.json()
    console.log("📊 Existing progress check:", existingData.data?.length || 0, "entries found")

    // 3. Prepare progress data
    const progressData = {
      authorized_user: userId,
      module_id: Number.parseInt(module_id.toString()),
      course_id: course_id ? Number.parseInt(course_id.toString()) : null,
      video_completed: video_completed || false,
      quiz_completed: quiz_completed || false,
      completed: (video_completed || false) && (quiz_completed || false),
      last_accessed: new Date().toISOString(),
      completed_at: (video_completed || false) && (quiz_completed || false) ? new Date().toISOString() : null,
    }

    console.log("📝 Progress data to save:", progressData)

    // 4. Update or Create
    if (existingData.data && existingData.data.length > 0 && existingData.data[0]?.id) {
      // UPDATE existing progress
      const existingProgress = existingData.data[0]
      const progressId = existingProgress.id

      console.log("🔄 Updating existing progress with ID:", progressId)

      const updateResponse = await fetch(`${STRAPI_URL}/api/module-progresses/${progressId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: progressData }),
      })

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json()
        console.error("❌ Update failed:", updateResponse.status, errorData)
        return NextResponse.json({ error: "Failed to update progress" }, { status: updateResponse.status })
      }

      const updateResult = await updateResponse.json()
      console.log("✅ Progress updated successfully")

      return NextResponse.json({
        success: true,
        action: "updated",
        data: updateResult.data,
      })
    } else {
      // CREATE new progress
      console.log("➕ Creating new progress entry")

      const createResponse = await fetch(`${STRAPI_URL}/api/module-progresses`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: progressData }),
      })

      if (!createResponse.ok) {
        const errorData = await createResponse.json()
        console.error("❌ Create failed:", createResponse.status, errorData)
        return NextResponse.json({ error: "Failed to create progress" }, { status: createResponse.status })
      }

      const createResult = await createResponse.json()
      console.log("✅ Progress created successfully")

      return NextResponse.json({
        success: true,
        action: "created",
        data: createResult.data,
      })
    }
  } catch (error) {
    console.error("💥 Error in POST /api/module-progresses:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

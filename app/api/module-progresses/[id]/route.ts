import { type NextRequest, NextResponse } from "next/server"

const STRAPI_URL = "https://strapi-elearning-8rff.onrender.com"
const STRAPI_TOKEN =
  process.env.STRAPI_API_TOKEN ||
  "992949dd37394d8faa798febe2bcd19c61aaa07c1b30873b4fe6cc4c6dce0db003fee18d71e12ec0ac5af64c61ffca2b4069eff02d5f3bfbe744a4dd6eab540a53479d68375cf0a3f2ee4231c245e5d1b09ae58356ef2744a3757bc3ca01a6189fe687cd06517aaa3b1e99b376d8203277"

// PUT - Update einen bestehenden Modul-Fortschritt
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("🔍 === MODULE PROGRESS UPDATE - PUT ===")
    console.log("🔢 Progress ID:", params.id)

    const body = await request.json()
    console.log("📝 Update body:", body)

    if (!STRAPI_TOKEN) {
      console.error("❌ STRAPI_API_TOKEN is missing!")
      throw new Error("STRAPI_API_TOKEN environment variable is not set")
    }

    // Direkte Weiterleitung an Strapi
    const updateUrl = `${STRAPI_URL}/api/module-progresses/${params.id}`
    console.log("📡 Updating at:", updateUrl)

    const response = await fetch(updateUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("💥 Strapi update error:", response.status, response.statusText, errorText)

      // Spezielle Behandlung für 404 (ID nicht gefunden)
      if (response.status === 404) {
        return NextResponse.json(
          {
            error: "Progress entry not found",
            details: `No module progress found with ID ${params.id}`,
            suggestion: "Use POST to create a new progress entry instead",
          },
          { status: 404 },
        )
      }

      throw new Error(`Strapi returned ${response.status}: ${response.statusText}`)
    }

    const updatedData = await response.json()
    console.log("✅ Progress updated successfully")

    return NextResponse.json({
      success: true,
      action: "updated",
      data: updatedData.data,
    })
  } catch (error: unknown) {
    const err = error as Error
    console.error("💥 Module progress PUT error:", err)
    return NextResponse.json(
      {
        error: "Failed to update module progress",
        details: err.message,
      },
      { status: 500 },
    )
  }
}

// GET - Hole einen spezifischen Modul-Fortschritt
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("🔍 === MODULE PROGRESS GET - Single Entry ===")
    console.log("🔢 Progress ID:", params.id)

    if (!STRAPI_TOKEN) {
      console.error("❌ STRAPI_API_TOKEN is missing!")
      throw new Error("STRAPI_API_TOKEN environment variable is not set")
    }

    const getUrl = `${STRAPI_URL}/api/module-progresses/${params.id}?populate=*`
    console.log("📡 Fetching from:", getUrl)

    const response = await fetch(getUrl, {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("💥 Strapi get error:", response.status, response.statusText, errorText)

      if (response.status === 404) {
        return NextResponse.json(
          {
            error: "Progress entry not found",
            details: `No module progress found with ID ${params.id}`,
          },
          { status: 404 },
        )
      }

      throw new Error(`Strapi returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ Progress fetched successfully")

    return NextResponse.json(data)
  } catch (error) {
    const e = error as Error
    console.error("💥 Module progress GET error:", e)
    return NextResponse.json(
      {
        error: "Failed to fetch module progress",
        details: e.message,
      },
      { status: 500 },
    )
  }
}

// DELETE - Lösche einen Modul-Fortschritt
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("🔍 === MODULE PROGRESS DELETE ===")
    console.log("🔢 Progress ID:", params.id)

    if (!STRAPI_TOKEN) {
      console.error("❌ STRAPI_API_TOKEN is missing!")
      throw new Error("STRAPI_API_TOKEN environment variable is not set")
    }

    const deleteUrl = `${STRAPI_URL}/api/module-progresses/${params.id}`
    console.log("📡 Deleting at:", deleteUrl)

    const response = await fetch(deleteUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("💥 Strapi delete error:", response.status, response.statusText, errorText)

      if (response.status === 404) {
        return NextResponse.json(
          {
            error: "Progress entry not found",
            details: `No module progress found with ID ${params.id}`,
          },
          { status: 404 },
        )
      }

      throw new Error(`Strapi returned ${response.status}: ${response.statusText}`)
    }

    const deletedData = await response.json()
    console.log("✅ Progress deleted successfully")

    return NextResponse.json({
      success: true,
      action: "deleted",
      data: deletedData.data,
    })
  } catch (error) {
    const err = error as Error
    console.error("💥 Module progress DELETE error:", err)
    return NextResponse.json(
      {
        error: "Failed to delete module progress",
        details: err.message,
      },
      { status: 500 },
    )
  }
}

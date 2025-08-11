import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const STRAPI_URL = process.env.STRAPI_URL || "https://strapi-elearning-8rff.onrender.com";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

function j(status: number, body: any) {
  return NextResponse.json(body, { status });
}

async function getMe() {
  const jwt = cookies().get("token")?.value;
  if (!jwt) return null;
  const r = await fetch(`${STRAPI_URL}/api/users/me`, {
    headers: { Authorization: `Bearer ${jwt}` },
    cache: "no-store",
  });
  if (!r.ok) return null;
  return r.json();
}

export async function GET(req: NextRequest) {
  try {
    if (!STRAPI_API_TOKEN) return j(500, { error: "Server misconfigured (no STRAPI_API_TOKEN)" });
    const me = await getMe();
    if (!me?.id) return j(401, { error: "Unauthorized" });

    const { searchParams } = new URL(req.url);
    const moduleId = searchParams.get("moduleId");

    const qs = [
      "populate=module,users_permissions_user",
      `filters[users_permissions_user][id][$eq]=${me.id}`,
    ];
    if (moduleId) qs.push(`filters[module][id][$eq]=${encodeURIComponent(moduleId)}`);

    const url = `${STRAPI_URL}/api/module-progresses?${qs.join("&")}`;
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` },
      cache: "no-store",
    });
    const data = await r.json();
    if (!r.ok) return j(r.status, { error: "Fetch failed", details: data });

    return j(200, { data: data.data ?? [] });
  } catch (e: any) {
    return j(500, { error: "Internal error", details: e?.message });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!STRAPI_API_TOKEN) return j(500, { error: "Server misconfigured (no STRAPI_API_TOKEN)" });
    const me = await getMe();
    if (!me?.id) return j(401, { error: "Unauthorized" });

    const body = await req.json().catch(() => ({}));
    const moduleId = Number(body?.moduleId);
    const videoWatched = Boolean(body?.videoWatched);
    const quizCompleted = Boolean(body?.quizCompleted);
    if (!moduleId) return j(400, { error: "moduleId required" });

    // 1) gibt es bereits einen Eintrag für (user,module)?
    const findUrl =
      `${STRAPI_URL}/api/module-progresses?populate=module,users_permissions_user` +
      `&filters[users_permissions_user][id][$eq]=${me.id}` +
      `&filters[module][id][$eq]=${moduleId}`;
    const f = await fetch(findUrl, { headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` } });
    const fjson = await f.json();
    if (!f.ok) return j(f.status, { error: "Lookup failed", details: fjson });

    const completed = (videoWatched || false) && (quizCompleted || false);
    const payload = {
      data: {
        users_permissions_user: me.id,
        module: moduleId,
        videoWatched,
        quizCompleted,
        completed,
      },
    };

    if (Array.isArray(fjson.data) && fjson.data.length > 0) {
      // Update (Owner-Check: gehört der Eintrag dem User?)
      const existing = fjson.data[0];
      const ownerId = existing?.attributes?.users_permissions_user?.data?.id;
      if (ownerId !== me.id) return j(403, { error: "Forbidden" });

      const upd = await fetch(`${STRAPI_URL}/api/module-progresses/${existing.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${STRAPI_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const ujson = await upd.json();
      if (!upd.ok) return j(upd.status, { error: "Update failed", details: ujson });
      return j(200, { success: true, action: "updated", data: ujson.data });
    }

    // Create
    const crt = await fetch(`${STRAPI_URL}/api/module-progresses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const cjson = await crt.json();
    if (!crt.ok) return j(crt.status, { error: "Create failed", details: cjson });
    return j(201, { success: true, action: "created", data: cjson.data });
  } catch (e: any) {
    return j(500, { error: "Internal error", details: e?.message });
  }
}

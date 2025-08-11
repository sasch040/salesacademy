import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const STRAPI_URL = process.env.STRAPI_URL || "https://strapi-elearning-8rff.onrender.com";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

const j = (status: number, body: any) => NextResponse.json(body, { status });

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

    const meId = Number(me.id);
    const { searchParams } = new URL(req.url);
    const moduleId = searchParams.get("moduleId") ?? undefined;

    const qs = new URLSearchParams();
    // populate beide möglichen Owner-Relationen und module.id
    qs.set("populate[module][fields][0]", "id");
    qs.set("populate[users_permissions_user][fields][0]", "id");
    qs.set("populate[user][fields][0]", "id");

    // filters: moduleId optional + Owner via OR (users_permissions_user ODER user)
    if (moduleId) qs.set("filters[$and][0][module][id][$eq]", String(moduleId));
    qs.set("filters[$and][1][$or][0][users_permissions_user][id][$eq]", String(meId));
    qs.set("filters[$and][1][$or][1][user][id][$eq]", String(meId));

    qs.set("pagination[pageSize]", "100");

    const url = `${STRAPI_URL}/api/module-progresses?${qs.toString()}`;
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` },
      cache: "no-store",
    });

    const raw = await r.json();
    if (!r.ok) return j(r.status, { error: "Fetch failed", details: raw });

    const data = (raw?.data || []).map((row: any) => ({
      id: row?.id,
      moduleId: row?.attributes?.module?.data?.id ?? null,
      videoWatched: !!row?.attributes?.videoWatched,
      quizCompleted: !!row?.attributes?.quizCompleted,
      completed: !!row?.attributes?.completed,
    }));

    return j(200, { data });
  } catch (e: any) {
    return j(500, { error: "Internal error", details: e?.message });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!STRAPI_API_TOKEN) return j(500, { error: "Server misconfigured (no STRAPI_API_TOKEN)" });
    const me = await getMe();
    if (!me?.id) return j(401, { error: "Unauthorized" });

    const meId = Number(me.id);

    const body = await req.json().catch(() => ({}));
    const moduleId = Number(body?.moduleId ?? body?.module_id);
    const videoWatched = Boolean(body?.videoWatched);
    const quizCompleted = Boolean(body?.quizCompleted);
    if (!moduleId) return j(400, { error: "moduleId required" });

    // Lookup: gleicher User (OR über die zwei möglichen Feldnamen) + Modul
    const findQs = new URLSearchParams();
    findQs.set("populate[module][fields][0]", "id");
    findQs.set("populate[users_permissions_user][fields][0]", "id");
    findQs.set("populate[user][fields][0]", "id");
    findQs.set("filters[$and][0][module][id][$eq]", String(moduleId));
    findQs.set("filters[$and][1][$or][0][users_permissions_user][id][$eq]", String(meId));
    findQs.set("filters[$and][1][$or][1][user][id][$eq]", String(meId));

    const findUrl = `${STRAPI_URL}/api/module-progresses?${findQs.toString()}`;
    const f = await fetch(findUrl, { headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` } });
    const fjson = await f.json();
    if (!f.ok) return j(f.status, { error: "Lookup failed", details: fjson });

    const completed = videoWatched && quizCompleted;

    // Update-Fall
    if (Array.isArray(fjson.data) && fjson.data.length > 0) {
      const existing = fjson.data[0];
      const ownerId =
        existing?.attributes?.users_permissions_user?.data?.id ??
        existing?.attributes?.user?.data?.id;
      const ownerNum = ownerId == null ? null : Number(ownerId);

      // Owner-Check nur, wenn ownerNum bekannt
      if (ownerNum != null && ownerNum !== meId) {
        return j(403, {
          error: "Forbidden (owner mismatch)",
          details: { ownerId: ownerNum, meId },
        });
      }

      const upd = await fetch(`${STRAPI_URL}/api/module-progresses/${existing.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${STRAPI_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: { videoWatched, quizCompleted, completed } }),
      });
      const ujson = await upd.json();
      if (!upd.ok) return j(upd.status, { error: "Update failed", details: ujson });

      return j(200, {
        success: true,
        action: "updated",
        data: { id: ujson?.data?.id, moduleId, videoWatched, quizCompleted, completed },
      });
    }

    // Create-Fall (Standard: Feld heißt users_permissions_user)
    const payload = {
      data: {
        users_permissions_user: meId,
        module: moduleId,
        videoWatched,
        quizCompleted,
        completed,
      },
    };

    let crt = await fetch(`${STRAPI_URL}/api/module-progresses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // Fallback: falls dein Feld tatsächlich 'user' heißt
    if (!crt.ok) {
      const firstErr = await crt.clone().json().catch(() => ({}));
      const tryUserPayload = {
        data: {
          user: meId,
          module: moduleId,
          videoWatched,
          quizCompleted,
          completed,
        },
      };
      crt = await fetch(`${STRAPI_URL}/api/module-progresses`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${STRAPI_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tryUserPayload),
      });
      if (!crt.ok) {
        const secondErr = await crt.json().catch(() => ({}));
        return j(crt.status, { error: "Create failed", details: { firstErr, secondErr } });
      }
    }

    const cjson = await crt.json();
    return j(201, {
      success: true,
      action: "created",
      data: { id: cjson?.data?.id, moduleId, videoWatched, quizCompleted, completed },
    });
  } catch (e: any) {
    return j(500, { error: "Internal error", details: e?.message });
  }
}

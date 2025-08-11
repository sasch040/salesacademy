import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const STRAPI_URL = process.env.STRAPI_URL || "https://strapi-elearning-8rff.onrender.com";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;
const j = (s: number, b: any) => NextResponse.json(b, { status: s });

async function me() {
  const jwt = cookies().get("token")?.value;
  if (!jwt) return null;
  const r = await fetch(`${STRAPI_URL}/api/users/me`, {
    headers: { Authorization: `Bearer ${jwt}` },
    cache: "no-store",
  });
  if (!r.ok) return null;
  return r.json();
}

async function fetchOne(id: string) {
  const qs = new URLSearchParams();
  qs.set("populate[users_permissions_user][fields][0]", "id");
  qs.set("populate[module][fields][0]", "id");

  const r = await fetch(`${STRAPI_URL}/api/module-progresses/${id}?${qs.toString()}`, {
    headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` },
    cache: "no-store",
  });
  const data = await r.json();
  return { ok: r.ok, status: r.status, data };
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!STRAPI_API_TOKEN) return j(500, { error: "Server misconfigured" });
  const user = await me();
  if (!user?.id) return j(401, { error: "Unauthorized" });

  const { ok, status, data } = await fetchOne(params.id);
  if (!ok) return j(status, { error: status === 404 ? "Not found" : "Fetch failed", details: data });

  const ownerId = Number(data?.data?.attributes?.users_permissions_user?.data?.id ?? NaN);
  const meId = Number(user.id);
  if (!Number.isNaN(ownerId) && ownerId !== meId) {
    return j(403, { error: "Forbidden (owner mismatch)", details: { ownerId, meId } });
  }

  return j(200, { data: data.data });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!STRAPI_API_TOKEN) return j(500, { error: "Server misconfigured" });
  const user = await me();
  if (!user?.id) return j(401, { error: "Unauthorized" });

  const check = await fetchOne(params.id);
  if (!check.ok) return j(check.status, { error: "Not found", details: check.data });

  const ownerId = Number(check.data?.data?.attributes?.users_permissions_user?.data?.id ?? NaN);
  const meId = Number(user.id);
  if (!Number.isNaN(ownerId) && ownerId !== meId) {
    return j(403, { error: "Forbidden (owner mismatch)", details: { ownerId, meId } });
  }

  const body = await req.json().catch(() => ({}));
  const upd = await fetch(`${STRAPI_URL}/api/module-progresses/${params.id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ data: { ...body?.data } }),
  });
  const ujson = await upd.json();
  if (!upd.ok) return j(upd.status, { error: "Update failed", details: ujson });
  return j(200, { success: true, action: "updated", data: ujson.data });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!STRAPI_API_TOKEN) return j(500, { error: "Server misconfigured" });
  const user = await me();
  if (!user?.id) return j(401, { error: "Unauthorized" });

  const check = await fetchOne(params.id);
  if (!check.ok) return j(check.status, { error: "Not found", details: check.data });

  const ownerId = Number(check.data?.data?.attributes?.users_permissions_user?.data?.id ?? NaN);
  const meId = Number(user.id);
  if (!Number.isNaN(ownerId) && ownerId !== meId) {
    return j(403, { error: "Forbidden (owner mismatch)", details: { ownerId, meId } });
  }

  const del = await fetch(`${STRAPI_URL}/api/module-progresses/${params.id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` },
  });
  const djson = await del.json();
  if (!del.ok) return j(del.status, { error: "Delete failed", details: djson });
  return j(200, { success: true, action: "deleted", data: djson.data });
}

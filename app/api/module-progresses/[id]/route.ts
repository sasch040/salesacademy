import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "https://strapi-elearning-8rff.onrender.com"
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN
const j = (s:number,b:any)=>NextResponse.json(b,{status:s})

async function me() {
  const jwt = cookies().get("token")?.value
  if (!jwt) return null
  const r = await fetch(`${STRAPI_URL}/api/users/me`, { headers:{Authorization:`Bearer ${jwt}`}, cache:"no-store" })
  if (!r.ok) return null
  return r.json()
}
async function fetchOne(id:string){
  const r = await fetch(`${STRAPI_URL}/api/module-progresses/${id}?populate=users_permissions_user,module`, {
    headers:{Authorization:`Bearer ${STRAPI_API_TOKEN}`}, cache:"no-store"
  })
  const data = await r.json().catch(()=>null)
  return {ok:r.ok,status:r.status,data}
}

export async function GET(_req:NextRequest,{params}:{params:{id:string}}){
  if(!STRAPI_API_TOKEN) return j(500,{error:"Server misconfigured"})
  const user = await me(); if(!user?.id) return j(401,{error:"Unauthorized"})
  const {ok,status,data} = await fetchOne(params.id)
  if(!ok) return j(status, {error: status===404?"Not found":"Fetch failed", details:data})
  const ownerId = data?.data?.attributes?.users_permissions_user?.data?.id
  if(ownerId !== user.id) return j(403,{error:"Forbidden"})
  return j(200,{ data: data.data })
}

export async function PUT(req:NextRequest,{params}:{params:{id:string}}){
  if(!STRAPI_API_TOKEN) return j(500,{error:"Server misconfigured"})
  const user = await me(); if(!user?.id) return j(401,{error:"Unauthorized"})

  const current = await fetchOne(params.id)
  if(!current.ok) return j(current.status,{error: current.status===404?"Not found":"Fetch failed", details: current.data})
  const ownerId = current.data?.data?.attributes?.users_permissions_user?.data?.id
  if(ownerId !== user.id) return j(403,{error:"Forbidden"})

  const body = await req.json().catch(()=>({}))
  const patch:any = {}
  if("videoWatched" in body) patch.videoWatched = !!body.videoWatched
  if("quizCompleted" in body) patch.quizCompleted = !!body.quizCompleted

  const prev = current.data?.data?.attributes || {}
  const v = ("videoWatched" in patch) ? patch.videoWatched : !!prev.videoWatched
  const q = ("quizCompleted" in patch) ? patch.quizCompleted : !!prev.quizCompleted
  patch.completed = v && q

  const r = await fetch(`${STRAPI_URL}/api/module-progresses/${params.id}`,{
    method:"PUT",
    headers:{Authorization:`Bearer ${STRAPI_API_TOKEN}`,"Content-Type":"application/json"},
    body: JSON.stringify({ data: patch })
  })
  const data = await r.json().catch(()=>null)
  if(!r.ok) return j(r.status,{error:"Update failed", details:data})
  return j(200,{success:true,action:"updated", data:data.data})
}

export async function DELETE(_req:NextRequest,{params}:{params:{id:string}}){
  if(!STRAPI_API_TOKEN) return j(500,{error:"Server misconfigured"})
  const user = await me(); if(!user?.id) return j(401,{error:"Unauthorized"})

  const current = await fetchOne(params.id)
  if(!current.ok) return j(current.status,{error: current.status===404?"Not found":"Fetch failed", details: current.data})
  const ownerId = current.data?.data?.attributes?.users_permissions_user?.data?.id
  if(ownerId !== user.id) return j(403,{error:"Forbidden"})

  const r = await fetch(`${STRAPI_URL}/api/module-progresses/${params.id}`,{
    method:"DELETE", headers:{Authorization:`Bearer ${STRAPI_API_TOKEN}`}
  })
  const data = await r.json().catch(()=>null)
  if(!r.ok) return j(r.status,{error:"Delete failed", details:data})
  return j(200,{success:true,action:"deleted", data:data.data})
}

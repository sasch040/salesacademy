// lib/auth.ts (client-safe)

export async function me() {
  const res = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
  if (!res.ok) throw new Error("Nicht eingeloggt")
  return res.json() // => { user: { ... } }
}

export async function login(email: string, password: string) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  })
  return res.json()
}

export async function logout() {
  await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
}

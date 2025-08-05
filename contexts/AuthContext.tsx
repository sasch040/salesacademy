"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import type { User } from "@/lib/types"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  login: (identifier: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<{ requiresEmailConfirmation: boolean }>
  logout: () => Promise<void>
}
export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  // ⏳ Lädt User über Cookie bei App-Start
  useEffect(() => {
    fetch("/api/auth/me", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user)
        } else {
          setUser(null)
        }
      })
      .catch(() => setUser(null))
  }, [])

  // 🔐 Login – ruft interne API, setzt HttpOnly-Cookie
  const login = async (identifier: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ identifier, password }),
    })

    const contentType = res.headers.get("content-type")

    if (!res.ok) {
      let errorMessage = "Login fehlgeschlagen"
      if (contentType?.includes("application/json")) {
        const errData = await res.json()
        errorMessage = errData?.error || errorMessage
      } else {
        const text = await res.text()
        errorMessage = text || errorMessage
      }
      throw new Error(errorMessage)
    }

    const data = await res.json()
    setUser(data.user)
    setTimeout(() => {
      router.replace("/dashboard")
    }, 0)
  }

  // 📝 Registrierung – direkter Aufruf an Strapi (wenn Cookie nicht gebraucht wird)
  const register = async (username: string, email: string, password: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/local/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    })

    const contentType = res.headers.get("content-type")

    if (!res.ok) {
      let errorMessage = "Registrierung fehlgeschlagen"
      if (contentType?.includes("application/json")) {
        const errData = await res.json()
        errorMessage = errData?.error?.message || errorMessage
      } else {
        const text = await res.text()
        errorMessage = text || errorMessage
      }
      throw new Error(errorMessage)
    }

    const data = await res.json()
    return { requiresEmailConfirmation: true } // Rückgabe für die UI z. B.:
  }

  // 🚪 Logout – löscht Cookie via eigene API
  const logout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    })
    setUser(null)
    router.push("/auth/login")
  }

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

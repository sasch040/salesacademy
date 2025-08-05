"use client"

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import type { User } from "@/lib/types"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (identifier: string, password: string) => Promise<void>
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<{ requiresEmailConfirmation: boolean }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // ⏳ Lädt User über HttpOnly-Cookie beim ersten Seitenaufruf
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        })
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  // 🔐 Login – setzt HttpOnly-Cookie via interne API
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
    router.replace("/dashboard")
  }

  // 📝 Registrierung – direkter Aufruf an Strapi
  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/local/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      }
    )

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
    return { requiresEmailConfirmation: true }
  }

  // 🚪 Logout – entfernt Cookie via API
  const logout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    })
    setUser(null)
    router.push("/auth/login")
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout }}
    >
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

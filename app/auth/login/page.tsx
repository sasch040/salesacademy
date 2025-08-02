"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [warning, setWarning] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setWarning("")

    try {
      console.log("🔄 Attempting login...")

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      console.log("📊 Response status:", response.status)
      console.log("📊 Response headers:", Object.fromEntries(response.headers.entries()))

      // Check if response is JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.error("❌ API returned non-JSON response:", contentType)
        const textResponse = await response.text()
        console.error("❌ Response body:", textResponse.substring(0, 500))
        throw new Error("Server returned an invalid response. Please try again later.")
      }

      const data = await response.json()
      console.log("📦 Response data:", data)

      if (response.ok && data.success) {
        console.log("✅ Login successful")

        // JWT Token im localStorage speichern
        if (data.token) {
          localStorage.setItem("authToken", data.token)
          localStorage.setItem("userEmail", email)
          localStorage.setItem("userRole", data.user?.role || "student")

          if (data.user?.id) {
            localStorage.setItem("userId", data.user.id.toString())
          }
        }

        // Warning anzeigen falls Fallback-Modus
        if (data.warning) {
          setWarning(data.warning)
          // Kurz warten damit User die Warnung sehen kann
          setTimeout(() => {
            router.push("/dashboard")
          }, 2000)
        } else {
          router.push("/dashboard")
        }
      } else {
        console.error("❌ Login failed:", data.error)
        setError(data.error || "Login failed")
      }
    } catch (error) {
      console.error("💥 Login error:", error)

      // Benutzerfreundliche Fehlermeldung
      if (error.message.includes("fetch")) {
        setError("Network error. Please check your internet connection and try again.")
      } else if (error.message.includes("JSON")) {
        setError("Server error. Please try again later.")
      } else {
        setError(error.message || "An unexpected error occurred. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image
              src="/images/sales-academy-logo.png"
              alt="Sales Academy"
              width={60}
              height={60}
              className="h-12 w-12 drop-shadow-lg"
            />
            <span className="text-2xl font-bold text-slate-800 ml-2">Sales Academy</span>
          </Link>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-bold text-slate-800">🔐 Anmelden</CardTitle>
            <CardDescription className="text-slate-600 font-light">
              Geben Sie Ihre Anmeldedaten ein, um auf die Plattform zuzugreifen
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-slate-700 font-medium">
                  E-Mail-Adresse
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ihre.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 px-4 rounded-xl border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-slate-700 font-medium">
                  Passwort
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 px-4 rounded-xl border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                />
              </div>

              {error && (
                <Alert variant="destructive" className="rounded-xl">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {warning && (
                <Alert className="rounded-xl border-orange-200 bg-orange-50">
                  <AlertDescription className="text-orange-800">{warning}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? "Wird angemeldet..." : "🚀 Anmelden"}
              </Button>
            </form>

            <div className="mt-8 text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">oder</span>
                </div>
              </div>

              <Link href="/auth/register">
                <Button variant="outline" className="w-full h-12 rounded-xl bg-transparent">
                  📝 Neues Konto erstellen
                </Button>
              </Link>

              <Link href="/" className="text-sm text-slate-600 hover:text-slate-800 font-light transition-colors block">
                ← Zurück zur Startseite
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

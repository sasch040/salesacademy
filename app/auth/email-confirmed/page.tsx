"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function EmailConfirmedPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isConfirmed, setIsConfirmed] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Hier könnten wir den Bestätigungstoken aus der URL lesen
    const token = searchParams.get("token")
    const confirmedEmail = searchParams.get("email")

    if (token) {
      setIsConfirmed(true)
      if (confirmedEmail) {
        setEmail(confirmedEmail)
      }
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: email,
          password,
        }),
      })

      const data = await response.json()

      if (response.ok && data.user) {
        // Erfolgreiche Anmeldung - Session setzen
        localStorage.setItem("user", JSON.stringify(data.user))
        localStorage.setItem("jwt", data.jwt)

        // Event für andere Tabs senden
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "user",
            newValue: JSON.stringify(data.user),
          }),
        )

        // Weiterleitung zum Dashboard
        router.push("/dashboard")
      } else {
        setError(data.error || "Anmeldung fehlgeschlagen")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Anmeldung fehlgeschlagen")
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
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">✅ E-Mail bestätigt!</CardTitle>
            <CardDescription className="text-slate-600">
              Ihr Konto wurde erfolgreich aktiviert. Sie können sich jetzt anmelden.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <form onSubmit={handleLogin} className="space-y-6">
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

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wird angemeldet...
                  </>
                ) : (
                  "🚀 Jetzt anmelden"
                )}
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

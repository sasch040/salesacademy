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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      console.log("📡 Login response status:", response.status)
      console.log("📡 Login response headers:", response.headers.get("content-type"))

      // Check if response is JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.error("❌ Response is not JSON:", contentType)
        const textResponse = await response.text()
        console.error("❌ Response text:", textResponse.substring(0, 200))
        throw new Error("Server returned invalid response format")
      }

      const data = await response.json()
      console.log("📊 Login response data:", data)

      if (response.ok && data.success) {
        localStorage.setItem("userEmail", email)
        router.push("/dashboard")
      } else {
        setError(data.error || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      if (error.message.includes("JSON")) {
        setError("Server error: Invalid response format. Please try again or contact support.")
      } else if (error.message.includes("fetch")) {
        setError("Network error: Please check your internet connection and try again.")
      } else {
        setError("Login failed: " + (error.message || "Unknown error occurred"))
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
              src="/placeholder.svg?height=60&width=60&text=SA"
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
            <CardTitle className="text-3xl font-bold text-slate-800">Willkommen zurück</CardTitle>
            <CardDescription className="text-slate-600 font-light">
              Geben Sie Ihre E-Mail-Adresse ein, um auf die Plattform zuzugreifen
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

              {error && (
                <Alert variant="destructive" className="rounded-xl">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? "Wird angemeldet..." : "Anmelden"}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <Link href="/" className="text-sm text-slate-600 hover:text-slate-800 font-light transition-colors">
                ← Zurück zur Startseite
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

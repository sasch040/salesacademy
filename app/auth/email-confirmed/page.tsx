'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function EmailConfirmedPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmationStatus, setConfirmationStatus] = useState<'loading' | 'success' | 'error'>('loading')

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('confirmation') || searchParams.get('token') // Unterstützt beide Varianten

    if (!token) {
      setConfirmationStatus('error')
      return
    }

    const confirmEmail = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/email-confirmation?confirmation=${token}`,
          { method: 'GET' }
        )

        if (res.ok) {
          const data = await res.json()
          setIdentifier(data?.user?.email || '')
          setConfirmationStatus('success')
        } else {
          setConfirmationStatus('error')
        }
      } catch (err) {
        console.error('Fehler bei der E-Mail-Bestätigung:', err)
        setConfirmationStatus('error')
      }
    }

    confirmEmail()
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ identifier, password }),
      })

      const data = await response.json()

      if (response.ok && data.user) {
        router.push('/dashboard')
        window.dispatchEvent(new CustomEvent('auth-success'))
      } else {
        setError(data.error || 'Anmeldung fehlgeschlagen')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Anmeldung fehlgeschlagen')
    } finally {
      setIsLoading(false)
    }
  }

  if (confirmationStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (confirmationStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md shadow-lg p-6">
          <CardHeader>
            <CardTitle className="text-red-600">❌ Bestätigung fehlgeschlagen</CardTitle>
            <CardDescription>
              Der Bestätigungslink ist ungültig oder abgelaufen.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/auth/login">
              <Button variant="outline">Zur Anmeldung</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 hover:opacity-80">
            <Image
              src="/images/sales-academy-logo.png"
              alt="Sales Academy"
              width={60}
              height={60}
              className="h-12 w-12 drop-shadow-lg"
            />
            <span className="text-2xl font-bold text-slate-800">Sales Academy</span>
          </Link>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">✅ E-Mail bestätigt!</CardTitle>
            <CardDescription className="text-slate-600 font-light">
              Deine E-Mail-Adresse wurde erfolgreich bestätigt. Du kannst dich jetzt einloggen.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="identifier" className="text-slate-700 font-medium">
                  E-Mail-Adresse
                </Label>
                <Input
                  id="identifier"
                  type="email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-slate-700 font-medium">
                  Passwort
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Anmeldung läuft...
                  </>
                ) : (
                  '🚀 Jetzt anmelden'
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <Link href="/auth/login" className="text-sm text-slate-500 hover:text-slate-700">
                🔐 Zur normalen Anmeldung
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function EmailConfirmedPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // 1) Session beenden -> Login ist verbindlich
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {})

    // 2) Email vorbefüllen (aus Redirect oder localStorage)
    const emailParam = searchParams.get('email') || ''
    if (emailParam) setIdentifier(emailParam)
    else {
      const pending = typeof window !== 'undefined' ? localStorage.getItem('pendingEmail') : ''
      if (pending) setIdentifier(pending)
      localStorage.removeItem('pendingEmail')
    }

    // 3) Wenn Strapi uns mit Fehler weitergeleitet hat
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setStatus('error')
      return
    }

    // 4) Normalfall (Variante A): Strapi hat bereits bestätigt
    setStatus('success')
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
        body: JSON.stringify({ email: identifier, password }),
      })
      const data = await response.json()
      if (response.ok && data.user) {
        router.push('/dashboard')
        window.dispatchEvent(new CustomEvent('auth-success'))
      } else {
        setError(data.error || 'Anmeldung fehlgeschlagen')
      }
    } catch {
      setError('Anmeldung fehlgeschlagen')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-6">
        <Card className="w-full max-w-md bg-white/80 border-0 shadow-2xl">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-slate-600">E-Mail-Bestätigung wird verarbeitet…</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <Card className="w-full max-w-md shadow-2xl p-6">
          <CardHeader>
            <CardTitle className="text-red-600">❌ Bestätigung fehlgeschlagen</CardTitle>
            <CardDescription className="text-slate-600">
              Der Bestätigungslink ist ungültig oder abgelaufen.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
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
          <Link href="/" className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image src="/images/sales-academy-logo.png" alt="Sales Academy" width={60} height={60} className="h-12 w-12 drop-shadow-lg" />
            <span className="text-2xl font-bold text-slate-800 ml-2">Sales Academy</span>
          </Link>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">✅ E-Mail bestätigt!</CardTitle>
            <CardDescription className="text-slate-600 font-light">
              Deine E-Mail-Adresse wurde erfolgreich bestätigt. Bitte melde dich jetzt an.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="identifier" className="text-slate-700 font-medium">E-Mail-Adresse</Label>
                <Input id="identifier" type="email" placeholder="ihre.email@example.com"
                  value={identifier} onChange={(e) => setIdentifier(e.target.value)} required disabled={isLoading} />
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-slate-700 font-medium">Passwort</Label>
                <Input id="password" type="password" placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
              </div>

              {error && (
                <Alert variant="destructive" className="rounded-xl">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full h-12" disabled={isLoading}>
                {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Wird angemeldet…</>) : ('🔐 Jetzt einloggen')}
              </Button>
            </form>

            <div className="mt-8 text-center space-y-4">
              <Link href="/auth/forgot-password" className="text-sm text-slate-600 hover:text-slate-800 font-light transition-colors">
                Passwort vergessen?
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

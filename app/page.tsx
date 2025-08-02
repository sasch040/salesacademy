"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Play, Users, Award, BookOpen } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="backdrop-blur-sm bg-white/80 border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Image
                src="/placeholder.svg?height=40&width=40&text=SA"
                alt="Sales Academy"
                width={40}
                height={40}
                className="h-10 w-10 drop-shadow-lg"
                onError={(e) => {
                  console.error("❌ Sales Academy logo failed to load from:", e.currentTarget.src)
                  e.currentTarget.src = "/placeholder.svg?height=40&width=40&text=SA"
                }}
              />
              <span className="text-lg font-bold text-slate-800">Sales Academy</span>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button
                  variant="outline"
                  className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-800 bg-transparent"
                >
                  Anmelden
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white shadow-lg">
                  Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center">
            <div className="mb-8">
              <Image
                src="/placeholder.svg?height=40&width=40&text=SA"
                alt="Sales Academy"
                width={120}
                height={120}
                className="mx-auto drop-shadow-2xl"
                onError={(e) => {
                  console.error("❌ Hero logo failed to load from:", e.currentTarget.src)
                  e.currentTarget.src = "/placeholder.svg?height=120&width=120&text=Sales+Academy"
                }}
              />
            </div>
            <h1 className="text-6xl font-bold text-slate-800 mb-6 leading-tight">
              Willkommen bei der
              <span className="block bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Sales Academy
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
              Erweitern Sie Ihre Fähigkeiten mit unseren umfassenden Produktschulungen und Vertriebsmaterialien. Lernen
              Sie in Ihrem eigenen Tempo und werden Sie zum Experten.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-200"
                >
                  Jetzt starten
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/sales-materials">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-800 px-8 py-4 text-lg bg-transparent"
                >
                  Materialien ansehen
                  <BookOpen className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-slate-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-slate-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-slate-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Warum Sales Academy?</h2>
            <p className="text-xl text-slate-600 font-light max-w-2xl mx-auto">
              Entdecken Sie die Vorteile unserer modernen Lernplattform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white/70 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Interaktive Kurse</h3>
                <p className="text-slate-600 font-light leading-relaxed">
                  Lernen Sie mit modernen, interaktiven Modulen und praktischen Übungen, die Sie Schritt für Schritt zum
                  Experten machen.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white/70 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Expertenwissen</h3>
                <p className="text-slate-600 font-light leading-relaxed">
                  Profitieren Sie von jahrelanger Erfahrung und bewährten Strategien unserer Branchenexperten.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white/70 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Zertifizierung</h3>
                <p className="text-slate-600 font-light leading-relaxed">
                  Erhalten Sie anerkannte Zertifikate nach erfolgreichem Abschluss Ihrer Kurse und Prüfungen.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-0 shadow-2xl">
            <CardContent className="p-12">
              <h2 className="text-4xl font-bold text-white mb-6">Bereit für den nächsten Schritt?</h2>
              <p className="text-slate-300 text-xl mb-8 font-light max-w-2xl mx-auto">
                Starten Sie noch heute Ihre Lernreise und werden Sie zum Produktexperten. Melden Sie sich an und
                erhalten Sie sofortigen Zugang zu allen Kursen.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white/20 text-white hover:bg-white hover:text-slate-800 bg-transparent px-8 py-4 text-lg transition-all duration-200 backdrop-blur-sm"
                  >
                    Kostenlos anmelden
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/sales-materials">
                  <Button size="lg" variant="ghost" className="text-white hover:bg-white/10 px-8 py-4 text-lg">
                    Materialien entdecken
                    <Play className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <Image
                src="/placeholder.svg?height=40&width=40&text=SA"
                alt="Sales Academy"
                width={32}
                height={32}
                className="h-8 w-8 drop-shadow-lg"
                onError={(e) => {
                  console.error("❌ Footer logo failed to load from:", e.currentTarget.src)
                  e.currentTarget.src = "/placeholder.svg?height=32&width=32&text=SA"
                }}
              />
              <span className="text-lg font-bold">Sales Academy</span>
            </div>
            <div className="text-slate-400 text-sm">© 2024 Sales Academy. Alle Rechte vorbehalten.</div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}

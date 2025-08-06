"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Play, Users, Award, BookOpen } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center">
            <div className="mb-8">
              <Image
                src="/images/sales-academy-logo.png"
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
              <Link href="/auth/login">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-200"
                >
                  Jetzt starten
                  <ArrowRight className="ml-2 h-5 w-5" />
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

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <Image
                src="/images/sales-academy-logo.png"
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

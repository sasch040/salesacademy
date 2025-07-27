"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { User, LogOut, ArrowRight, Play } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState("")
  const router = useRouter()

  useEffect(() => {
    const email = localStorage.getItem("userEmail")
    if (!email) {
      router.push("/login")
    } else {
      setUserEmail(email)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("userEmail")
    router.push("/")
  }

  const products = [
    {
      id: "smart-nexus",
      name: "Smart Nexus",
      logo: "/images/smart-nexus-clean.png",
      description: "Videokurs und Tests",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      id: "smart-lens",
      name: "Smart Lens",
      logo: "/images/smart-lens-clean.png",
      description: "Videokurs und Tests",
      gradient: "from-slate-700 to-slate-800",
    },
    {
      id: "hacktracks",
      name: "Hacktracks",
      logo: "/images/hacktracks-clean.png",
      description: "Videokurs und Tests",
      gradient: "from-slate-800 to-slate-900",
    },
  ]

  if (!userEmail) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="backdrop-blur-sm bg-white/80 border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Image
                src="/images/sales-academy-new-logo.png"
                alt="Sales Academy"
                width={32}
                height={32}
                className="h-8 w-8 drop-shadow-lg"
              />
              <span className="text-lg font-bold text-slate-800">Sales Academy</span>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 rounded-full">
                <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-slate-700">{userEmail}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100"
              >
                <LogOut className="h-4 w-4" />
                Abmelden
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold text-slate-800 mb-4">Willkommen zurück!</h2>
          <p className="text-xl text-slate-600 font-light">
            Setzen Sie Ihre Lernreise fort und erweitern Sie Ihre Fähigkeiten
          </p>
        </div>

        {/* Products Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {products.map((product) => (
            <Card
              key={product.id}
              className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white/70 backdrop-blur-sm"
            >
              <CardContent className="p-8 text-center">
                <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Image
                    src={product.logo || "/placeholder.svg"}
                    alt={product.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-contain drop-shadow-lg group-hover:drop-shadow-xl transition-all duration-300"
                  />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">{product.name}</h3>
                <p className="text-slate-600 mb-8 font-light">{product.description}</p>
                <Link href={`/course/${product.id}`}>
                  <Button className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group-hover:scale-105">
                    Starten
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Continue Learning Section */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Weiter lernen</h2>
            <p className="text-slate-600 font-light">Setzen Sie dort fort, wo Sie aufgehört haben</p>
          </div>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-16 h-16 flex items-center justify-center">
                  <Image
                    src="/images/smart-nexus-clean.png"
                    alt="Smart Nexus"
                    width={64}
                    height={64}
                    className="w-full h-full object-contain drop-shadow-lg"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 mb-1">Smart Nexus Training</h3>
                  <p className="text-slate-600 font-light">Modul 4: Praktische Anwendung</p>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-slate-700">Kursfortschritt</span>
                  <span className="text-sm font-bold text-slate-800">60%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: "60%" }}
                  ></div>
                </div>
                <p className="text-sm text-slate-500 mt-2 font-light">3 von 5 Modulen abgeschlossen</p>
              </div>

              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center shadow-lg">
                    <Play className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="text-slate-800 font-semibold block">Nächster Schritt</span>
                    <span className="text-slate-600 text-sm font-light">Praktische Anwendung - 30 Min</span>
                  </div>
                </div>

                <Link href="/course/smart-nexus?module=4">
                  <Button className="bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                    Fortsetzen
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sales Material Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-0 shadow-2xl">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold text-white mb-4">Vertriebsmaterial</h2>
              <p className="text-slate-300 mb-8 text-lg font-light max-w-2xl mx-auto">
                Entdecken Sie unsere umfassende Sammlung von Vertriebsunterlagen und Marketing-Materialien
              </p>
              <Button
                variant="outline"
                className="border-2 border-white/20 text-white hover:bg-white hover:text-slate-800 bg-transparent px-8 py-3 rounded-xl transition-all duration-200 backdrop-blur-sm"
              >
                Materialien anzeigen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

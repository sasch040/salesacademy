import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="backdrop-blur-sm bg-white/80 border-b border-slate-200/60 sticky top-0 z-50"></header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="text-center max-w-5xl mx-auto">
          {/* Hero Logo and Title */}
          <div className="mb-12 flex justify-center items-center gap-8">
            <div className="relative">
              <Image
                src="/images/hero-logo-hd.png"
                alt="Sales Academy Logo"
                width={160}
                height={160}
                className="w-32 h-32 md:w-40 md:h-40 drop-shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-purple-600/20 rounded-full blur-3xl -z-10"></div>
            </div>

            <div className="text-left">
              <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent leading-tight">
                Sales
              </div>
              <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent leading-tight">
                Academy
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-purple-700 mx-auto rounded-full mb-8"></div>
          </div>

          <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            {"Lernen, verstehen, verkaufen"}
          </p>

          <Link href="/login">
            <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-12 py-4 text-xl rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
              Jetzt starten
            </Button>
          </Link>

          {/* Features Section */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Image
                  src="/images/smart-nexus-clean.png"
                  alt="Smart Nexus"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain drop-shadow-lg"
                />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Smart Nexus</h3>
              <p className="text-slate-600 font-light">ERP &amp; CRM </p>
            </div>

            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Image
                  src="/images/smart-lens-clean.png"
                  alt="Smart Lens"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain drop-shadow-lg"
                />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Smart Lens</h3>
              <p className="text-slate-600 font-light">Website Sicherheit </p>
            </div>

            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Image
                  src="/images/hacktracks-clean.png"
                  alt="Hacktracks"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain drop-shadow-lg"
                />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">HacksTracks</h3>
              <p className="text-slate-600 font-light">{"Daten-Leak Melder"}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

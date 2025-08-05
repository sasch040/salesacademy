import { Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-6">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
          <p className="text-slate-600">Wird geladen...</p>
        </CardContent>
      </Card>
    </div>
  )
}

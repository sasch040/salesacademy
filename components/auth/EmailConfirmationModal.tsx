"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Mail, CheckCircle } from "lucide-react"

interface EmailConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  email: string
}

export function EmailConfirmationModal({ isOpen, onClose, email }: EmailConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <DialogTitle className="text-xl font-semibold">E-Mail-Bestätigung erforderlich</DialogTitle>
          <DialogDescription className="text-center">
            Wir haben eine Bestätigungs-E-Mail an
            <br />
            <span className="font-medium text-slate-900">{email}</span>
            <br />
            gesendet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-slate-50 p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-slate-700">
                <p className="font-medium mb-1">Nächste Schritte:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Überprüfen Sie Ihr E-Mail-Postfach</li>
                  <li>Klicken Sie auf den Bestätigungslink</li>
                  <li>Melden Sie sich anschließend an</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 text-center">
            Keine E-Mail erhalten? Überprüfen Sie auch Ihren Spam-Ordner.
          </div>

          <Button onClick={onClose} className="w-full">
            Verstanden
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

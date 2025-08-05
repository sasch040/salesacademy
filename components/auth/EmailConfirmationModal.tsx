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
          <DialogDescription className="text-center space-y-2">
            <p>Wir haben eine Bestätigungs-E-Mail an</p>
            <p className="font-semibold text-slate-900">{email}</p>
            <p>gesendet. Bitte klicken Sie auf den Link in der E-Mail, um Ihr Konto zu aktivieren.</p>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Wichtiger Hinweis:</p>
                <p>Überprüfen Sie auch Ihren Spam-Ordner, falls Sie keine E-Mail erhalten haben.</p>
              </div>
            </div>
          </div>

          <Button onClick={onClose} className="w-full bg-transparent" variant="outline">
            Verstanden
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

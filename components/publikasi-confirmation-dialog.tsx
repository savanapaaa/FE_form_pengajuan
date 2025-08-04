"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle, CheckCircle, Globe, Info, XCircle } from "lucide-react"
import { motion } from "framer-motion"
import { Textarea } from "./ui/textarea"
import { Label } from "./ui/label"

interface PublikasiConfirmationDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: (keterangan: string) => void
  onCancel?: () => void
  variant?: "danger" | "warning" | "info" | "success"
  isLoading?: boolean
  requireKeterangan?: boolean
}

export function PublikasiConfirmationDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  onConfirm,
  onCancel,
  variant = "warning",
  isLoading = false,
  requireKeterangan = false,
}: PublikasiConfirmationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [keterangan, setKeterangan] = useState("")

  const handleConfirm = async () => {
    if (requireKeterangan && !keterangan.trim()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onConfirm(keterangan)
    } finally {
      setIsSubmitting(false)
      onOpenChange(false)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
    onOpenChange(false)
  }

  const getIcon = () => {
    switch (variant) {
      case "danger":
        return <XCircle className="h-12 w-12 text-white" />
      case "warning":
        return <AlertTriangle className="h-12 w-12 text-white" />
      case "success":
        return <CheckCircle className="h-12 w-12 text-white" />
      case "info":
      default:
        return <Info className="h-12 w-12 text-white" />
    }
  }

  const getGradient = () => {
    switch (variant) {
      case "danger":
        return "from-red-500 to-rose-500"
      case "warning":
        return "from-amber-500 to-orange-500"
      case "success":
        return "from-green-500 to-emerald-500"
      case "info":
      default:
        return "from-blue-500 to-indigo-500"
    }
  }

  const getButtonColor = () => {
    switch (variant) {
      case "danger":
        return "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
      case "warning":
        return "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
      case "success":
        return "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
      case "info":
      default:
        return "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
    }
  }

  const getBackgroundGradient = () => {
    switch (variant) {
      case "danger":
        return "from-red-50 via-white to-rose-50"
      case "warning":
        return "from-amber-50 via-white to-orange-50"
      case "success":
        return "from-green-50 via-white to-emerald-50"
      case "info":
      default:
        return "from-blue-50 via-white to-indigo-50"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-md bg-gradient-to-br ${getBackgroundGradient()} border-0 shadow-2xl`}>
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-6"
        >
          <div className={`mx-auto mb-6 p-4 bg-gradient-to-r ${getGradient()} rounded-full shadow-lg`}>
            <Globe className="h-12 w-12 text-white" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">{title}</DialogTitle>
            <DialogDescription className="text-gray-600">{description}</DialogDescription>
          </DialogHeader>

          {requireKeterangan && (
            <div className="mt-6 text-left">
              <Label htmlFor="keterangan" className="text-gray-700 font-medium">
                Keterangan <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="keterangan"
                placeholder="Masukkan keterangan publikasi..."
                className="mt-2 min-h-[100px]"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
              />
              {requireKeterangan && !keterangan.trim() && (
                <p className="text-sm text-red-500 mt-1">Keterangan wajib diisi</p>
              )}
            </div>
          )}

          <DialogFooter className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={handleCancel} disabled={isSubmitting || isLoading}>
              {cancelLabel}
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={(requireKeterangan && !keterangan.trim()) || isSubmitting || isLoading}
              className={`${getButtonColor()} min-w-[100px]`}
            >
              {isSubmitting || isLoading ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Memproses...
                </>
              ) : (
                confirmLabel
              )}
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

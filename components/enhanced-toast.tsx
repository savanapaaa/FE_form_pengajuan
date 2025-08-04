"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Toast {
  id: string
  message: string
  type: "success" | "error" | "info" | "warning"
  duration?: number
}

interface EnhancedToastProps {
  toasts?: Toast[]
  onRemove?: (id: string) => void
  className?: string
}

const getToastIcon = (type: string) => {
  switch (type) {
    case "success":
      return <CheckCircle className="h-5 w-5 text-green-600" />
    case "error":
      return <AlertCircle className="h-5 w-5 text-red-600" />
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-yellow-600" />
    case "info":
    default:
      return <Info className="h-5 w-5 text-blue-600" />
  }
}

const getToastStyles = (type: string) => {
  switch (type) {
    case "success":
      return "bg-green-50 border-green-200 text-green-800"
    case "error":
      return "bg-red-50 border-red-200 text-red-800"
    case "warning":
      return "bg-yellow-50 border-yellow-200 text-yellow-800"
    case "info":
    default:
      return "bg-blue-50 border-blue-200 text-blue-800"
  }
}

export function EnhancedToast({ toasts = [], onRemove, className }: EnhancedToastProps) {
  const [visibleToasts, setVisibleToasts] = useState<Toast[]>([])

  useEffect(() => {
    if (toasts && Array.isArray(toasts)) {
      setVisibleToasts(toasts)
    }
  }, [toasts])

  const handleRemove = (id: string) => {
    setVisibleToasts((prev) => prev.filter((toast) => toast.id !== id))
    if (onRemove) {
      onRemove(id)
    }
  }

  useEffect(() => {
    visibleToasts.forEach((toast) => {
      if (toast.duration && toast.duration > 0) {
        const timer = setTimeout(() => {
          handleRemove(toast.id)
        }, toast.duration)

        return () => clearTimeout(timer)
      }
    })
  }, [visibleToasts])

  if (!visibleToasts || visibleToasts.length === 0) {
    return null
  }

  return (
    <div className={cn("fixed top-4 right-4 z-50 space-y-2", className)}>
      <AnimatePresence>
        {visibleToasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "flex items-center space-x-3 p-4 rounded-lg border shadow-lg max-w-md",
              getToastStyles(toast.type),
            )}
          >
            <div className="flex-shrink-0">{getToastIcon(toast.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => handleRemove(toast.id)}
              className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default EnhancedToast

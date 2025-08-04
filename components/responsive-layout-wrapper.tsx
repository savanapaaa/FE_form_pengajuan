"use client"

import type React from "react"

import { motion, AnimatePresence } from "framer-motion"
import { useResponsiveRedirect } from "@/hooks/use-responsive-redirect"
import { Smartphone, Monitor, Loader2 } from "lucide-react"

interface ResponsiveLayoutWrapperProps {
  children: React.ReactNode
}

export function ResponsiveLayoutWrapper({ children }: ResponsiveLayoutWrapperProps) {
  const { isMobile, isInitialized } = useResponsiveRedirect()

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg"
          >
            <Loader2 className="h-8 w-8 text-white" />
          </motion.div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-800">Menyesuaikan Tampilan</h2>
            <p className="text-gray-600 flex items-center justify-center space-x-2">
              <span>Mengoptimalkan untuk</span>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }}>
                {isMobile ? (
                  <Smartphone className="h-5 w-5 text-blue-500" />
                ) : (
                  <Monitor className="h-5 w-5 text-purple-500" />
                )}
              </motion.div>
              <span>{isMobile ? "Mobile" : "Desktop"}</span>
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isMobile ? "mobile" : "desktop"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

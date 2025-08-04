"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, Shield, Zap, Globe } from "lucide-react"

interface DiskominfoSplashScreenProps {
  onComplete: () => void
}

export function DiskominfoSplashScreen({ onComplete }: DiskominfoSplashScreenProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  const steps = [
    { icon: FileText, text: "Memuat Layanan", color: "text-blue-600" },
    { icon: Shield, text: "Mengamankan Koneksi", color: "text-green-600" },
    { icon: Zap, text: "Optimasi Performa", color: "text-yellow-600" },
    { icon: Globe, text: "Siap Digunakan", color: "text-purple-600" },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1
        } else {
          setIsComplete(true)
          setTimeout(() => {
            onComplete()
          }, 1000)
          return prev
        }
      })
    }, 800)

    return () => clearInterval(timer)
  }, [onComplete, steps.length])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center z-50"
      >
        <div className="text-center text-white">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="mb-8"
          >
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <FileText className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Layanan Publik</h1>
            <p className="text-xl text-blue-100">Dinas Komunikasi dan Informatika</p>
          </motion.div>

          <div className="space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -50 }}
                animate={{
                  opacity: index <= currentStep ? 1 : 0.3,
                  x: 0,
                  scale: index === currentStep ? 1.05 : 1,
                }}
                transition={{ delay: index * 0.2 }}
                className="flex items-center justify-center space-x-4"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    index <= currentStep ? "bg-white/20" : "bg-white/10"
                  } backdrop-blur-sm`}
                >
                  <step.icon className={`h-6 w-6 ${index <= currentStep ? "text-white" : "text-white/50"}`} />
                </div>
                <span className={`text-lg ${index <= currentStep ? "text-white" : "text-white/50"}`}>{step.text}</span>
                {index <= currentStep && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 bg-green-400 rounded-full"
                  />
                )}
              </motion.div>
            ))}
          </div>

          {isComplete && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
              <div className="text-green-400 text-lg font-semibold">✓ Sistem Siap</div>
            </motion.div>
          )}

          <motion.div
            className="mt-8 w-64 h-1 bg-white/20 rounded-full mx-auto overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: "16rem" }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

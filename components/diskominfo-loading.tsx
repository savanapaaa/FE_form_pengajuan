"use client"

import { motion } from "framer-motion"
import { Building2, Wifi, Globe, Shield, Users } from "lucide-react"

interface DiskomInfoLoadingProps {
  message?: string
  showProgress?: boolean
}

export default function DiskomInfoLoading({ message = "Memuat...", showProgress = true }: DiskomInfoLoadingProps) {
  const floatingIcons = [
    { icon: Wifi, color: "text-blue-400", delay: 0 },
    { icon: Globe, color: "text-green-400", delay: 0.2 },
    { icon: Shield, color: "text-purple-400", delay: 0.4 },
    { icon: Users, color: "text-orange-400", delay: 0.6 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center space-y-8 px-6 relative z-10"
      >
        {/* Main Logo Container */}
        <motion.div
          className="relative mx-auto"
          initial={{ y: -30 }}
          animate={{ y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Central Logo */}
          <motion.div
            className="w-32 h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl mx-auto relative"
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <Building2 className="h-16 w-16 text-white" />

            {/* Glow Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl"
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          {/* Floating Icons */}
          {floatingIcons.map((item, index) => {
            const angle = index * 90 - 45 // Distribute around the circle
            const radius = 80
            const x = Math.cos((angle * Math.PI) / 180) * radius
            const y = Math.sin((angle * Math.PI) / 180) * radius

            return (
              <motion.div
                key={index}
                className={`absolute w-12 h-12 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/20`}
                style={{
                  left: `calc(50% + ${x}px - 24px)`,
                  top: `calc(50% + ${y}px - 24px)`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  rotate: [0, 360],
                  y: [0, -10, 0],
                }}
                transition={{
                  opacity: { delay: 0.5 + item.delay, duration: 0.5 },
                  scale: { delay: 0.5 + item.delay, duration: 0.5 },
                  rotate: {
                    duration: 8,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                    delay: item.delay,
                  },
                  y: {
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: item.delay,
                  },
                }}
              >
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </motion.div>
            )
          })}
        </motion.div>

        {/* Brand Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="space-y-2"
        >
          <motion.h1
            className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            DISKOMINFO
          </motion.h1>
          <p className="text-gray-600 font-medium">Dinas Komunikasi dan Informatika</p>
        </motion.div>

        {/* Loading Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="space-y-4"
        >
          <p className="text-gray-700 font-medium">{message}</p>

          {showProgress && (
            <>
              {/* Progress Bar */}
              <div className="w-64 h-2 bg-white/30 rounded-full mx-auto overflow-hidden backdrop-blur-sm border border-white/20">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
              </div>

              {/* Loading Dots */}
              <div className="flex justify-center space-x-2">
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: index * 0.2,
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </motion.div>

        {/* Version Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="text-xs text-gray-500"
        >
          Platform Layanan Publik v2.0
        </motion.div>
      </motion.div>
    </div>
  )
}

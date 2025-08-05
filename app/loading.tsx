"use client"

import { motion } from "framer-motion"
import { Shield, Lock, Key, Eye, Fingerprint } from "lucide-react"

export default function AdminLoginLoading() {
  const securityIcons = [Lock, Key, Eye, Fingerprint]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center relative overflow-hidden">
      {/* Security Pattern Background */}
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-center space-y-8 relative z-10"
      >
        {/* Security Shield */}
        <motion.div
          className="relative mx-auto w-32 h-32"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          {/* Outer Ring */}
          <motion.div
            className="absolute inset-0 border-4 border-blue-300 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />

          {/* Inner Shield */}
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl"
            animate={{
              scale: [1, 1.1, 1],
              boxShadow: [
                "0 10px 30px rgba(59, 130, 246, 0.3)",
                "0 20px 40px rgba(59, 130, 246, 0.5)",
                "0 10px 30px rgba(59, 130, 246, 0.3)",
              ],
            }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            <Shield className="h-10 w-10 text-white" />
          </motion.div>

          {/* Floating Security Icons */}
          {securityIcons.map((Icon, index) => {
            const angle = index * 90
            const radius = 50
            const x = Math.cos((angle * Math.PI) / 180) * radius
            const y = Math.sin((angle * Math.PI) / 180) * radius

            return (
              <motion.div
                key={index}
                className="absolute w-8 h-8 bg-white rounded-lg shadow-lg flex items-center justify-center"
                style={{
                  left: `calc(50% + ${x}px - 16px)`,
                  top: `calc(50% + ${y}px - 16px)`,
                }}
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 360],
                }}
                transition={{
                  y: { duration: 2, repeat: Number.POSITIVE_INFINITY, delay: index * 0.2 },
                  rotate: { duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                }}
              >
                <Icon className="h-4 w-4 text-blue-600" />
              </motion.div>
            )
          })}
        </motion.div>

        {/* Loading Text */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="space-y-4">
          <motion.h2
            className="text-2xl font-bold text-gray-800"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            Sistem Keamanan
          </motion.h2>
          <p className="text-gray-600">Memverifikasi akses admin...</p>

          {/* Security Steps */}
          <div className="space-y-2 max-w-sm mx-auto">
            {["Enkripsi SSL", "Verifikasi Token", "Validasi Akses"].map((step, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-between p-2 bg-white/50 rounded-lg backdrop-blur-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + index * 0.2 }}
              >
                <span className="text-sm text-gray-700">{step}</span>
                <motion.div
                  className="w-2 h-2 bg-green-500 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: index * 0.3,
                  }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

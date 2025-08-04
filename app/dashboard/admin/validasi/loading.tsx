"use client"

import { motion } from "framer-motion"
import { Shield, CheckCircle2, Target } from "lucide-react"

export default function ValidasiLoading() {
  const validationSteps = [
    { icon: Shield, label: "Keamanan", color: "from-blue-500 to-blue-600" },
    { icon: CheckCircle2, label: "Validasi", color: "from-green-500 to-green-600" },
    { icon: Target, label: "Akurasi", color: "from-purple-500 to-purple-600" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-100 flex items-center justify-center relative overflow-hidden">
      {/* Validation Pattern Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-6 gap-4 h-full">
          {Array.from({ length: 36 }).map((_, i) => (
            <motion.div
              key={i}
              className="bg-green-400 rounded-full"
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-8 relative z-10"
      >
        {/* Validation Circle */}
        <motion.div
          className="relative mx-auto w-40 h-40"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
        >
          {/* Outer Ring */}
          <motion.div
            className="absolute inset-0 border-4 border-green-300 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />

          {/* Middle Ring */}
          <motion.div
            className="absolute inset-4 border-3 border-blue-300 rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />

          {/* Center Validation Icon */}
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center shadow-2xl"
            animate={{
              scale: [1, 1.2, 1],
              boxShadow: [
                "0 10px 30px rgba(34, 197, 94, 0.3)",
                "0 20px 40px rgba(34, 197, 94, 0.5)",
                "0 10px 30px rgba(34, 197, 94, 0.3)",
              ],
            }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            <Shield className="h-10 w-10 text-white" />
          </motion.div>

          {/* Floating Validation Icons */}
          {validationSteps.map((step, index) => {
            const angle = index * 120
            const radius = 60
            const x = Math.cos((angle * Math.PI) / 180) * radius
            const y = Math.sin((angle * Math.PI) / 180) * radius

            return (
              <motion.div
                key={index}
                className={`absolute w-12 h-12 bg-gradient-to-r ${step.color} rounded-xl shadow-lg flex items-center justify-center`}
                style={{
                  left: `calc(50% + ${x}px - 24px)`,
                  top: `calc(50% + ${y}px - 24px)`,
                }}
                animate={{
                  y: [0, -15, 0],
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  y: { duration: 2, repeat: Number.POSITIVE_INFINITY, delay: index * 0.3 },
                  rotate: { duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                  scale: { duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: index * 0.2 },
                }}
              >
                <step.icon className="h-6 w-6 text-white" />
              </motion.div>
            )
          })}
        </motion.div>

        {/* Validation Steps */}
        <div className="flex justify-center space-x-6">
          {validationSteps.map((step, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + index * 0.2 }}
            >
              <motion.div
                className={`w-8 h-8 bg-gradient-to-r ${step.color} rounded-lg mx-auto mb-2 flex items-center justify-center`}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: index * 0.3,
                }}
              >
                <step.icon className="h-4 w-4 text-white" />
              </motion.div>
              <span className="text-xs font-semibold text-gray-700">{step.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Loading Text */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="space-y-4">
          <motion.h2
            className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            Validasi Output
          </motion.h2>
          <p className="text-gray-600">Memverifikasi dan memvalidasi data...</p>

          {/* Validation Progress */}
          <div className="space-y-2 max-w-xs mx-auto">
            {["Checking integrity", "Validating format", "Verifying content"].map((step, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-between p-2 bg-white/60 rounded-lg backdrop-blur-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.5 + index * 0.2 }}
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

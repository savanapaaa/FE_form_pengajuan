"use client"

import { motion } from "framer-motion"
import { Shield, BarChart3, Users, Settings, Database, Activity } from "lucide-react"

export default function AdminDashboardLoading() {
  const adminIcons = [
    { icon: Shield, color: "text-blue-600", bg: "bg-blue-100" },
    { icon: BarChart3, color: "text-green-600", bg: "bg-green-100" },
    { icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
    { icon: Settings, color: "text-orange-600", bg: "bg-orange-100" },
    { icon: Database, color: "text-indigo-600", bg: "bg-indigo-100" },
    { icon: Activity, color: "text-red-600", bg: "bg-red-100" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center relative overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="grid grid-cols-8 gap-4 h-full">
          {Array.from({ length: 64 }).map((_, i) => (
            <motion.div
              key={i}
              className="bg-gray-400 rounded"
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.05,
              }}
            />
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-8 relative z-10"
      >
        {/* Admin Icons Grid */}
        <div className="grid grid-cols-3 gap-4 w-48 mx-auto">
          {adminIcons.map((item, index) => (
            <motion.div
              key={index}
              className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center shadow-lg`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: index * 0.1,
                duration: 0.5,
                type: "spring",
                stiffness: 200,
              }}
              whileHover={{ scale: 1.1 }}
            >
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  rotate: { duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                  scale: { duration: 2, repeat: Number.POSITIVE_INFINITY, delay: index * 0.2 },
                }}
              >
                <item.icon className={`h-7 w-7 ${item.color}`} />
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Loading Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <motion.h2
            className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            Super Admin Dashboard
          </motion.h2>
          <p className="text-gray-600">Memuat panel administrasi...</p>

          {/* Loading Steps */}
          <div className="space-y-2 max-w-xs mx-auto">
            {["Verifikasi akses", "Memuat data", "Menyiapkan dashboard"].map((step, index) => (
              <motion.div
                key={index}
                className="flex items-center space-x-3 text-sm text-gray-600"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + index * 0.3 }}
              >
                <motion.div
                  className="w-2 h-2 bg-blue-500 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: index * 0.2,
                  }}
                />
                <span>{step}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

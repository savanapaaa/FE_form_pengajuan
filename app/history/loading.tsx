"use client"

import { motion } from "framer-motion"
import { History, Clock, FileText, Search } from "lucide-react"

export default function HistoryLoading() {
  const icons = [History, Clock, FileText, Search]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-blue-300 rounded-lg rotate-12"></div>
        <div className="absolute top-32 right-20 w-16 h-16 border-2 border-purple-300 rounded-full"></div>
        <div className="absolute bottom-20 left-32 w-24 h-24 border-2 border-indigo-300 rounded-lg -rotate-12"></div>
        <div className="absolute bottom-32 right-10 w-18 h-18 border-2 border-blue-300 rounded-full"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-8 relative z-10"
      >
        {/* Icon Animation */}
        <div className="relative w-32 h-32 mx-auto">
          {icons.map((Icon, index) => {
            const angle = index * 90 - 45
            const radius = 40
            const x = Math.cos((angle * Math.PI) / 180) * radius
            const y = Math.sin((angle * Math.PI) / 180) * radius

            return (
              <motion.div
                key={index}
                className="absolute w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center border border-gray-100"
                style={{
                  left: `calc(50% + ${x}px - 24px)`,
                  top: `calc(50% + ${y}px - 24px)`,
                }}
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: { duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                  scale: { duration: 2, repeat: Number.POSITIVE_INFINITY, delay: index * 0.2 },
                }}
              >
                <Icon className="h-6 w-6 text-blue-600" />
              </motion.div>
            )
          })}

          {/* Center Icon */}
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, -360],
            }}
            transition={{
              scale: { duration: 2, repeat: Number.POSITIVE_INFINITY },
              rotate: { duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
            }}
          >
            <History className="h-8 w-8 text-white" />
          </motion.div>
        </div>

        {/* Loading Text */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Memuat Riwayat</h2>
          <p className="text-gray-600">Mengambil data history...</p>

          {/* Progress Bar */}
          <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

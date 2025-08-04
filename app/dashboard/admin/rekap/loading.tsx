"use client"

import { motion } from "framer-motion"
import { BarChart3, PieChart, TrendingUp, Database, FileSpreadsheet } from "lucide-react"

export default function RekapLoading() {
  const chartIcons = [BarChart3, PieChart, TrendingUp, Database, FileSpreadsheet]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-100 flex items-center justify-center relative overflow-hidden">
      {/* Data Visualization Background */}
      <div className="absolute inset-0 opacity-10">
        {/* Animated Chart Bars */}
        <div className="absolute bottom-20 left-20 flex items-end space-x-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-4 bg-purple-400 rounded-t"
              style={{ height: `${Math.random() * 60 + 20}px` }}
              animate={{
                height: [
                  `${Math.random() * 60 + 20}px`,
                  `${Math.random() * 80 + 40}px`,
                  `${Math.random() * 60 + 20}px`,
                ],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>

        {/* Animated Pie Chart */}
        <div className="absolute top-20 right-20 w-16 h-16">
          <motion.div
            className="w-full h-full border-4 border-blue-400 rounded-full"
            style={{
              background: `conic-gradient(from 0deg, #3B82F6 0deg 120deg, #8B5CF6 120deg 240deg, #10B981 240deg 360deg)`,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-8 relative z-10"
      >
        {/* Chart Icons Grid */}
        <div className="grid grid-cols-3 gap-6 w-64 mx-auto">
          {chartIcons.slice(0, 5).map((Icon, index) => (
            <motion.div
              key={index}
              className={`w-16 h-16 bg-gradient-to-r ${
                index % 2 === 0 ? "from-purple-500 to-blue-500" : "from-blue-500 to-indigo-500"
              } rounded-2xl flex items-center justify-center shadow-lg ${
                index === 4 ? "col-span-3 w-20 h-20 mx-auto" : ""
              }`}
              initial={{ opacity: 0, scale: 0, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{
                delay: index * 0.15,
                duration: 0.6,
                type: "spring",
                stiffness: 200,
              }}
            >
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  rotate: { duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                  scale: { duration: 2, repeat: Number.POSITIVE_INFINITY, delay: index * 0.3 },
                }}
              >
                <Icon className={`${index === 4 ? "h-10 w-10" : "h-8 w-8"} text-white`} />
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Data Flow Animation */}
        <motion.div
          className="relative mx-auto w-32 h-32"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: "spring", stiffness: 150 }}
        >
          {/* Central Database */}
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl"
            animate={{
              scale: [1, 1.1, 1],
              boxShadow: [
                "0 10px 30px rgba(147, 51, 234, 0.3)",
                "0 20px 40px rgba(147, 51, 234, 0.5)",
                "0 10px 30px rgba(147, 51, 234, 0.3)",
              ],
            }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            <Database className="h-10 w-10 text-white" />
          </motion.div>

          {/* Data Points */}
          {Array.from({ length: 6 }).map((_, index) => {
            const angle = index * 60
            const radius = 50
            const x = Math.cos((angle * Math.PI) / 180) * radius
            const y = Math.sin((angle * Math.PI) / 180) * radius

            return (
              <motion.div
                key={index}
                className="absolute w-3 h-3 bg-white rounded-full shadow-lg"
                style={{
                  left: `calc(50% + ${x}px - 6px)`,
                  top: `calc(50% + ${y}px - 6px)`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: index * 0.3,
                }}
              />
            )
          })}
        </motion.div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="space-y-4"
        >
          <motion.h2
            className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            Rekap Data
          </motion.h2>
          <p className="text-gray-600">Menganalisis dan merekap data...</p>

          {/* Data Processing Steps */}
          <div className="space-y-2 max-w-sm mx-auto">
            {["Collecting data", "Processing analytics", "Generating reports"].map((step, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-between p-2 bg-white/60 rounded-lg backdrop-blur-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3 + index * 0.2 }}
              >
                <span className="text-sm text-gray-700">{step}</span>
                <motion.div
                  className="w-2 h-2 bg-purple-500 rounded-full"
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

          {/* Progress Visualization */}
          <div className="flex justify-center space-x-1">
            {Array.from({ length: 10 }).map((_, index) => (
              <motion.div
                key={index}
                className="w-1 h-8 bg-gradient-to-t from-purple-500 to-blue-500 rounded-full"
                animate={{
                  scaleY: [0.3, 1, 0.3],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: index * 0.1,
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

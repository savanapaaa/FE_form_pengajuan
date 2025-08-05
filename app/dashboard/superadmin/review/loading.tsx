"use client"

import { motion } from "framer-motion"
import { FileText, Eye, CheckCircle, Clock } from "lucide-react"

export default function ReviewLoading() {
  const reviewSteps = [
    { icon: FileText, label: "Dokumen", color: "text-blue-600" },
    { icon: Eye, label: "Review", color: "text-purple-600" },
    { icon: CheckCircle, label: "Approve", color: "text-green-600" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center relative overflow-hidden">
      {/* Document Flow Background */}
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-5 bg-blue-400 rounded-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
              rotate: [0, 5, -5, 0],
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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-8 relative z-10"
      >
        {/* Review Process Flow */}
        <div className="flex items-center justify-center space-x-8">
          {reviewSteps.map((step, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.3, duration: 0.6 }}
            >
              <motion.div
                className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center border-2 border-gray-100"
                animate={{
                  scale: [1, 1.1, 1],
                  borderColor: ["#f3f4f6", "#e5e7eb", "#f3f4f6"],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: index * 0.4,
                }}
              >
                <step.icon className={`h-8 w-8 ${step.color}`} />
              </motion.div>
              <span className="text-sm font-medium text-gray-700">{step.label}</span>

              {/* Connection Line */}
              {index < reviewSteps.length - 1 && (
                <motion.div
                  className="absolute w-8 h-0.5 bg-gray-300 rounded-full"
                  style={{
                    left: `calc(50% + ${(index - 1) * 8 + 4}rem)`,
                    top: "50%",
                  }}
                  animate={{ scaleX: [0, 1, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: index * 0.5,
                  }}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Central Review Icon */}
        <motion.div
          className="relative mx-auto w-24 h-24"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        >
          <motion.div
            className="w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl"
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
            <Eye className="h-12 w-12 text-white" />
          </motion.div>

          {/* Status Indicators */}
          <motion.div
            className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center"
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
            }}
          >
            <CheckCircle className="h-3 w-3 text-white" />
          </motion.div>

          <motion.div
            className="absolute -bottom-2 -left-2 w-5 h-5 bg-orange-400 rounded-full flex items-center justify-center"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Number.POSITIVE_INFINITY,
              delay: 0.5,
            }}
          >
            <Clock className="h-2.5 w-2.5 text-white" />
          </motion.div>
        </motion.div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-4"
        >
          <motion.h2
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            Review Dokumen
          </motion.h2>
          <p className="text-gray-600">Memuat sistem review...</p>

          {/* Progress Bar */}
          <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{
                duration: 3,
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

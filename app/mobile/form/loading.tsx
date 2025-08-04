"use client"

import { motion } from "framer-motion"
import { FileText, Camera, Upload, Send, CheckCircle } from "lucide-react"

export default function MobileFormLoading() {
  const formSteps = [
    { icon: FileText, label: "Form", color: "from-blue-500 to-blue-600" },
    { icon: Camera, label: "Photo", color: "from-green-500 to-green-600" },
    { icon: Upload, label: "Upload", color: "from-purple-500 to-purple-600" },
    { icon: Send, label: "Submit", color: "from-orange-500 to-orange-600" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center relative overflow-hidden">
      {/* Mobile Form Background */}
      <div className="absolute inset-0 opacity-10">
        {/* Form Fields Animation */}
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-64 h-3 bg-blue-400 rounded"
              animate={{
                scaleX: [0.3, 1, 0.3],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-8 relative z-10"
      >
        {/* Form Process Flow */}
        <div className="flex justify-center items-center space-x-4">
          {formSteps.map((step, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
            >
              <motion.div
                className={`w-14 h-14 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center shadow-lg`}
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: index * 0.3,
                }}
              >
                <step.icon className="h-7 w-7 text-white" />
              </motion.div>
              <span className="text-xs font-semibold text-gray-700">{step.label}</span>

              {/* Connection Arrow */}
              {index < formSteps.length - 1 && (
                <motion.div
                  className="absolute w-6 h-0.5 bg-gray-300 rounded-full"
                  style={{
                    left: `calc(50% + ${(index - 1.5) * 4.5 + 2.25}rem)`,
                    top: "50%",
                  }}
                  animate={{
                    scaleX: [0, 1, 0],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: index * 0.4,
                  }}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Mobile Form Preview */}
        <motion.div
          className="relative mx-auto"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          {/* Phone Frame */}
          <motion.div
            className="w-40 h-72 bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl p-3 shadow-2xl mx-auto"
            animate={{
              rotateY: [0, 5, -5, 0],
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            {/* Screen */}
            <div className="w-full h-full bg-white rounded-2xl relative overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-green-500 h-12 flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>

              {/* Form Fields */}
              <div className="p-4 space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <motion.div
                    key={index}
                    className="h-3 bg-gray-200 rounded"
                    animate={{
                      backgroundColor: ["#e5e7eb", "#d1d5db", "#e5e7eb"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: index * 0.2,
                    }}
                  />
                ))}

                {/* Submit Button */}
                <motion.div
                  className="h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center mt-6"
                  animate={{
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      "0 4px 15px rgba(59, 130, 246, 0.3)",
                      "0 6px 20px rgba(59, 130, 246, 0.5)",
                      "0 4px 15px rgba(59, 130, 246, 0.3)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                >
                  <Send className="h-4 w-4 text-white" />
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Success Indicator */}
          <motion.div
            className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
            animate={{
              scale: [0, 1.2, 1],
              rotate: [0, 360],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: 1,
            }}
          >
            <CheckCircle className="h-4 w-4 text-white" />
          </motion.div>
        </motion.div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="space-y-4"
        >
          <motion.h2
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            Mobile Form
          </motion.h2>
          <p className="text-gray-600">Menyiapkan formulir mobile...</p>

          {/* Progress Dots */}
          <div className="flex justify-center space-x-2">
            {[0, 1, 2, 3, 4].map((index) => (
              <motion.div
                key={index}
                className="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: index * 0.15,
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

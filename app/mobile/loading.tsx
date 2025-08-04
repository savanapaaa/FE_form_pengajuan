"use client"

import { motion } from "framer-motion"
import { Smartphone, Wifi, Battery, Signal } from "lucide-react"

export default function MobileLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center relative overflow-hidden">
      {/* Mobile Wave Background */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <motion.path
            d="M0,200 Q100,150 200,200 T400,200 L400,400 L0,400 Z"
            fill="url(#gradient1)"
            animate={{
              d: [
                "M0,200 Q100,150 200,200 T400,200 L400,400 L0,400 Z",
                "M0,200 Q100,250 200,200 T400,200 L400,400 L0,400 Z",
                "M0,200 Q100,150 200,200 T400,200 L400,400 L0,400 Z",
              ],
            }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-8 relative z-10"
      >
        {/* Mobile Device Animation */}
        <motion.div
          className="relative mx-auto"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Phone Frame */}
          <motion.div
            className="w-32 h-56 bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl p-2 shadow-2xl mx-auto"
            animate={{
              rotateY: [0, 10, -10, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            {/* Screen */}
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl relative overflow-hidden">
              {/* Status Bar */}
              <div className="flex justify-between items-center p-2 text-white text-xs">
                <div className="flex items-center space-x-1">
                  <Signal className="h-3 w-3" />
                  <Wifi className="h-3 w-3" />
                </div>
                <Battery className="h-3 w-3" />
              </div>

              {/* Loading Content */}
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <motion.div
                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <Smartphone className="h-4 w-4 text-blue-500" />
                </motion.div>

                {/* Loading Bars */}
                <div className="flex space-x-1">
                  {[0, 1, 2].map((index) => (
                    <motion.div
                      key={index}
                      className="w-1 h-6 bg-white rounded-full"
                      animate={{
                        scaleY: [0.3, 1, 0.3],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: index * 0.2,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Floating Elements */}
          <motion.div
            className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center"
            animate={{
              y: [-10, 10, -10],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <Wifi className="h-4 w-4 text-white" />
          </motion.div>

          <motion.div
            className="absolute -bottom-4 -left-4 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center"
            animate={{
              y: [10, -10, 10],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: 0.5,
            }}
          >
            <Signal className="h-3 w-3 text-white" />
          </motion.div>
        </motion.div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <motion.h2
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            Mobile App
          </motion.h2>
          <p className="text-gray-600">Optimizing for mobile experience...</p>

          {/* Progress Dots */}
          <div className="flex justify-center space-x-2">
            {[0, 1, 2, 3].map((index) => (
              <motion.div
                key={index}
                className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
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

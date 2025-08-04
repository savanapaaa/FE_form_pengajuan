"use client"

import { cn } from "@/lib/utils"
import { Loader2, FileText, CheckCircle, Upload, BarChart3 } from "lucide-react"
import { memo } from "react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "dots" | "pulse" | "bounce" | "spin"
  color?: "blue" | "green" | "orange" | "purple" | "gray"
  text?: string
  className?: string
}

const EnhancedLoadingSpinner = memo(function EnhancedLoadingSpinner({
  size = "md",
  variant = "default",
  color = "blue",
  text,
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  }

  const colorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    orange: "text-orange-600",
    purple: "text-purple-600",
    gray: "text-gray-600",
  }

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex items-center justify-center space-x-2", className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "rounded-full animate-bounce",
              size === "sm" && "w-2 h-2",
              size === "md" && "w-3 h-3",
              size === "lg" && "w-4 h-4",
              size === "xl" && "w-6 h-6",
              color === "blue" && "bg-blue-600",
              color === "green" && "bg-green-600",
              color === "orange" && "bg-orange-600",
              color === "purple" && "bg-purple-600",
              color === "gray" && "bg-gray-600",
            )}
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
        {text && <span className={cn("ml-3 font-medium", colorClasses[color], textSizeClasses[size])}>{text}</span>}
      </div>
    )
  }

  if (variant === "pulse") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div
          className={cn(
            "rounded-full animate-pulse",
            sizeClasses[size],
            color === "blue" && "bg-blue-600",
            color === "green" && "bg-green-600",
            color === "orange" && "bg-orange-600",
            color === "purple" && "bg-purple-600",
            color === "gray" && "bg-gray-600",
          )}
        />
        {text && <span className={cn("ml-3 font-medium", colorClasses[color], textSizeClasses[size])}>{text}</span>}
      </div>
    )
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Loader2 className={cn("animate-spin", sizeClasses[size], colorClasses[color])} />
      {text && <span className={cn("ml-3 font-medium", colorClasses[color], textSizeClasses[size])}>{text}</span>}
    </div>
  )
})

// Lightweight specialized loading components
export const PageLoadingSpinner = memo(function PageLoadingSpinner({ text = "Memuat halaman..." }: { text?: string }) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 items-center justify-center">
      <div className="text-center">
        <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4 inline-block">
          <FileText className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">{text}</h2>
        <EnhancedLoadingSpinner variant="dots" color="blue" className="justify-center" />
      </div>
    </div>
  )
})

export const FormLoadingSpinner = memo(function FormLoadingSpinner({ text = "Menyimpan data..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-6">
      <div className="text-center">
        <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-md mb-3 inline-block">
          <CheckCircle className="h-6 w-6 text-white" />
        </div>
        <p className="text-base font-medium text-gray-700 mb-2">{text}</p>
        <EnhancedLoadingSpinner variant="pulse" color="green" />
      </div>
    </div>
  )
})

export const UploadLoadingSpinner = memo(function UploadLoadingSpinner({
  progress,
  text = "Mengunggah file...",
}: { progress?: number; text?: string }) {
  return (
    <div className="flex items-center justify-center py-6">
      <div className="text-center">
        <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-md mb-3 inline-block">
          <Upload className="h-6 w-6 text-white" />
        </div>
        <p className="text-base font-medium text-gray-700 mb-2">{text}</p>
        {progress !== undefined && (
          <div className="w-48 bg-gray-200 rounded-full h-2 mb-3">
            <div
              className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        <EnhancedLoadingSpinner variant="dots" color="orange" />
      </div>
    </div>
  )
})

export const DataLoadingSpinner = memo(function DataLoadingSpinner({ text = "Memuat data..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="text-center">
        <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-md mb-3 inline-block">
          <BarChart3 className="h-6 w-6 text-white" />
        </div>
        <p className="text-base font-medium text-gray-700 mb-2">{text}</p>
        <EnhancedLoadingSpinner variant="dots" color="purple" />
      </div>
    </div>
  )
})

export { EnhancedLoadingSpinner }

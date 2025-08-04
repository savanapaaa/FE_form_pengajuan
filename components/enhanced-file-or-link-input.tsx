"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Upload,
  Link,
  Eye,
  X,
  FileText,
  ImageIcon,
  Video,
  Music,
  AlertTriangle,
  ExternalLink,
  Sparkles,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

// Enhanced FileData interface for better file handling and preview
interface FileDataForForm {
  name: string
  size: number
  type: string
  lastModified: number
  base64?: string // For preview and persistence
  url?: string // Blob URL for temporary preview
  preview?: string // Optimized preview URL
  thumbnailBase64?: string // Compressed thumbnail for lists
}

interface EnhancedFileOrLinkInputProps {
  id: string
  label: string
  value: File | FileDataForForm | string | null
  onChange: (newValue: File | string | null) => void
  accept?: string
  placeholder?: string
  manualText?: string
  onManualTextChange?: (text: string) => void
  fileId?: string
  onFileIdChange?: (id: string) => void
  className?: string
  required?: boolean
}

// Enhanced file processing functions
const createThumbnail = async (file: File, maxWidth = 200, maxHeight = 200, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      resolve("") // Return empty string for non-images
      return
    }

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }

      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height)
      const thumbnailDataUrl = canvas.toDataURL("image/jpeg", quality)
      resolve(thumbnailDataUrl)
    }

    img.onerror = () => reject(new Error("Failed to create thumbnail"))
    img.src = URL.createObjectURL(file)
  })
}

const createFileDataForPreview = async (file: File): Promise<FileDataForForm> => {
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })

  // Create thumbnail for images
  let thumbnailBase64 = ""
  try {
    if (file.type.startsWith("image/")) {
      thumbnailBase64 = await createThumbnail(file)
    }
  } catch (error) {
    console.warn("Failed to create thumbnail:", error)
  }

  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    base64: base64,
    url: base64,
    preview: base64,
    thumbnailBase64: thumbnailBase64 || base64,
  }
}

// Enhanced file type detection
const getFileIcon = (file: any) => {
  if (!file) return FileText

  const fileType =
    typeof file === "string"
      ? file.split(".").pop()?.toLowerCase()
      : file.type?.split("/")[0] || file.name?.split(".").pop()?.toLowerCase()

  switch (fileType) {
    case "pdf":
      return FileText
    case "image":
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
      return ImageIcon
    case "video":
    case "mp4":
    case "avi":
    case "mov":
    case "wmv":
      return Video
    case "audio":
    case "mp3":
    case "wav":
    case "ogg":
    case "m4a":
      return Music
    case "doc":
    case "docx":
      return FileText
    default:
      return FileText
  }
}

const isImageFile = (file: any): boolean => {
  if (!file) return false

  const imageTypes = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"]

  if (typeof file === "string") {
    const ext = file.split(".").pop()?.toLowerCase()
    return imageTypes.includes(ext || "")
  }

  if (file.type) {
    return file.type.startsWith("image/")
  }

  if (file.name) {
    const ext = file.name.split(".").pop()?.toLowerCase()
    return imageTypes.includes(ext || "")
  }

  return false
}

const getPreviewUrl = (file: any): string | null => {
  if (!file) return null

  try {
    // Handle string URLs
    if (typeof file === "string") {
      if (file.startsWith("http://") || file.startsWith("https://") || file.startsWith("data:")) {
        return file
      }
      return null
    }

    // Handle File/Blob objects
    if (file instanceof File || file instanceof Blob) {
      return URL.createObjectURL(file)
    }

    // Handle file objects with properties
    if (typeof file === "object") {
      // Priority: preview > base64 > url
      if (file.preview && typeof file.preview === "string") {
        return file.preview
      }

      if (file.base64 && typeof file.base64 === "string") {
        return file.base64
      }

      if (file.url && typeof file.url === "string") {
        return file.url
      }
    }

    return null
  } catch (error) {
    console.error("Error getting preview URL:", error)
    return null
  }
}

// Helper function to format file size
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export const EnhancedFileOrLinkInput: React.FC<EnhancedFileOrLinkInputProps> = ({
  id,
  label,
  value,
  onChange,
  accept,
  placeholder = "Masukkan URL atau pilih file",
  manualText = "",
  onManualTextChange,
  fileId = "",
  onFileIdChange,
  className = "",
  required = false,
}) => {
  const [mode, setMode] = useState<"upload" | "link">("upload")
  const [currentLink, setCurrentLink] = useState<string>(typeof value === "string" ? value : "")
  const [isUploading, setIsUploading] = useState(false)
  const [linkError, setLinkError] = useState<string>("")
  const [previewUrl, setPreviewUrl] = useState<string>("")

  // Update preview URL when value changes
  useEffect(() => {
    const url = getPreviewUrl(value)
    setPreviewUrl(url || "")

    // Cleanup blob URLs
    return () => {
      if (url && url.startsWith("blob:")) {
        URL.revokeObjectURL(url)
      }
    }
  }, [value])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      setIsUploading(true)

      try {
        // Create enhanced file data with preview
        const fileDataForPreview = await createFileDataForPreview(file)

        // Simulate upload progress
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setIsUploading(false)
        onChange(file) // Pass the raw File object to parent
      } catch (error) {
        console.error("Error processing file:", error)
        setIsUploading(false)
        onChange(file) // Fallback to raw file
      }
    } else {
      onChange(null)
    }
  }

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const link = e.target.value
    setCurrentLink(link)

    // Validate URL
    if (link && !isValidUrl(link)) {
      setLinkError("Format URL tidak valid. Contoh: https://example.com")
    } else {
      setLinkError("")
    }

    onChange(link)
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const getDisplayName = () => {
    if (!value) return "Tidak ada file"
    if (typeof value === "string") return value.length > 30 ? value.substring(0, 30) + "..." : value
    return value.name
  }

  const FileIcon = getFileIcon(value)

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={cn("space-y-4", className)}>
      <Label className="text-sm font-semibold text-gray-800 flex items-center">
        <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {/* File ID Input */}
      {onFileIdChange && (
        <div className="space-y-2">
          <Label className="text-xs text-gray-600">ID File</Label>
          <Input
            value={fileId}
            onChange={(e) => onFileIdChange(e.target.value)}
            placeholder="Masukkan ID file (opsional)"
            className="border-gray-200 focus:border-indigo-500 text-sm bg-white/70 backdrop-blur-sm"
          />
        </div>
      )}

      {/* Enhanced Mode Toggle */}
      <div className="relative">
        <div className="flex rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 p-1.5 shadow-inner">
          <motion.button
            type="button"
            onClick={() => setMode("upload")}
            className={cn(
              "flex-1 py-3 px-4 text-sm font-semibold rounded-lg transition-all duration-300 relative overflow-hidden",
              mode === "upload"
                ? "bg-white text-blue-600 shadow-lg shadow-blue-100/50"
                : "text-gray-600 hover:text-gray-800",
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {mode === "upload" && (
              <motion.div
                layoutId={`activeTab-${id}`}
                className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-10 rounded-lg"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <div className="relative flex flex-col items-center space-y-1">
              <Upload className="h-5 w-5" />
              <span>Upload File</span>
            </div>
          </motion.button>

          <motion.button
            type="button"
            onClick={() => setMode("link")}
            className={cn(
              "flex-1 py-3 px-4 text-sm font-semibold rounded-lg transition-all duration-300 relative overflow-hidden",
              mode === "link"
                ? "bg-white text-blue-600 shadow-lg shadow-blue-100/50"
                : "text-gray-600 hover:text-gray-800",
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {mode === "link" && (
              <motion.div
                layoutId={`activeTab-${id}`}
                className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-10 rounded-lg"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <div className="relative flex flex-col items-center space-y-1">
              <Link className="h-5 w-5" />
              <span>Link URL</span>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Enhanced Content */}
      <AnimatePresence mode="wait">
        {mode === "upload" ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <input
              type="file"
              id={id}
              accept={accept}
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />

            {value && typeof value !== "string" ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-3">
                {/* File Info Card */}
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-md">
                        <FileIcon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-green-800 truncate">{getDisplayName()}</p>
                        <p className="text-xs text-green-600">File berhasil dipilih</p>
                        {value && typeof value === "object" && "size" in value && (
                          <p className="text-xs text-green-600">{formatFileSize(value.size)}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {previewUrl && (
                        <motion.button
                          type="button"
                          onClick={() => window.open(previewUrl, "_blank")}
                          className="w-8 h-8 bg-blue-100 hover:bg-blue-200 rounded-lg flex items-center justify-center text-blue-600 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Preview file"
                        >
                          <Eye className="h-4 w-4" />
                        </motion.button>
                      )}
                      <motion.button
                        type="button"
                        onClick={() => onChange(null)}
                        className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center text-red-600 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Enhanced Image Preview */}
                {previewUrl && isImageFile(value) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm"
                  >
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Preview:</Label>
                    <div className="relative group">
                      <img
                        src={previewUrl || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full max-h-48 object-contain rounded-lg shadow-sm bg-gray-50"
                        onError={() => setPreviewUrl("")}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => window.open(previewUrl, "_blank")}
                          className="bg-white/90 hover:bg-white"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Lihat Penuh
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.label
                htmlFor={id}
                className="group relative flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 transition-all duration-300 bg-gradient-to-br from-gray-50 to-white hover:from-blue-50 hover:to-purple-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isUploading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center space-y-3"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                      <motion.div
                        className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"
                        style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-blue-600">Memproses file...</p>
                      <p className="text-xs text-gray-500">Mohon tunggu sebentar</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div className="text-center space-y-3" whileHover={{ y: -2 }}>
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                        <Upload className="h-8 w-8 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                        <Sparkles className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="text-base font-bold text-gray-800">Pilih File Anda</p>
                      <p className="text-sm text-gray-600">Klik untuk memilih file dari perangkat</p>
                      <p className="text-xs text-gray-500 mt-1">Maksimal 10MB • Semua format didukung</p>
                    </div>
                  </motion.div>
                )}
              </motion.label>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="link"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="relative">
              <Input
                type="url"
                value={currentLink}
                onChange={handleLinkChange}
                placeholder={placeholder}
                className={cn(
                  "pl-12 pr-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all",
                  linkError && "border-red-500 focus:border-red-500",
                )}
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <ExternalLink className="h-5 w-5 text-gray-400" />
              </div>
            </div>

            {linkError && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600 flex items-center bg-red-50 p-2 rounded-lg"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                {linkError}
              </motion.p>
            )}

            {currentLink && !linkError && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
                      <ExternalLink className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-blue-800 truncate">{currentLink}</p>
                      <p className="text-xs text-blue-600">Link berhasil ditambahkan</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <motion.button
                      type="button"
                      onClick={() => window.open(currentLink, "_blank")}
                      className="w-8 h-8 bg-green-100 hover:bg-green-200 rounded-lg flex items-center justify-center text-green-600 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Buka link"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => {
                        setCurrentLink("")
                        onChange(null)
                      }}
                      className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center text-red-600 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Text Input */}
      {onManualTextChange && (
        <div className="space-y-2">
          <Label className="text-xs text-gray-600">Teks Manual (Opsional)</Label>
          <Textarea
            value={manualText}
            onChange={(e) => onManualTextChange(e.target.value)}
            placeholder="Masukkan teks manual jika diperlukan..."
            className="min-h-[60px] border-gray-200 focus:border-indigo-500 text-sm bg-white/70 backdrop-blur-sm rounded-lg resize-none"
          />
        </div>
      )}
    </motion.div>
  )
}

export default EnhancedFileOrLinkInput

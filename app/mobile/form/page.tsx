"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  FileText,
  Upload,
  CheckCircle,
  Eye,
  Globe,
  Sparkles,
  Paperclip,
  TargetIcon,
  X,
  AlertTriangle,
  ChevronDown,
  ArrowLeftIcon,
  ArrowRightIcon,
  Save,
  ExternalLink,
  Crown,
  Star,
  Zap,
  Heart,
  Award,
  Briefcase,
  Users,
  Clock,
  Camera,
  Mic,
  Film,
  PenTool,
  Palette,
  Music,
  AudioWaveform,
  VideoIcon,
  ImageIcon,
  ChevronLeft,
  CheckCircle2,
  Folder,
  FileAudio,
  FileVideo,
  FileImage,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useRouter, useSearchParams } from "next/navigation"
import { saveSubmissionsToStorage, loadSubmissionsFromStorage } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion"
import { useResponsiveRedirect } from "@/hooks/use-responsive-redirect"

// Import types and interfaces
import type { FileData as PersistedFileData, Submission } from "@/lib/utils"

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

interface FormContentItem {
  id: string
  nama: string
  jenisKonten: string
  mediaPemerintah: string[]
  mediaMassa: string[]
  nomorSurat: string
  narasiText: string
  sourceNarasi: string[]
  sourceAudioDubbing: string[]
  sourceAudioBacksound: string[]
  sourcePendukungLainnya: string[]

  narasiFile: File | FileDataForForm | PersistedFileData | string | null
  suratFile: File | FileDataForForm | PersistedFileData | string | null
  audioDubbingFile: File | FileDataForForm | PersistedFileData | string | null
  audioDubbingLainLainFile: File | FileDataForForm | PersistedFileData | string | null
  audioBacksoundFile: File | FileDataForForm | PersistedFileData | string | null
  audioBacksoundLainLainFile: File | FileDataForForm | PersistedFileData | string | null
  pendukungVideoFile: File | FileDataForForm | PersistedFileData | string | null
  pendukungFotoFile: File | FileDataForForm | PersistedFileData | string | null
  pendukungLainLainFile: File | FileDataForForm | PersistedFileData | string | null

  narasiFileId?: string
  suratFileId?: string
  audioDubbingFileId?: string
  audioDubbingLainLainFileId?: string
  audioBacksoundFileId?: string
  audioBacksoundLainLainFileId?: string
  pendukungVideoFileId?: string
  pendukungFotoFileId?: string
  pendukungLainLainFileId?: string

  tanggalOrderMasuk: Date | undefined
  tanggalJadi: Date | undefined
  tanggalTayang: Date | undefined
  keterangan: string
  status?: "pending" | "approved" | "rejected"
  alasanPenolakan?: string
  tanggalDiproses?: string
  diprosesoleh?: string

  narasiSourceType: ("text" | "file" | "surat")[]
  audioDubbingSourceType: ("file-audio" | "lain-lain")[]
  audioBacksoundSourceType: ("file-audio" | "lain-lain")[]
  pendukungLainnyaSourceType: ("video" | "foto" | "lain-lain")[]
}

interface FormData {
  tema: string
  judul: string
  contentItems: FormContentItem[]
  petugasPelaksana: string
  supervisor: string
  pinSandi: string
  noComtab: string
  uploadedBuktiMengetahui: File | FileDataForForm | PersistedFileData | string | null
}

interface MediaChannel {
  id: string
  label: string
}

interface MediaCategory {
  id: string
  label: string
  icon: React.ElementType
  channels?: MediaChannel[]
}

const mediaPemerintahCategories: MediaCategory[] = [
  {
    id: "elektronik",
    label: "Media Elektronik",
    icon: Globe,
    channels: [
      { id: "videotron", label: "Videotron" },
      { id: "televisi", label: "Televisi" },
    ],
  },
  {
    id: "sosial-media",
    label: "Sosial Media",
    icon: Users,
    channels: [
      { id: "instagram", label: "Instagram" },
      { id: "facebook", label: "Facebook" },
      { id: "youtube", label: "YouTube" },
    ],
  },
  {
    id: "cetak",
    label: "Media Cetak",
    icon: FileText,
    channels: [
      { id: "bando", label: "Bando" },
      { id: "banner", label: "Banner" },
    ],
  },
  {
    id: "digital-online",
    label: "Digital Online",
    icon: Globe,
    channels: [{ id: "website", label: "Website" }],
  },
]

const mediaMassaChannels: MediaCategory[] = [
  { id: "media-cetak", label: "Media Cetak", icon: FileText },
  { id: "media-online", label: "Media Online", icon: Globe },
  { id: "televisi", label: "Televisi", icon: Film },
  { id: "radio", label: "Radio", icon: Mic },
]

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

const createPersistedFileData = async (file: File): Promise<PersistedFileData> => {
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
      return VideoIcon
    case "audio":
    case "mp3":
    case "wav":
    case "ogg":
    case "m4a":
      return AudioWaveform
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

// Enhanced Mobile File Input Component (without manual text)
const MobileFileInput = ({
  id,
  label,
  value,
  onChange,
  accept,
  fileId = "",
  onFileIdChange,
}: {
  id: string
  label: string
  value: File | FileDataForForm | PersistedFileData | string | null
  onChange: (newValue: File | string | null) => void
  accept?: string
  fileId?: string
  onFileIdChange?: (id: string) => void
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
        await new Promise((resolve) => setTimeout(resolve, 1500))

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
    if (typeof value === "string") return value.length > 25 ? value.substring(0, 25) + "..." : value
    return value.name
  }

  const FileIcon = getFileIcon(value)

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Label className="text-sm font-semibold text-gray-800 flex items-center">
        <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
        {label}
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
                layoutId="activeTab"
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
                layoutId="activeTab"
                className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-10 rounded-lg"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <div className="relative flex flex-col items-center space-y-1">
              <Paperclip className="h-5 w-5" />
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
                      <p className="text-sm text-gray-600">Tap untuk memilih file dari perangkat</p>
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
                placeholder="https://example.com/file.pdf"
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
    </motion.div>
  )
}

// Enhanced Mobile Step Indicator
const MobileStepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex space-x-2">
        {Array.from({ length: totalSteps }, (_, i) => (
          <motion.div
            key={i}
            className={cn(
              "h-2 rounded-full transition-all duration-500 relative overflow-hidden",
              i + 1 <= currentStep ? "bg-gradient-to-r from-blue-500 to-purple-500 w-12" : "bg-gray-200 w-8",
            )}
            initial={{ width: 32 }}
            animate={{ width: i + 1 <= currentStep ? 48 : 32 }}
          >
            {i + 1 <= currentStep && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1, delay: i * 0.1 }}
              />
            )}
          </motion.div>
        ))}
      </div>
      <motion.div
        className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
      >
        <Star className="h-3 w-3 text-blue-600" />
        <span className="text-sm font-bold text-blue-800">
          {currentStep}/{totalSteps}
        </span>
      </motion.div>
    </div>
  )
}

// Enhanced Mobile Bottom Navigation
const MobileBottomNav = ({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  onSubmit,
  isNextDisabled,
  isSubmitDisabled,
  isSubmitting,
  isEditMode,
}: {
  currentStep: number
  totalSteps: number
  onPrev: () => void
  onNext: () => void
  onSubmit: () => void
  isNextDisabled: boolean
  isSubmitDisabled: boolean
  isSubmitting: boolean
  isEditMode: boolean
}) => {
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200/50 p-4 safe-area-pb shadow-2xl"
    >
      <div className="flex items-center justify-between space-x-4">
        <motion.button
          onClick={onPrev}
          disabled={currentStep === 1}
          className={cn(
            "flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300",
            currentStep === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 hover:from-gray-200 hover:to-gray-100 shadow-md hover:shadow-lg",
          )}
          whileHover={currentStep > 1 ? { scale: 1.05 } : {}}
          whileTap={currentStep > 1 ? { scale: 0.95 } : {}}
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Kembali</span>
        </motion.button>

        {currentStep < totalSteps ? (
          <motion.button
            onClick={onNext}
            disabled={isNextDisabled}
            className={cn(
              "flex items-center space-x-2 px-8 py-3 rounded-xl font-bold transition-all duration-300 relative overflow-hidden",
              isNextDisabled
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl",
            )}
            whileHover={!isNextDisabled ? { scale: 1.05 } : {}}
            whileTap={!isNextDisabled ? { scale: 0.95 } : {}}
          >
            {!isNextDisabled && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 1 }}
              />
            )}
            <span className="relative">Lanjutkan</span>
            <ArrowRightIcon className="h-4 w-4 relative" />
          </motion.button>
        ) : (
          <motion.button
            onClick={onSubmit}
            disabled={isSubmitDisabled}
            className={cn(
              "flex items-center space-x-2 px-8 py-3 rounded-xl font-bold transition-all duration-300 relative overflow-hidden",
              isSubmitDisabled
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-xl",
            )}
            whileHover={!isSubmitDisabled ? { scale: 1.05 } : {}}
            whileTap={!isSubmitDisabled ? { scale: 0.95 } : {}}
          >
            {!isSubmitDisabled && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 1 }}
              />
            )}
            {isSubmitting ? (
              <>
                <motion.div
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                />
                <span className="relative">Mengirim...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 relative" />
                <span className="relative">{isEditMode ? "Update" : "Kirim"}</span>
              </>
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

// Helper function to format file size
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

const getWorkflowStage = (submission: any) => {
  if (!submission.isConfirmed) return "submitted"

  const contentItems = submission.contentItems || []
  if (contentItems.length === 0) return "review"

  const allReviewed = contentItems.every((item: any) => item.status === "approved" || item.status === "rejected")
  if (!allReviewed) return "review"

  const hasApprovedItems = contentItems.some((item: any) => item.status === "approved")
  if (!hasApprovedItems) return "completed"

  const approvedItems = contentItems.filter((item: any) => item.status === "approved")
  const allValidated = approvedItems.every((item: any) => item.isTayang !== undefined)

  if (!allValidated) return "validation"
  return "completed"
}

// Helper function to get content type color
const getContentTypeColor = (jenisKonten: string) => {
  const colorMap: Record<string, string> = {
    infografis: "from-blue-500 to-cyan-500",
    "naskah-berita": "from-green-500 to-emerald-500",
    audio: "from-purple-500 to-pink-500",
    video: "from-red-500 to-orange-500",
    fotografis: "from-yellow-500 to-amber-500",
    bumper: "from-indigo-500 to-purple-500",
  }
  return colorMap[jenisKonten] || "from-gray-500 to-slate-500"
}

const getContentTypeDisplayName = (jenisKonten: string) => {
  const typeNames: Record<string, string> = {
    infografis: "Infografis",
    "naskah-berita": "Naskah Berita",
    audio: "Audio",
    video: "Video",
    fotografis: "Fotografis",
    bumper: "Bumper",
  }
  return typeNames[jenisKonten] || jenisKonten.charAt(0).toUpperCase() + jenisKonten.slice(1).replace("-", " ")
}

const getContentTypeIcon = (jenisKonten: string) => {
  const iconMap: Record<string, React.ElementType> = {
    infografis: Palette,
    "naskah-berita": PenTool,
    audio: Music,
    video: Film,
    fotografis: Camera,
    bumper: Mic,
  }
  return iconMap[jenisKonten] || FileText
}

export default function MobilePelayananPublik() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Use responsive redirect hook
  const { isMobile, isInitialized } = useResponsiveRedirect({
    enableAutoRedirect: true,
    mobileBreakpoint: 768,
    preserveSearchParams: true,
  })

  // State management
  const [hasInitEditMode, setHasInitEditMode] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([])
  const [contentQuantities, setContentQuantities] = useState<Record<string, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingSubmissionId, setEditingSubmissionId] = useState<number | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [toastMessage, setToastMessage] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null)
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false)
  const [isSubmissionSuccessOpen, setIsSubmissionSuccessOpen] = useState(false)
  const [generatedCredentials, setGeneratedCredentials] = useState<{ noComtab: string; password: string } | null>(null)

  const initialFormContentItemState: FormContentItem = {
    id: "",
    nama: "",
    jenisKonten: "",
    mediaPemerintah: [],
    mediaMassa: [],
    nomorSurat: "",
    narasiText: "",
    sourceNarasi: [],
    sourceAudioDubbing: [],
    sourceAudioBacksound: [],
    sourcePendukungLainnya: [],
    narasiFile: null,
    suratFile: null,
    audioDubbingFile: null,
    audioDubbingLainLainFile: null,
    audioBacksoundFile: null,
    audioBacksoundLainLainFile: null,
    pendukungVideoFile: null,
    pendukungFotoFile: null,
    pendukungLainLainFile: null,
    narasiFileId: "",
    suratFileId: "",
    audioDubbingFileId: "",
    audioDubbingLainLainFileId: "",
    audioBacksoundFileId: "",
    audioBacksoundLainLainFileId: "",
    pendukungVideoFileId: "",
    pendukungFotoFileId: "",
    pendukungLainLainFileId: "",
    tanggalOrderMasuk: undefined,
    tanggalJadi: undefined,
    tanggalTayang: undefined,
    keterangan: "",
    status: "pending",
    narasiSourceType: [],
    audioDubbingSourceType: [],
    audioBacksoundSourceType: [],
    pendukungLainnyaSourceType: [],
  }

  const [formData, setFormData] = useState<FormData>({
    tema: "",
    judul: "",
    contentItems: [],
    petugasPelaksana: "",
    supervisor: "",
    pinSandi: "",
    noComtab: "",
    uploadedBuktiMengetahui: null,
  })

  // Initialize data
  useEffect(() => {
    if (hasInitEditMode) return

    const storedSubmissions = loadSubmissionsFromStorage()
    setSubmissions(storedSubmissions)

    const editId = searchParams.get("editId")
    const editPin = searchParams.get("editPin")

    if (editId && editPin) {
      const submissionToEdit = storedSubmissions.find(
        (sub: Submission) => sub.noComtab === editId && sub.pin === editPin,
      )

      if (submissionToEdit) {
        loadSubmissionForEdit(submissionToEdit)
        showToastMessage("Mode edit diaktifkan!", "info")
      } else {
        showToastMessage("Pengajuan tidak ditemukan!", "error")
        router.replace("/mobile")
      }
    }

    setHasInitEditMode(true)
  }, [])

  // Helper functions
  const showToastMessage = (message: string, type: "success" | "error" | "info" = "info") => {
    setToastMessage({ message, type })
    setTimeout(() => setToastMessage(null), 4000)
  }

  const generateCredentials = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000)
    const currentDate = new Date()
    const month = format(currentDate, "MM")
    const year = format(currentDate, "yyyy")
    const noComtab = `${randomNum}/IKP/${month}/${year}`
    const password = Math.floor(1000 + Math.random() * 9000).toString()
    return { noComtab, password }
  }

  const loadSubmissionForEdit = (submission: Submission) => {
    setIsEditMode(true)
    setEditingSubmissionId(submission.id)

    // Convert persisted file data to form-compatible format
    const convertFileData = (fileData: any): File | FileDataForForm | PersistedFileData | string | null => {
      if (!fileData) return null

      // If it's already a string (URL), keep it as is
      if (typeof fileData === "string") return fileData

      // If it's a persisted file data object, convert to FileDataForForm
      if (typeof fileData === "object" && fileData.base64) {
        return {
          name: fileData.name,
          size: fileData.size,
          type: fileData.type,
          lastModified: fileData.lastModified,
          base64: fileData.base64,
          url: fileData.base64,
          preview: fileData.preview || fileData.base64,
          thumbnailBase64: fileData.thumbnailBase64 || fileData.base64,
        } as FileDataForForm
      }

      return fileData
    }

    const convertedContentItems: FormContentItem[] =
      submission.contentItems?.map((item) => ({
        ...item,
        narasiFile: convertFileData(item.narasiFile),
        suratFile: convertFileData(item.suratFile),
        audioDubbingFile: convertFileData(item.audioDubbingFile),
        audioDubbingLainLainFile: convertFileData(item.audioDubbingLainLainFile),
        audioBacksoundFile: convertFileData(item.audioBacksoundFile),
        audioBacksoundLainLainFile: convertFileData(item.audioBacksoundLainLainFile),
        pendukungVideoFile: convertFileData(item.pendukungVideoFile),
        pendukungFotoFile: convertFileData(item.pendukungFotoFile),
        pendukungLainLainFile: convertFileData(item.pendukungLainLainFile),
        narasiSourceType: item.narasiSourceType || [],
        audioDubbingSourceType: item.audioDubbingSourceType || [],
        audioBacksoundSourceType: item.audioBacksoundSourceType || [],
        pendukungLainnyaSourceType: item.pendukungLainnyaSourceType || [],
        mediaPemerintah: item.mediaPemerintah || [],
        mediaMassa: item.mediaMassa || [],
        narasiFileId: item.narasiFileId || "",
        suratFileId: item.suratFileId || "",
        audioDubbingFileId: item.audioDubbingFileId || "",
        audioDubbingLainLainFileId: item.audioDubbingLainLainFileId || "",
        audioBacksoundFileId: item.audioBacksoundFileId || "",
        audioBacksoundLainLainFileId: item.audioBacksoundLainLainFileId || "",
        pendukungVideoFileId: item.pendukungVideoFileId || "",
        pendukungFotoFileId: item.pendukungFotoFileId || "",
        pendukungLainLainFileId: item.pendukungLainLainFileId || "",
      })) || []

    setFormData({
      tema: submission.tema || "",
      judul: submission.judul || "",
      contentItems: convertedContentItems,
      petugasPelaksana: submission.petugasPelaksana || "",
      supervisor: submission.supervisor || "",
      pinSandi: submission.pin || "",
      noComtab: submission.noComtab || "",
      uploadedBuktiMengetahui: convertFileData(submission.uploadedBuktiMengetahui),
    })

    const contentTypes = [...new Set(convertedContentItems.map((item) => item.jenisKonten))]
    setSelectedContentTypes(contentTypes)

    const quantities: Record<string, number> = {}
    contentTypes.forEach((type) => {
      quantities[type] = convertedContentItems.filter((item) => item.jenisKonten === type).length
    })
    setContentQuantities(quantities)
  }

  const handleBackToHome = () => {
    // In edit mode, ask for confirmation before leaving
    if (isEditMode) {
      const confirmLeave = window.confirm(
        "Anda sedang dalam mode edit. Perubahan yang belum disimpan akan hilang. Apakah Anda yakin ingin kembali ke beranda?",
      )
      if (!confirmLeave) return

      // Reset edit mode
      setIsEditMode(false)
      setEditingSubmissionId(null)
    } else {
      // Check if there's unsaved data for new submissions
      const hasUnsavedData =
        formData.tema ||
        formData.judul ||
        formData.petugasPelaksana ||
        formData.supervisor ||
        selectedContentTypes.length > 0

      if (hasUnsavedData) {
        const confirmLeave = window.confirm(
          "Anda memiliki data yang belum disimpan. Apakah Anda yakin ingin kembali ke beranda?",
        )
        if (!confirmLeave) return
      }
    }

    router.push("/mobile")
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleContentTypeChange = (contentType: string, checked: boolean) => {
    if (checked) {
      setSelectedContentTypes((prev) => [...prev, contentType])
      setContentQuantities((prev) => ({ ...prev, [contentType]: 1 }))

      const newItem: FormContentItem = {
        ...initialFormContentItemState,
        id: `${contentType}-1-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        jenisKonten: contentType,
        nama: `${getContentTypeDisplayName(contentType)} 1`,
      }

      setFormData((prev) => ({
        ...prev,
        contentItems: [...prev.contentItems, newItem],
      }))
    } else {
      setSelectedContentTypes((prev) => prev.filter((type) => type !== contentType))
      setContentQuantities((prev) => {
        const newQuantities = { ...prev }
        delete newQuantities[contentType]
        return newQuantities
      })

      setFormData((prev) => ({
        ...prev,
        contentItems: prev.contentItems.filter((item) => item.jenisKonten !== contentType),
      }))
    }
  }

  const updateContentItem = (index: number, updatedValues: Partial<FormContentItem>) => {
    setFormData((prev) => {
      const newContentItems = [...prev.contentItems]
      newContentItems[index] = { ...newContentItems[index], ...updatedValues }
      return { ...prev, contentItems: newContentItems }
    })
  }

  const handleSourceToggle = (
    contentIndex: number,
    sourceType:
      | "narasiSourceType"
      | "audioDubbingSourceType"
      | "audioBacksoundSourceType"
      | "pendukungLainnyaSourceType",
    value: string,
    checked: boolean,
  ) => {
    updateContentItem(contentIndex, {
      [sourceType]: checked
        ? [...(formData.contentItems[contentIndex][sourceType] as string[]), value]
        : (formData.contentItems[contentIndex][sourceType] as string[]).filter((s) => s !== value),
    })
  }

  const handleSubmit = () => {
    // Comprehensive validation
    const validationErrors = []

    // Step 1 validation
    if (!formData.tema) validationErrors.push("Tema belum dipilih")
    if (!formData.judul) validationErrors.push("Judul belum diisi")
    if (!formData.petugasPelaksana) validationErrors.push("Petugas pelaksana belum diisi")
    if (!formData.supervisor) validationErrors.push("Supervisor belum diisi")

    // Step 2 validation
    if (selectedContentTypes.length === 0) validationErrors.push("Belum ada jenis konten yang dipilih")

    // Step 3 validation
    const hasEmptyContentNames = formData.contentItems.some((item) => !item.nama || item.nama.trim() === "")
    const hasEmptyTimelineDates = formData.contentItems.some(
      (item) => !item.tanggalOrderMasuk || !item.tanggalJadi || !item.tanggalTayang,
    )

    if (hasEmptyContentNames) validationErrors.push("Ada nama konten yang belum diisi")
    if (hasEmptyTimelineDates) validationErrors.push("Ada tanggal timeline yang belum diisi")

    // Step 4 validation
    if (!formData.uploadedBuktiMengetahui) validationErrors.push("Bukti Mengetahui belum diupload")
    if (!formData.noComtab || formData.noComtab.trim() === "") validationErrors.push("No Comtab belum diisi")
    if (!formData.pinSandi || formData.pinSandi.trim() === "") validationErrors.push("PIN Sandi belum diisi")

    // Show validation errors
    if (validationErrors.length > 0) {
      const errorMessage = validationErrors.join(", ")
      showToastMessage(`Harap lengkapi: ${errorMessage}`, "error")

      // Navigate to appropriate step based on error
      if (
        validationErrors.some(
          (err) =>
            err.includes("Tema") || err.includes("Judul") || err.includes("Petugas") || err.includes("Supervisor"),
        )
      ) {
        setCurrentStep(1)
      } else if (validationErrors.some((err) => err.includes("jenis konten"))) {
        setCurrentStep(2)
      } else if (validationErrors.some((err) => err.includes("nama konten") || err.includes("tanggal"))) {
        setCurrentStep(3)
      } else {
        setCurrentStep(4)
      }
      return
    }

    // Validate No Comtab uniqueness (only for new submissions)
    if (!isEditMode) {
      const isDuplicateNoComtab = submissions.some((sub) => sub.noComtab === formData.noComtab)
      if (isDuplicateNoComtab) {
        showToastMessage("No Comtab sudah digunakan! Silakan gunakan No Comtab yang berbeda.", "error")
        setCurrentStep(4)
        return
      }
    }

    // All validations passed, open confirmation dialog
    setIsSubmitConfirmOpen(true)
  }

  async function submitPengajuanToApi(formData: FormData, url: string) {
    const fd = new FormData();
    console.log("Submitting form data to API...");
    console.log("Form Data:", formData);

    // Append field utama
    fd.append("noComtab", formData.noComtab);
    fd.append("pin", formData.pinSandi);
    fd.append("tema", formData.tema);
    fd.append("judul", formData.judul);
    fd.append("jenisMedia", "digital");
    fd.append("mediaPemerintah", JSON.stringify([]));
    fd.append("mediaMassa", JSON.stringify([]));
    fd.append("jenisKonten", JSON.stringify(formData.contentItems.map(item => item.jenisKonten)));
    fd.append("tanggalOrder", new Date().toISOString());
    fd.append("petugasPelaksana", formData.petugasPelaksana);
    fd.append("supervisor", formData.supervisor);
    fd.append("durasi", "30 hari");
    fd.append("jumlahProduksi", String(formData.contentItems.length));
    fd.append("tanggalSubmit", new Date().toISOString());
    fd.append("isConfirmed", "1");
    fd.append("workflowStage", "review");

    // Bukti Mengetahui
    if (formData.uploadedBuktiMengetahui instanceof File) {
      fd.append("uploadedBuktiMengetahui", formData.uploadedBuktiMengetahui);
    }

    // Append contentItems
    formData.contentItems.forEach((item, idx) => {
      const prefix = `contentItems[${idx}]`;

      fd.append(`${prefix}[id]`, item.id);
      fd.append(`${prefix}[nama]`, item.nama);
      fd.append(`${prefix}[jenisKonten]`, item.jenisKonten);
      fd.append(`${prefix}[mediaPemerintah]`, JSON.stringify(item.mediaPemerintah || []));
      fd.append(`${prefix}[mediaMassa]`, JSON.stringify(item.mediaMassa || []));
      fd.append(`${prefix}[nomorSurat]`, item.nomorSurat || "");
      fd.append(`${prefix}[narasiText]`, item.narasiText || "");
      fd.append(`${prefix}[sourceNarasi]`, JSON.stringify(item.sourceNarasi || []));
      fd.append(`${prefix}[sourceAudioDubbing]`, JSON.stringify(item.sourceAudioDubbing || []));
      fd.append(`${prefix}[sourceAudioBacksound]`, JSON.stringify(item.sourceAudioBacksound || []));
      fd.append(`${prefix}[sourcePendukungLainnya]`, JSON.stringify(item.sourcePendukungLainnya || []));
      fd.append(`${prefix}[tanggalOrderMasuk]`, item.tanggalOrderMasuk ? item.tanggalOrderMasuk.toISOString() : "");
      fd.append(`${prefix}[tanggalJadi]`, item.tanggalJadi ? item.tanggalJadi.toISOString() : "");
      fd.append(`${prefix}[tanggalTayang]`, item.tanggalTayang ? item.tanggalTayang.toISOString() : "");
      fd.append(`${prefix}[keterangan]`, item.keterangan || "");
      fd.append(`${prefix}[status]`, item.status || "pending");
      fd.append(`${prefix}[narasiSourceType]`, JSON.stringify(item.narasiSourceType || []));
      fd.append(`${prefix}[audioDubbingSourceType]`, JSON.stringify(item.audioDubbingSourceType || []));
      fd.append(`${prefix}[audioBacksoundSourceType]`, JSON.stringify(item.audioBacksoundSourceType || []));
      fd.append(`${prefix}[pendukungLainnyaSourceType]`, JSON.stringify(item.pendukungLainnyaSourceType || []));

      // File ID (wajib ada meskipun kosong, supaya Laravel tidak error)
      fd.append(`${prefix}[narasiFileId]`, item.narasiFileId || "");
      fd.append(`${prefix}[suratFileId]`, item.suratFileId || "");
      fd.append(`${prefix}[audioDubbingFileId]`, item.audioDubbingFileId || "");
      fd.append(`${prefix}[audioDubbingLainLainFileId]`, item.audioDubbingLainLainFileId || "");
      fd.append(`${prefix}[audioBacksoundFileId]`, item.audioBacksoundFileId || "");
      fd.append(`${prefix}[audioBacksoundLainLainFileId]`, item.audioBacksoundLainLainFileId || "");
      fd.append(`${prefix}[pendukungVideoFileId]`, item.pendukungVideoFileId || "");
      fd.append(`${prefix}[pendukungFotoFileId]`, item.pendukungFotoFileId || "");
      fd.append(`${prefix}[pendukungLainLainFileId]`, item.pendukungLainLainFileId || "");

      // File fields (isi file asli jika File, jika tidak isi blob kosong agar tetap dikirim)
      const emptyFile = new Blob([], { type: "application/octet-stream" });

      fd.append(`${prefix}[narasiFile]`, item.narasiFile instanceof File ? item.narasiFile : emptyFile);
      fd.append(`${prefix}[suratFile]`, item.suratFile instanceof File ? item.suratFile : emptyFile);
      fd.append(`${prefix}[audioDubbingFile]`, item.audioDubbingFile instanceof File ? item.audioDubbingFile : emptyFile);
      fd.append(`${prefix}[audioDubbingLainLainFile]`, item.audioDubbingLainLainFile instanceof File ? item.audioDubbingLainLainFile : emptyFile);
      fd.append(`${prefix}[audioBacksoundFile]`, item.audioBacksoundFile instanceof File ? item.audioBacksoundFile : emptyFile);
      fd.append(`${prefix}[audioBacksoundLainLainFile]`, item.audioBacksoundLainLainFile instanceof File ? item.audioBacksoundLainLainFile : emptyFile);
      fd.append(`${prefix}[pendukungVideoFile]`, item.pendukungVideoFile instanceof File ? item.pendukungVideoFile : emptyFile);
      fd.append(`${prefix}[pendukungFotoFile]`, item.pendukungFotoFile instanceof File ? item.pendukungFotoFile : emptyFile);
      fd.append(`${prefix}[pendukungLainLainFile]`, item.pendukungLainLainFile instanceof File ? item.pendukungLainLainFile : emptyFile);
    });

    // Kirim ke API
    const res = await fetch(`${url}/api/pengajuan`, {
      method: "POST",
      body: fd, // ❗ Tidak set headers -> biarkan browser set Content-Type
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("API Error Response:", errorText);
      throw new Error("Gagal menyimpan pengajuan");
    }

    return await res.json();
  }


  const confirmSubmission = async () => {
    setIsSubmitting(true)

    try {
      // --- Validasi Dasar ---
      if (!formData.tema || !formData.judul || !formData.petugasPelaksana || !formData.supervisor) {
        showToastMessage("Harap lengkapi semua informasi dasar!", "error")
        setCurrentStep(1)
        setIsSubmitting(false)
        return
      }

      if (selectedContentTypes.length === 0) {
        showToastMessage("Harap pilih setidaknya satu jenis konten!", "error")
        setCurrentStep(2)
        setIsSubmitting(false)
        return
      }

      const hasEmptyContentNames = formData.contentItems.some(item => !item.nama?.trim())
      const hasEmptyTimelineDates = formData.contentItems.some(
        item => !item.tanggalOrderMasuk || !item.tanggalJadi || !item.tanggalTayang
      )

      if (hasEmptyContentNames || hasEmptyTimelineDates) {
        showToastMessage("Lengkapi nama konten dan tanggal timeline!", "error")
        setCurrentStep(3)
        setIsSubmitting(false)
        return
      }

      if (!formData.uploadedBuktiMengetahui) {
        showToastMessage("Bukti Mengetahui wajib diisi!", "error")
        setCurrentStep(4)
        setIsSubmitting(false)
        return
      }

      if (!formData.noComtab?.trim() || !formData.pinSandi?.trim()) {
        showToastMessage("No Comtab dan PIN wajib diisi!", "error")
        setCurrentStep(4)
        setIsSubmitting(false)
        return
      }

      if (!isEditMode) {
        const isDuplicate = submissions.some(sub => sub.noComtab === formData.noComtab)
        if (isDuplicate) {
          showToastMessage("No Comtab sudah digunakan!", "error")
          setCurrentStep(4)
          setIsSubmitting(false)
          return
        }
      }

      // --- Proses File ---
      const processFileForPersistence = async (
        fileData: File | FileDataForForm | PersistedFileData | string | null,
      ) => {
        if (fileData instanceof File) {
          return await createPersistedFileData(fileData)
        }
        if (typeof fileData === "object" && fileData !== null && "base64" in fileData) {
          return {
            name: fileData.name,
            size: fileData.size,
            type: fileData.type,
            lastModified: fileData.lastModified,
            base64: fileData.base64,
            preview: fileData.preview || fileData.base64,
            thumbnailBase64: fileData.thumbnailBase64 || fileData.base64,
          } as PersistedFileData
        }
        return fileData
      }

      // --- Kirim ke API Laravel (hanya untuk pengajuan baru) ---
      if (!isEditMode) {
        const processedFormData = {
          ...formData,
          uploadedBuktiMengetahui: await processFileForPersistence(formData.uploadedBuktiMengetahui),
          contentItems: await Promise.all(
            formData.contentItems.map(async (item) => ({
              ...item,
              status: "pending",
              narasiFile: await processFileForPersistence(item.narasiFile),
              suratFile: await processFileForPersistence(item.suratFile),
              audioDubbingFile: await processFileForPersistence(item.audioDubbingFile),
              audioDubbingLainLainFile: await processFileForPersistence(item.audioDubbingLainLainFile),
              audioBacksoundFile: await processFileForPersistence(item.audioBacksoundFile),
              audioBacksoundLainLainFile: await processFileForPersistence(item.audioBacksoundLainLainFile),
              pendukungVideoFile: await processFileForPersistence(item.pendukungVideoFile),
              pendukungFotoFile: await processFileForPersistence(item.pendukungFotoFile),
              pendukungLainLainFile: await processFileForPersistence(item.pendukungLainLainFile),
            }))
          ),
        }

        const response = await submitPengajuanToApi(processedFormData, process.env.NEXT_PUBLIC_API_URL!)

        // Simpan credential dan notifikasi
        setGeneratedCredentials({
          noComtab: response.no_comtab || processedFormData.noComtab,
          password: response.pin_sandi || processedFormData.pinSandi,
        })

        setIsSubmissionSuccessOpen(true)
        showToastMessage("Pengajuan berhasil dikirim!", "success")

        // Reset form
        setFormData({
          tema: "",
          judul: "",
          contentItems: [],
          petugasPelaksana: "",
          supervisor: "",
          pinSandi: "",
          noComtab: "",
          uploadedBuktiMengetahui: null,
        })
        setSelectedContentTypes([])
        setContentQuantities({})
        setCurrentStep(1)
      }

      // --- Mode Edit: Update di localStorage ---
      else {
        const updatedSubmission: Submission = {
          id: editingSubmissionId!,
          noComtab: formData.noComtab,
          pin: formData.pinSandi,
          tema: formData.tema,
          judul: formData.judul,
          jenisMedia: "digital",
          mediaPemerintah: [],
          mediaMassa: [],
          jenisKonten: selectedContentTypes,
          tanggalOrder: new Date(),
          petugasPelaksana: formData.petugasPelaksana,
          supervisor: formData.supervisor,
          durasi: "30 hari",
          jumlahProduksi: formData.contentItems.length.toString(),
          tanggalSubmit: new Date(),
          uploadedBuktiMengetahui: await processFileForPersistence(formData.uploadedBuktiMengetahui),
          isConfirmed: true,
          contentItems: await Promise.all(
            formData.contentItems.map(async (item) => ({
              ...item,
              status: item.status || "pending",
              narasiFile: await processFileForPersistence(item.narasiFile),
              suratFile: await processFileForPersistence(item.suratFile),
              audioDubbingFile: await processFileForPersistence(item.audioDubbingFile),
              audioDubbingLainLainFile: await processFileForPersistence(item.audioDubbingLainLainFile),
              audioBacksoundFile: await processFileForPersistence(item.audioBacksoundFile),
              audioBacksoundLainLainFile: await processFileForPersistence(item.audioBacksoundLainLainFile),
              pendukungVideoFile: await processFileForPersistence(item.pendukungVideoFile),
              pendukungFotoFile: await processFileForPersistence(item.pendukungFotoFile),
              pendukungLainLainFile: await processFileForPersistence(item.pendukungLainLainFile),
            }))
          ),
          workflowStage: getWorkflowStage({
            isConfirmed: true,
            contentItems: formData.contentItems.map((item) => ({
              ...item,
              status: item.status || "pending",
            })),
          }),
        }

        const updatedSubmissions = submissions.map(sub =>
          sub.id === editingSubmissionId ? updatedSubmission : sub
        )

        setSubmissions(updatedSubmissions)
        saveSubmissionsToStorage(updatedSubmissions)
        showToastMessage("Pengajuan berhasil diperbarui!", "success")

        setIsEditMode(false)
        setEditingSubmissionId(null)
        setTimeout(() => router.push("/mobile"), 1000)
      }
    } catch (error) {
      console.error("Submission error:", error)
      showToastMessage("Gagal mengirim pengajuan. Coba lagi nanti.", "error")
    } finally {
      setIsSubmitting(false)
      setIsSubmitConfirmOpen(false)
    }
  }

  const isNextButtonDisabled = useMemo(() => {
    switch (currentStep) {
      case 1:
        return !formData.tema || !formData.judul || !formData.petugasPelaksana || !formData.supervisor
      case 2:
        return selectedContentTypes.length === 0
      case 3:
        return formData.contentItems.some(
          (item) => !item.nama || !item.tanggalOrderMasuk || !item.tanggalJadi || !item.tanggalTayang,
        )
      default:
        return false
    }
  }, [currentStep, formData, selectedContentTypes])

  const isSubmitDisabled = useMemo(() => {
    const baseValidation = !formData.tema || !formData.judul || !formData.petugasPelaksana || !formData.supervisor
    const contentValidation = selectedContentTypes.length === 0
    const contentItemsValidation = formData.contentItems.some(
      (item) => !item.nama || !item.tanggalOrderMasuk || !item.tanggalJadi || !item.tanggalTayang,
    )
    const buktiMengetahuiValidation = !formData.uploadedBuktiMengetahui
    const credentialsValidation = !formData.noComtab || !formData.pinSandi

    return (
      baseValidation ||
      contentValidation ||
      contentItemsValidation ||
      buktiMengetahuiValidation ||
      credentialsValidation ||
      isSubmitting
    )
  }, [formData, selectedContentTypes, isSubmitting])

  // Don't render anything if not initialized
  if (!isInitialized) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-24">
      {/* Enhanced Mobile Header */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-200/50 shadow-lg"
      >
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Back Button */}
              <motion.button
                onClick={handleBackToHome}
                className="w-10 h-10 bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Kembali ke beranda"
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </motion.button>

              <motion.div
                className="w-12 h-12 bg-gradient-to-r from-blue-600 via-purple-600 to pink-500 rounded-2xl flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Crown className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                >
                  {isEditMode ? "Edit Pengajuan" : "Form Pengajuan"}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-sm text-gray-600 flex items-center"
                >
                  <Sparkles className="h-3 w-3 mr-1 text-purple-500" />
                  Pelayanan Publik Mobile
                </motion.p>
              </div>
            </div>
          </div>

          {/* Mobile Step Indicator */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <MobileStepIndicator currentStep={currentStep} totalSteps={4} />
          </motion.div>
        </div>
      </motion.div>

      {/* Mobile Form Content */}
      <motion.div className="px-4 py-6 space-y-8">
        {currentStep === 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-6 space-y-6">
                <motion.h2 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span>Informasi Dasar</span>
                </motion.h2>

                <div className="space-y-4">
                  {/* Tema */}
                  <div className="space-y-2">
                    <Label htmlFor="tema" className="text-sm font-semibold text-gray-800 flex items-center">
                      <Heart className="h-4 w-4 mr-2 text-red-500" />
                      Tema
                    </Label>
                    <Select value={formData.tema} onValueChange={(value) => setFormData({ ...formData, tema: value })}>
                      <SelectTrigger className="bg-white/70 backdrop-blur-sm border-gray-200 focus:border-indigo-500 text-sm">
                        <SelectValue placeholder="Pilih tema" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sosial">
                          <div className="flex items-center space-x-3 py-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                              <span className="text-white text-sm">🏥</span>
                            </div>
                            <div>
                              <p className="font-semibold">Sosial & Kesehatan</p>
                              <p className="text-xs text-gray-500">Kesehatan, pendidikan, sosial</p>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="ekonomi">
                          <div className="flex items-center space-x-3 py-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                              <span className="text-white text-sm">💰</span>
                            </div>
                            <div>
                              <p className="font-semibold">Ekonomi & Bisnis</p>
                              <p className="text-xs text-gray-500">UMKM, perdagangan, investasi</p>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="lingkungan">
                          <div className="flex items-center space-x-3 py-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                              <span className="text-white text-sm">🌱</span>
                            </div>
                            <div>
                              <p className="font-semibold">Lingkungan & Alam</p>
                              <p className="text-xs text-gray-500">Konservasi, kebersihan, hijau</p>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Judul */}
                  <div className="space-y-2">
                    <Label htmlFor="judul" className="text-sm font-semibold text-gray-800 flex items-center">
                      <Award className="h-4 w-4 mr-2 text-green-500" />
                      Judul
                    </Label>
                    <Input
                      type="text"
                      id="judul"
                      value={formData.judul}
                      onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                      placeholder="Masukkan judul"
                      className="bg-white/70 backdrop-blur-sm border-gray-200 focus:border-indigo-500 text-sm"
                    />
                  </div>

                  {/* Petugas Pelaksana */}
                  <div className="space-y-2">
                    <Label htmlFor="petugasPelaksana" className="text-sm font-semibold text-gray-800 flex items-center">
                      <Briefcase className="h-4 w-4 mr-2 text-blue-500" />
                      Petugas Pelaksana
                    </Label>
                    <Input
                      type="text"
                      id="petugasPelaksana"
                      value={formData.petugasPelaksana}
                      onChange={(e) => setFormData({ ...formData, petugasPelaksana: e.target.value })}
                      placeholder="Masukkan nama petugas pelaksana"
                      className="bg-white/70 backdrop-blur-sm border-gray-200 focus:border-indigo-500 text-sm"
                    />
                  </div>

                  {/* Supervisor */}
                  <div className="space-y-2">
                    <Label htmlFor="supervisor" className="text-sm font-semibold text-gray-800 flex items-center">
                      <Users className="h-4 w-4 mr-2 text-purple-500" />
                      Supervisor
                    </Label>
                    <Input
                      type="text"
                      id="supervisor"
                      value={formData.supervisor}
                      onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                      placeholder="Masukkan nama supervisor"
                      className="bg-white/70 backdrop-blur-sm border-gray-200 focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-6 space-y-6">
                <motion.h2 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-indigo-500" />
                  <span>Pilih Jenis Konten</span>
                </motion.h2>

                <div className="space-y-4">
                  {/* Content Type Options with Quantity Controls */}
                  {["infografis", "naskah-berita", "audio", "video", "fotografis", "bumper"].map((contentType) => {
                    const isSelected = selectedContentTypes.includes(contentType)
                    const quantity = contentQuantities[contentType] || 0
                    const ContentIcon = getContentTypeIcon(contentType)
                    const contentColor = getContentTypeColor(contentType)

                    return (
                      <motion.div
                        key={contentType}
                        className={cn(
                          "bg-white rounded-2xl border-2 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden",
                          isSelected ? "border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50" : "border-gray-200",
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Main Card Content - Fixed Alignment */}
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 flex-1 min-w-0">
                              <div
                                className={cn(
                                  "w-12 h-12 rounded-xl flex items-center justify-center shadow-md bg-gradient-to-r flex-shrink-0",
                                  contentColor,
                                )}
                              >
                                <ContentIcon className="h-6 w-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-base font-bold text-gray-800 truncate">
                                  {getContentTypeDisplayName(contentType)}
                                </p>
                                <p className="text-sm text-gray-500 truncate">Konten {contentType.replace("-", " ")}</p>
                              </div>
                            </div>

                            {/* Toggle Switch - Fixed Alignment */}
                            <div className="flex items-center ml-4 flex-shrink-0">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  value={contentType}
                                  className="sr-only peer"
                                  checked={isSelected}
                                  onChange={(e) => handleContentTypeChange(contentType, e.target.checked)}
                                />
                                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Quantity Controls - Show when selected */}
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white"
                            >
                              <div className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                                      <span className="text-xs font-bold text-blue-600">#</span>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700">Jumlah Konten</span>
                                  </div>

                                  {/* Quantity Controls */}
                                  <div className="flex items-center space-x-3">
                                    {/* Decrease Button */}
                                    <motion.button
                                      type="button"
                                      onClick={() => {
                                        if (quantity > 1) {
                                          const newQuantity = quantity - 1
                                          setContentQuantities((prev) => ({ ...prev, [contentType]: newQuantity }))

                                          // Remove the last content item of this type
                                          setFormData((prev) => ({
                                            ...prev,
                                            contentItems: prev.contentItems.filter((item, index) => {
                                              const itemsOfType = prev.contentItems.filter(
                                                (i) => i.jenisKonten === contentType,
                                              )
                                              const isLastOfType = itemsOfType[itemsOfType.length - 1]?.id === item.id
                                              return !(item.jenisKonten === contentType && isLastOfType)
                                            }),
                                          }))
                                        }
                                      }}
                                      disabled={quantity <= 1}
                                      className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-all duration-200",
                                        quantity <= 1
                                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                          : "bg-red-100 text-red-600 hover:bg-red-200 active:scale-95",
                                      )}
                                      whileHover={quantity > 1 ? { scale: 1.1 } : {}}
                                      whileTap={quantity > 1 ? { scale: 0.9 } : {}}
                                    >
                                      <span className="text-lg leading-none">−</span>
                                    </motion.button>

                                    {/* Quantity Display */}
                                    <motion.div
                                      className="w-12 h-8 bg-white border-2 border-blue-200 rounded-lg flex items-center justify-center shadow-sm"
                                      key={quantity}
                                      initial={{ scale: 1.2 }}
                                      animate={{ scale: 1 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <span className="text-sm font-bold text-blue-600">{quantity}</span>
                                    </motion.div>

                                    {/* Increase Button */}
                                    <motion.button
                                      type="button"
                                      onClick={() => {
                                        const newQuantity = quantity + 1
                                        setContentQuantities((prev) => ({ ...prev, [contentType]: newQuantity }))

                                        // Add new content item
                                        const newItem = {
                                          ...initialFormContentItemState,
                                          id: `${contentType}-${newQuantity}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                          jenisKonten: contentType,
                                          nama: `${getContentTypeDisplayName(contentType)} ${newQuantity}`,
                                        }

                                        setFormData((prev) => ({
                                          ...prev,
                                          contentItems: [...prev.contentItems, newItem],
                                        }))
                                      }}
                                      disabled={quantity >= 10} // Max limit
                                      className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-all duration-200",
                                        quantity >= 10
                                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                          : "bg-green-100 text-green-600 hover:bg-green-200 active:scale-95",
                                      )}
                                      whileHover={quantity < 10 ? { scale: 1.1 } : {}}
                                      whileTap={quantity < 10 ? { scale: 0.9 } : {}}
                                    >
                                      <span className="text-lg leading-none">+</span>
                                    </motion.button>
                                  </div>
                                </div>

                                {/* Quantity Info */}
                                <div className="mt-3 flex items-center justify-between text-xs">
                                  <span className="text-gray-500">
                                    {quantity === 1 ? "1 konten" : `${quantity} konten`}
                                  </span>
                                  {quantity >= 10 && (
                                    <span className="text-amber-600 font-medium flex items-center">
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      Maksimal 10 konten
                                    </span>
                                  )}
                                </div>

                                {/* Content Items Preview */}
                                {quantity > 1 && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-3 pt-3 border-t border-gray-200"
                                  >
                                    <div className="flex flex-wrap gap-1">
                                      {Array.from({ length: quantity }, (_, i) => (
                                        <motion.div
                                          key={i}
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          transition={{ delay: i * 0.05 }}
                                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium"
                                        >
                                          {getContentTypeDisplayName(contentType)} {i + 1}
                                        </motion.div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Summary Section */}
                {selectedContentTypes.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200"
                  >
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="font-semibold text-blue-800">Ringkasan Konten</h3>
                    </div>

                    <div className="space-y-2">
                      {selectedContentTypes.map((contentType) => (
                        <div key={contentType} className="flex items-center justify-between text-sm">
                          <span className="text-blue-700 font-medium">{getContentTypeDisplayName(contentType)}</span>
                          <span className="text-blue-600 font-bold">{contentQuantities[contentType]} konten</span>
                        </div>
                      ))}

                      <div className="pt-2 mt-2 border-t border-blue-200 flex items-center justify-between">
                        <span className="text-blue-800 font-bold">Total Konten</span>
                        <span className="text-blue-600 font-bold text-lg">
                          {Object.values(contentQuantities).reduce((sum, qty) => sum + qty, 0)} konten
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-6 space-y-6">
                <motion.h2 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>Detail Konten</span>
                </motion.h2>

                <div className="space-y-4">
                  {formData.contentItems.map((item, index) => {
                    const ContentIcon = getContentTypeIcon(item.jenisKonten)
                    const contentColor = getContentTypeColor(item.jenisKonten)
                    const isComplete = item.nama && item.tanggalOrderMasuk && item.tanggalJadi && item.tanggalTayang

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Collapsible>
                          {/* Card Header - Always Visible */}
                          <CollapsibleTrigger asChild>
                            <motion.div
                              className="w-full p-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  {/* Content Type Icon */}
                                  <div
                                    className={cn(
                                      "w-12 h-12 rounded-xl flex items-center justify-center shadow-md bg-gradient-to-r",
                                      contentColor,
                                    )}
                                  >
                                    <ContentIcon className="h-6 w-6 text-white" />
                                  </div>

                                  {/* Content Info */}
                                  <div className="flex-1">
                                    <h3 className="font-bold text-gray-800 text-base">
                                      {item.nama || `${getContentTypeDisplayName(item.jenisKonten)} ${index + 1}`}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                      {getContentTypeDisplayName(item.jenisKonten)}
                                    </p>

                                    {/* Progress Indicator */}
                                    <div className="flex items-center space-x-2 mt-2">
                                      <div
                                        className={cn(
                                          "w-2 h-2 rounded-full",
                                          isComplete ? "bg-green-500" : "bg-yellow-500",
                                        )}
                                      />
                                      <span
                                        className={cn(
                                          "text-xs font-medium",
                                          isComplete ? "text-green-600" : "text-yellow-600",
                                        )}
                                      >
                                        {isComplete ? "Lengkap" : "Perlu dilengkapi"}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Expand Icon */}
                                <div className="flex items-center space-x-2">
                                  {isComplete && (
                                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    </div>
                                  )}
                                  <ChevronDown className="h-5 w-5 text-gray-400 transition-transform group-data-[state=open]:rotate-180" />
                                </div>
                              </div>
                            </motion.div>
                          </CollapsibleTrigger>

                          {/* Detailed Content - Expandable */}
                          <CollapsibleContent className="mt-4">
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 overflow-hidden"
                            >
                              {/* Header with gradient */}
                              <div className={cn("p-4 bg-gradient-to-r text-white", contentColor)}>
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                    <ContentIcon className="h-5 w-5 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-bold text-lg">{getContentTypeDisplayName(item.jenisKonten)}</h3>
                                    <p className="text-white/80 text-sm">Detail Konten #{index + 1}</p>
                                  </div>
                                </div>
                              </div>

                              <div className="p-6 space-y-6">
                                {/* Basic Information Section */}
                                <div className="space-y-4">
                                  <div className="flex items-center space-x-2 mb-3">
                                    <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                                      <FileText className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <h4 className="font-semibold text-gray-800">Informasi Dasar</h4>
                                  </div>

                                  {/* Nama Konten */}
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">
                                      Nama Konten <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                      value={item.nama}
                                      onChange={(e) => updateContentItem(index, { nama: e.target.value })}
                                      placeholder="Masukkan nama konten yang menarik"
                                      className="bg-white border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl"
                                    />
                                  </div>

                                  {/* Nomor Surat */}
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">Nomor Surat</Label>
                                    <Input
                                      value={item.nomorSurat}
                                      onChange={(e) => updateContentItem(index, { nomorSurat: e.target.value })}
                                      placeholder="Nomor surat (opsional)"
                                      className="bg-white border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl"
                                    />
                                  </div>
                                </div>

                                {/* Timeline Section */}
                                <div className="space-y-4">
                                  <div className="flex items-center space-x-2 mb-3">
                                    <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
                                      <Clock className="h-4 w-4 text-orange-600" />
                                    </div>
                                    <h4 className="font-semibold text-gray-800">Timeline Produksi</h4>
                                  </div>

                                  <div className="grid grid-cols-1 gap-3">
                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium text-gray-700">
                                        Tanggal Order Masuk <span className="text-red-500">*</span>
                                      </Label>
                                      <Input
                                        type="date"
                                        value={
                                          item.tanggalOrderMasuk ? format(item.tanggalOrderMasuk, "yyyy-MM-dd") : ""
                                        }
                                        onChange={(e) =>
                                          updateContentItem(index, { tanggalOrderMasuk: new Date(e.target.value) })
                                        }
                                        className="bg-white border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl"
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium text-gray-700">
                                        Tanggal Jadi <span className="text-red-500">*</span>
                                      </Label>
                                      <Input
                                        type="date"
                                        value={item.tanggalJadi ? format(item.tanggalJadi, "yyyy-MM-dd") : ""}
                                        onChange={(e) =>
                                          updateContentItem(index, { tanggalJadi: new Date(e.target.value) })
                                        }
                                        className="bg-white border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 rounded-xl"
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium text-gray-700">
                                        Tanggal Tayang <span className="text-red-500">*</span>
                                      </Label>
                                      <Input
                                        type="date"
                                        value={item.tanggalTayang ? format(item.tanggalTayang, "yyyy-MM-dd") : ""}
                                        onChange={(e) =>
                                          updateContentItem(index, { tanggalTayang: new Date(e.target.value) })
                                        }
                                        className="bg-white border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 rounded-xl"
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Source/Bahan Section */}
                                <div className="space-y-4">
                                  <div className="flex items-center space-x-2 mb-3">
                                    <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                                      <Folder className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <h4 className="font-semibold text-gray-800">Source/Bahan</h4>
                                  </div>

                                  {/* Narasi Source */}
                                  <div className="space-y-3 p-4 bg-white/50 rounded-lg border border-purple-200">
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                      Source Narasi
                                    </Label>
                                    <div className="space-y-2">
                                      {[
                                        { value: "text", label: "Text Manual", icon: PenTool },
                                        { value: "file", label: "File Upload", icon: FileText },
                                        { value: "surat", label: "Dari Surat", icon: FileText },
                                      ].map((option) => {
                                        const OptionIcon = option.icon
                                        return (
                                          <div
                                            key={option.value}
                                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                                          >
                                            <Checkbox
                                              id={`narasi-${index}-${option.value}`}
                                              checked={item.narasiSourceType.includes(option.value as any)}
                                              onCheckedChange={(checked) =>
                                                handleSourceToggle(
                                                  index,
                                                  "narasiSourceType",
                                                  option.value,
                                                  checked as boolean,
                                                )
                                              }
                                              className="border-purple-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                            />
                                            <OptionIcon className="h-4 w-4 text-purple-600" />
                                            <Label
                                              htmlFor={`narasi-${index}-${option.value}`}
                                              className="text-sm text-gray-700 cursor-pointer flex-1"
                                            >
                                              {option.label}
                                            </Label>
                                          </div>
                                        )
                                      })}
                                    </div>

                                    {/* Text input for narasi */}
                                    {item.narasiSourceType.includes("text") && (
                                      <div className="mt-3">
                                        <Label className="text-sm font-medium text-gray-700">Narasi Text</Label>
                                        <Textarea
                                          value={item.narasiText}
                                          onChange={(e) => updateContentItem(index, { narasiText: e.target.value })}
                                          placeholder="Masukkan narasi text"
                                          className="mt-1 bg-white border-purple-200 focus:border-purple-500 focus:ring-purple-500 min-h-[80px] rounded-xl"
                                        />
                                      </div>
                                    )}

                                    {/* File upload for narasi */}
                                    {item.narasiSourceType.includes("file") && (
                                      <div className="mt-3">
                                        <MobileFileInput
                                          id={`narasiFile-${index}`}
                                          label="File Narasi"
                                          value={item.narasiFile}
                                          onChange={(file) => updateContentItem(index, { narasiFile: file })}
                                          accept=".txt,.doc,.docx,.pdf"
                                          fileId={item.narasiFileId}
                                          onFileIdChange={(id) => updateContentItem(index, { narasiFileId: id })}
                                        />
                                      </div>
                                    )}

                                    {/* Surat file upload */}
                                    {item.narasiSourceType.includes("surat") && (
                                      <div className="mt-3">
                                        <MobileFileInput
                                          id={`suratFile-${index}`}
                                          label="File Surat"
                                          value={item.suratFile}
                                          onChange={(file) => updateContentItem(index, { suratFile: file })}
                                          accept=".pdf,.jpg,.jpeg,.png"
                                          fileId={item.suratFileId}
                                          onFileIdChange={(id) => updateContentItem(index, { suratFileId: id })}
                                        />
                                      </div>
                                    )}
                                  </div>

                                  {/* Audio Dubbing Source */}
                                  <div className="space-y-3 p-4 bg-white/50 rounded-lg border border-purple-200">
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                      Source Audio Dubbing
                                    </Label>
                                    <div className="space-y-2">
                                      {[
                                        { value: "file-audio", label: "File Audio", icon: FileAudio },
                                        { value: "lain-lain", label: "Lain-lain", icon: Folder },
                                      ].map((option) => {
                                        const OptionIcon = option.icon
                                        return (
                                          <div
                                            key={option.value}
                                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                                          >
                                            <Checkbox
                                              id={`dubbing-${index}-${option.value}`}
                                              checked={item.audioDubbingSourceType.includes(option.value as any)}
                                              onCheckedChange={(checked) =>
                                                handleSourceToggle(
                                                  index,
                                                  "audioDubbingSourceType",
                                                  option.value,
                                                  checked as boolean,
                                                )
                                              }
                                              className="border-purple-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                            />
                                            <OptionIcon className="h-4 w-4 text-purple-600" />
                                            <Label
                                              htmlFor={`dubbing-${index}-${option.value}`}
                                              className="text-sm text-gray-700 cursor-pointer flex-1"
                                            >
                                              {option.label}
                                            </Label>
                                          </div>
                                        )
                                      })}
                                    </div>

                                    {/* Audio file upload */}
                                    {item.audioDubbingSourceType.includes("file-audio") && (
                                      <div className="mt-3">
                                        <MobileFileInput
                                          id={`audioDubbingFile-${index}`}
                                          label="File Audio Dubbing"
                                          value={item.audioDubbingFile}
                                          onChange={(file) => updateContentItem(index, { audioDubbingFile: file })}
                                          accept=".mp3,.wav,.ogg,.m4a"
                                          fileId={item.audioDubbingFileId}
                                          onFileIdChange={(id) => updateContentItem(index, { audioDubbingFileId: id })}
                                        />
                                      </div>
                                    )}

                                    {/* Lain-lain file upload */}
                                    {item.audioDubbingSourceType.includes("lain-lain") && (
                                      <div className="mt-3">
                                        <MobileFileInput
                                          id={`audioDubbingLainLainFile-${index}`}
                                          label="File Lain-lain (Audio Dubbing)"
                                          value={item.audioDubbingLainLainFile}
                                          onChange={(file) =>
                                            updateContentItem(index, { audioDubbingLainLainFile: file })
                                          }
                                          fileId={item.audioDubbingLainLainFileId}
                                          onFileIdChange={(id) =>
                                            updateContentItem(index, { audioDubbingLainLainFileId: id })
                                          }
                                        />
                                      </div>
                                    )}
                                  </div>

                                  {/* Audio Backsound Source */}
                                  <div className="space-y-3 p-4 bg-white/50 rounded-lg border border-purple-200">
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                      Source Audio Backsound
                                    </Label>
                                    <div className="space-y-2">
                                      {[
                                        { value: "file-audio", label: "File Audio", icon: FileAudio },
                                        { value: "lain-lain", label: "Lain-lain", icon: Folder },
                                      ].map((option) => {
                                        const OptionIcon = option.icon
                                        return (
                                          <div
                                            key={option.value}
                                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                                          >
                                            <Checkbox
                                              id={`backsound-${index}-${option.value}`}
                                              checked={item.audioBacksoundSourceType.includes(option.value as any)}
                                              onCheckedChange={(checked) =>
                                                handleSourceToggle(
                                                  index,
                                                  "audioBacksoundSourceType",
                                                  option.value,
                                                  checked as boolean,
                                                )
                                              }
                                              className="border-purple-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                            />
                                            <OptionIcon className="h-4 w-4 text-purple-600" />
                                            <Label
                                              htmlFor={`backsound-${index}-${option.value}`}
                                              className="text-sm text-gray-700 cursor-pointer flex-1"
                                            >
                                              {option.label}
                                            </Label>
                                          </div>
                                        )
                                      })}
                                    </div>

                                    {/* Audio file upload */}
                                    {item.audioBacksoundSourceType.includes("file-audio") && (
                                      <div className="mt-3">
                                        <MobileFileInput
                                          id={`audioBacksoundFile-${index}`}
                                          label="File Audio Backsound"
                                          value={item.audioBacksoundFile}
                                          onChange={(file) => updateContentItem(index, { audioBacksoundFile: file })}
                                          accept=".mp3,.wav,.ogg,.m4a"
                                          fileId={item.audioBacksoundFileId}
                                          onFileIdChange={(id) =>
                                            updateContentItem(index, { audioBacksoundFileId: id })
                                          }
                                        />
                                      </div>
                                    )}

                                    {/* Lain-lain file upload */}
                                    {item.audioBacksoundSourceType.includes("lain-lain") && (
                                      <div className="mt-3">
                                        <MobileFileInput
                                          id={`audioBacksoundLainLainFile-${index}`}
                                          label="File Lain-lain (Audio Backsound)"
                                          value={item.audioBacksoundLainLainFile}
                                          onChange={(file) =>
                                            updateContentItem(index, { audioBacksoundLainLainFile: file })
                                          }
                                          fileId={item.audioBacksoundLainLainFileId}
                                          onFileIdChange={(id) =>
                                            updateContentItem(index, { audioBacksoundLainLainFileId: id })
                                          }
                                        />
                                      </div>
                                    )}
                                  </div>

                                  {/* Pendukung Lainnya Source */}
                                  <div className="space-y-3 p-4 bg-white/50 rounded-lg border border-purple-200">
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                      Source Pendukung Lainnya
                                    </Label>
                                    <div className="space-y-2">
                                      {[
                                        { value: "video", label: "Video", icon: FileVideo },
                                        { value: "foto", label: "Foto", icon: FileImage },
                                        { value: "lain-lain", label: "Lain-lain", icon: Folder },
                                      ].map((option) => {
                                        const OptionIcon = option.icon
                                        return (
                                          <div
                                            key={option.value}
                                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                                          >
                                            <Checkbox
                                              id={`pendukung-${index}-${option.value}`}
                                              checked={item.pendukungLainnyaSourceType.includes(option.value as any)}
                                              onCheckedChange={(checked) =>
                                                handleSourceToggle(
                                                  index,
                                                  "pendukungLainnyaSourceType",
                                                  option.value,
                                                  checked as boolean,
                                                )
                                              }
                                              className="border-purple-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                            />
                                            <OptionIcon className="h-4 w-4 text-purple-600" />
                                            <Label
                                              htmlFor={`pendukung-${index}-${option.value}`}
                                              className="text-sm text-gray-700 cursor-pointer flex-1"
                                            >
                                              {option.label}
                                            </Label>
                                          </div>
                                        )
                                      })}
                                    </div>

                                    {/* Video file upload */}
                                    {item.pendukungLainnyaSourceType.includes("video") && (
                                      <div className="mt-3">
                                        <MobileFileInput
                                          id={`pendukungVideoFile-${index}`}
                                          label="File Video Pendukung"
                                          value={item.pendukungVideoFile}
                                          onChange={(file) => updateContentItem(index, { pendukungVideoFile: file })}
                                          accept=".mp4,.avi,.mov,.wmv,.flv"
                                          fileId={item.pendukungVideoFileId}
                                          onFileIdChange={(id) =>
                                            updateContentItem(index, { pendukungVideoFileId: id })
                                          }
                                        />
                                      </div>
                                    )}

                                    {/* Foto file upload */}
                                    {item.pendukungLainnyaSourceType.includes("foto") && (
                                      <div className="mt-3">
                                        <MobileFileInput
                                          id={`pendukungFotoFile-${index}`}
                                          label="File Foto Pendukung"
                                          value={item.pendukungFotoFile}
                                          onChange={(file) => updateContentItem(index, { pendukungFotoFile: file })}
                                          accept=".jpg,.jpeg,.png,.gif,.webp"
                                          fileId={item.pendukungFotoFileId}
                                          onFileIdChange={(id) => updateContentItem(index, { pendukungFotoFileId: id })}
                                        />
                                      </div>
                                    )}

                                    {/* Lain-lain file upload */}
                                    {item.pendukungLainnyaSourceType.includes("lain-lain") && (
                                      <div className="mt-3">
                                        <MobileFileInput
                                          id={`pendukungLainLainFile-${index}`}
                                          label="File Lain-lain (Pendukung)"
                                          value={item.pendukungLainLainFile}
                                          onChange={(file) => updateContentItem(index, { pendukungLainLainFile: file })}
                                          fileId={item.pendukungLainLainFileId}
                                          onFileIdChange={(id) =>
                                            updateContentItem(index, { pendukungLainLainFileId: id })
                                          }
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Additional Notes Section */}
                                <div className="space-y-4">
                                  <div className="flex items-center space-x-2 mb-3">
                                    <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                                      <Heart className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <h4 className="font-semibold text-gray-800">Keterangan Tambahan</h4>
                                  </div>

                                  <Textarea
                                    value={item.keterangan}
                                    onChange={(e) => updateContentItem(index, { keterangan: e.target.value })}
                                    placeholder="Tambahkan keterangan atau catatan khusus untuk konten ini..."
                                    className="min-h-[80px] bg-white border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 rounded-xl resize-none"
                                  />
                                </div>
                              </div>
                            </motion.div>
                          </CollapsibleContent>
                        </Collapsible>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {currentStep === 4 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-6 space-y-6">
                <motion.h2 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
                  <Save className="h-5 w-5 text-blue-500" />
                  <span>Finalisasi</span>
                </motion.h2>

                <div className="space-y-4">
                  {/* Uploaded Bukti Mengetahui */}
                  <MobileFileInput
                    id="uploadedBuktiMengetahui"
                    label="Upload Bukti Mengetahui"
                    value={formData.uploadedBuktiMengetahui}
                    onChange={(file) => setFormData({ ...formData, uploadedBuktiMengetahui: file })}
                    accept=".pdf, .jpg, .jpeg, .png"
                  />

                  {/* No Comtab */}
                  <div className="space-y-2">
                    <Label htmlFor="noComtab" className="text-sm font-semibold text-gray-800 flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-purple-500" />
                      No Comtab
                    </Label>
                    <Input
                      type="text"
                      id="noComtab"
                      value={formData.noComtab}
                      onChange={(e) => setFormData({ ...formData, noComtab: e.target.value })}
                      placeholder="Masukkan No Comtab"
                      className="bg-white/70 backdrop-blur-sm border-gray-200 focus:border-indigo-500 text-sm"
                    />
                  </div>

                  {/* PIN Sandi */}
                  <div className="space-y-2">
                    <Label htmlFor="pinSandi" className="text-sm font-semibold text-gray-800 flex items-center">
                      <TargetIcon className="h-4 w-4 mr-2 text-green-500" />
                      PIN Sandi
                    </Label>
                    <Input
                      type="password"
                      id="pinSandi"
                      value={formData.pinSandi}
                      onChange={(e) => setFormData({ ...formData, pinSandi: e.target.value })}
                      placeholder="Masukkan PIN Sandi"
                      className="bg-white/70 backdrop-blur-sm border-gray-200 focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        currentStep={currentStep}
        totalSteps={4}
        onPrev={prevStep}
        onNext={nextStep}
        onSubmit={handleSubmit}
        isNextDisabled={isNextButtonDisabled}
        isSubmitDisabled={isSubmitDisabled}
        isSubmitting={isSubmitting}
        isEditMode={isEditMode}
      />

      {/* Confirmation Dialog */}
      <Dialog open={isSubmitConfirmOpen} onOpenChange={setIsSubmitConfirmOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-800">Konfirmasi Pengajuan</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Apakah Anda yakin ingin mengirim pengajuan ini?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsSubmitConfirmOpen(false)}>
              Batal
            </Button>
            <Button type="button" onClick={confirmSubmission} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <motion.div
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  />
                  <span>Mengirim...</span>
                </>
              ) : (
                "Kirim"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submission Success Dialog */}
      <Dialog open={isSubmissionSuccessOpen} onOpenChange={setIsSubmissionSuccessOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-green-800 flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <span>Pengajuan Berhasil!</span>
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Pengajuan Anda telah berhasil dikirim. Berikut adalah informasi login Anda:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">No Comtab</Label>
              <Input
                type="text"
                value={generatedCredentials?.noComtab || ""}
                readOnly
                className="bg-gray-100 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">PIN Sandi</Label>
              <Input
                type="text"
                value={generatedCredentials?.password || ""}
                readOnly
                className="bg-gray-100 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => {
                setIsSubmissionSuccessOpen(false)
                router.push("/mobile")
              }}
            >
              Selesai
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast Message */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            className={cn(
              "fixed bottom-16 left-4 right-4 sm:left-auto sm:right-8 z-50 p-3 rounded-xl shadow-lg border",
              toastMessage.type === "success" && "bg-green-50 border-green-200 text-green-700",
              toastMessage.type === "error" && "bg-red-50 border-red-200 text-red-700",
              toastMessage.type === "info" && "bg-blue-50 border-blue-200 text-blue-700",
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-sm">{toastMessage.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

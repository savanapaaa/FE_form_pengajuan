"use client"

import { useMemo } from "react"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Upload,
  CheckCircle,
  Trash2,
  Eye,
  History,
  Radio,
  Tv,
  Globe,
  Smartphone,
  Printer,
  Sparkles,
  Paperclip,
  TargetIcon,
  UserIcon,
  Plus,
  Minus,
  X,
  AlertTriangle,
  Bell,
  EyeOff,
  ChevronDown,
  ArrowLeftIcon,
  ArrowRightIcon,
  Save,
  ExternalLink,
  Mic,
  Crown,
  Zap,
  Calendar,
  Clock,
  PlayCircle,
  ImageIcon,
  VideoIcon,
  AudioWaveform,
  FileImage,
  Newspaper,
  Layers,
  Home,
  LogOut,
  Shield,
  ClipboardPlus,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useRouter, useSearchParams } from "next/navigation"
import { saveSubmissionsToStorage, loadSubmissionsFromStorage } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useResponsiveRedirect } from "@/hooks/use-responsive-redirect"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Import the FileData interface from lib/utils.ts for persisted data
import type { FileData as PersistedFileData, Submission } from "@/lib/utils"

// Define a FileData interface for form state (can include base64 for temporary preview)
interface FileDataForForm {
  name: string
  size: number
  type: string
  lastModified: number
  base64?: string // Temporary for preview, not persisted
  url?: string // Temporary for preview (data URI or blob URL), not persisted
}

// Function to create FileDataForForm object from a File (includes base64 for preview)
const createFileDataForPreview = async (file: File): Promise<FileDataForForm> => {
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    base64: base64,
    url: base64, // Use base64 as URL for preview
  }
}

// Function to create PersistedFileData object from a File (metadata only)
const createPersistedFileData = (file: File): PersistedFileData => {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
  }
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

  // These can be File (newly selected), FileDataForForm (for temporary preview), PersistedFileData (loaded from storage), or string (link)
  narasiFile: File | FileDataForForm | PersistedFileData | string | null
  suratFile: File | FileDataForForm | PersistedFileData | string | null
  audioDubbingFile: File | FileDataForForm | PersistedFileData | string | null
  audioDubbingLainLainFile: File | FileDataForForm | PersistedFileData | string | null
  audioBacksoundFile: File | FileDataForForm | PersistedFileData | string | null
  audioBacksoundLainLainFile: File | FileDataForForm | PersistedFileData | string | null
  pendukungVideoFile: File | FileDataForForm | PersistedFileData | string | null
  pendukungFotoFile: File | FileDataForForm | PersistedFileData | string | null
  pendukungLainLainFile: File | FileDataForForm | PersistedFileData | string | null

  // Add file ID fields
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

  // Add manual text fields for each file type
  narasiFileManualText?: string
  suratFileManualText?: string
  audioDubbingFileManualText?: string
  audioDubbingLainLainFileManualText?: string
  audioBacksoundFileManualText?: string
  audioBacksoundLainLainFileManualText?: string
  pendukungVideoFileManualText?: string
  pendukungFotoFileManualText?: string
  pendukungLainLainFileManualText?: string
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
  uploadedBuktiMengetahuiManualText?: string
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
    icon: Radio,
    channels: [
      { id: "videotron", label: "Videotron" },
      { id: "televisi", label: "Televisi" },
    ],
  },
  {
    id: "sosial-media",
    label: "Sosial Media",
    icon: Smartphone,
    channels: [
      { id: "instagram", label: "Instagram" },
      { id: "facebook", label: "Facebook" },
      { id: "youtube", label: "YouTube" },
    ],
  },
  {
    id: "cetak",
    label: "Media Cetak",
    icon: Printer,
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
  { id: "media-cetak", label: "Media Cetak", icon: Printer },
  { id: "media-online", label: "Media Online", icon: Globe },
  { id: "televisi", label: "Televisi", icon: Tv },
  { id: "radio", label: "Radio", icon: Radio },
]

interface FileOrLinkInputProps {
  id: string
  label: string
  value: File | FileDataForForm | PersistedFileData | string | null
  onChange: (newValue: File | string | null) => void
  accept?: string
  manualText?: string
  onManualTextChange?: (text: string) => void
  fileId?: string
  onFileIdChange?: (id: string) => void
}

const FileOrLinkInput = ({
  id,
  label,
  value,
  onChange,
  accept,
  manualText = "",
  onManualTextChange,
  fileId = "",
  onFileIdChange,
}: FileOrLinkInputProps) => {
  const isFileObject = value instanceof File
  const isFileDataForForm = typeof value === "object" && value !== null && "base64" in value
  const isPersistedFileData = typeof value === "object" && value !== null && !("base64" in value) && "name" in value
  const isLink = typeof value === "string"

  const [mode, setMode] = useState<"upload" | "link">(
    isFileObject || isFileDataForForm || isPersistedFileData ? "upload" : isLink ? "link" : "upload",
  )
  const [currentFileForDisplay, setCurrentFileForDisplay] = useState<FileDataForForm | PersistedFileData | null>(null)
  const [currentLink, setCurrentLink] = useState<string>(isLink ? value : "")
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [linkError, setLinkError] = useState<string>("")
  const [previewUrl, setPreviewUrl] = useState<string>("")

  const showToastMessage = (message: string, type: "success" | "error" | "info" = "info") => {
    // This is a simplified toast message for this component.
    // In a real app, you'd likely use a global toast context.
    alert(message)
  }

  // Validate URL format
  const validateUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // Check if file is an image
  const isImageFile = (file: File | FileDataForForm | PersistedFileData): boolean => {
    const type = file.type
    return type.startsWith("image/")
  }

  // Simulate file upload progress
  const simulateUploadProgress = async (file: File): Promise<FileDataForForm> => {
    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i)
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    const fileDataForPreview = await createFileDataForPreview(file)
    setIsUploading(false)
    setUploadProgress(0)
    return fileDataForPreview
  }

  useEffect(() => {
    if (isFileObject) {
      // For a new File object, create a temporary FileDataForForm for display
      createFileDataForPreview(value as File).then((fileData) => {
        setCurrentFileForDisplay(fileData)
        // Set preview URL for images
        if (isImageFile(value as File)) {
          setPreviewUrl(fileData.url || "")
        }
      })
      setCurrentLink("")
      setMode("upload")
    } else if (isLink) {
      setCurrentFileForDisplay(null)
      setCurrentLink(value)
      setMode("link")
      setPreviewUrl("")
    } else if (isFileDataForForm) {
      const fileData = value as FileDataForForm
      setCurrentFileForDisplay(fileData)
      setCurrentLink("")
      setMode("upload")
      // Set preview URL for images
      if (isImageFile(fileData)) {
        setPreviewUrl(fileData.url || "")
      }
    } else if (isPersistedFileData) {
      setCurrentFileForDisplay(value as PersistedFileData)
      setCurrentLink("")
      setMode("upload")
      setPreviewUrl("")
    } else {
      setCurrentFileForDisplay(null)
      setCurrentLink("")
      setMode("upload")
      setPreviewUrl("")
    }
  }, [value, isFileObject, isLink, isFileDataForForm, isPersistedFileData])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      const fileDataForPreview = await simulateUploadProgress(file)
      setCurrentFileForDisplay(fileDataForPreview)
      setCurrentLink("")
      // Set preview URL for images
      if (isImageFile(file)) {
        setPreviewUrl(fileDataForPreview.url || "")
      }
      onChange(file) // Pass the raw File object to parent
    } else {
      setCurrentFileForDisplay(null)
      setPreviewUrl("")
      onChange(null)
    }
  }
  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const link = e.target.value
    setCurrentLink(link)
    setCurrentFileForDisplay(null)
    setPreviewUrl("")

    // Validate URL
    if (link && !validateUrl(link)) {
      setLinkError("Format URL tidak valid. Contoh: https://example.com")
    } else {
      setLinkError("")
    }

    onChange(link)
  }

  const handleRemove = () => {
    setCurrentFileForDisplay(null)
    setCurrentLink("")
    setPreviewUrl("")
    setLinkError("")
    onChange(null)
  }

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      // Check if file matches accept criteria
      if (accept && !file.type.match(accept.replace(/\./g, "").replace(/,/g, "|"))) {
        showToastMessage(`Tipe file tidak didukung. Hanya menerima: ${accept}`, "error")
        return
      }

      const fileDataForPreview = await simulateUploadProgress(file)
      setCurrentFileForDisplay(fileDataForPreview)
      setCurrentLink("")
      // Set preview URL for images
      if (isImageFile(file)) {
        setPreviewUrl(fileDataForPreview.url || "")
      }
      onChange(file)
    }
  }

  let displayFileName = ""
  let displayFileUrl: string | undefined = undefined

  if (currentFileForDisplay) {
    displayFileName = currentFileForDisplay.name
    if ("url" in currentFileForDisplay && currentFileForDisplay.url) {
      displayFileUrl = currentFileForDisplay.url
    }
  } else if (isLink) {
    displayFileName = value as string
    displayFileUrl = value as string
  }

  const handleViewClick = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent default button behavior if it's inside a form
    if (displayFileUrl) {
      window.open(displayFileUrl, "_blank")
    } else {
      showToastMessage("Konten file tidak tersedia untuk pratinjau lokal. Hanya metadata yang disimpan.", "info")
    }
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>

      {/* File ID Input - placed at the top */}
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

      {/* Method Selection */}
      <div className="flex space-x-2 mb-2">
        <Button
          type="button"
          variant={mode === "upload" ? "default" : "outline"}
          onClick={() => {
            setMode("upload")
            setCurrentLink("")
            setLinkError("")
            if (isFileObject) {
              onChange(value as File)
            } else if (isFileDataForForm || isPersistedFileData) {
              onChange(null)
            } else {
              onChange(null)
            }
          }}
          className={cn(
            "flex-1",
            mode === "upload"
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
              : "bg-white/70 backdrop-blur-sm border-gray-200 hover:bg-indigo-50 hover:border-indigo-300",
          )}
        >
          <Upload className="h-4 w-4 mr-2" /> Unggah File
        </Button>
        <Button
          type="button"
          variant={mode === "link" ? "default" : "outline"}
          onClick={() => {
            setMode("link")
            setCurrentFileForDisplay(null)
            setPreviewUrl("")
            onChange(currentLink)
          }}
          className={cn(
            "flex-1",
            mode === "link"
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
              : "bg-white/70 backdrop-blur-sm border-gray-200 hover:bg-indigo-50 hover:border-indigo-300",
          )}
        >
          <Paperclip className="h-4 w-4 mr-2" /> Sediakan Tautan
        </Button>
      </div>

      {/* Upload Mode */}
      {mode === "upload" && (
        <div className="space-y-2">
          <input
            type="file"
            id={id}
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />

          {/* Drag and Drop Area */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-4 sm:p-6 text-center bg-white/50 backdrop-blur-sm",
              isDragOver ? "border-indigo-500 bg-indigo-50/50" : "border-gray-300 hover:border-gray-400",
              isUploading && "cursor-not-allowed opacity-50",
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <label
              htmlFor={id}
              className={cn(
                "cursor-pointer flex flex-col items-center space-y-1 sm:space-y-2",
                isUploading && "cursor-not-allowed",
              )}
            >
              <Upload className={cn("h-6 w-6 sm:h-8 sm:w-8", isDragOver ? "text-indigo-500" : "text-gray-400")} />
              <div className="text-xs sm:text-sm">
                <span className="font-medium text-gray-700">
                  {isDragOver ? "Lepas file di sini" : "Klik untuk memilih file"}
                </span>
                <p className="text-gray-500 text-xs">atau seret dan lepas file di sini</p>
              </div>
              {accept && <p className="text-xs text-gray-400">Format: {accept}</p>}
            </label>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Mengunggah...</span>
                <span className="text-gray-600">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* File Display */}
          {displayFileName && !isUploading && (
            <div className="space-y-2 sm:space-y-3">
              <div className="p-2 sm:p-3 bg-white/70 backdrop-blur-sm rounded-lg border border-gray-200 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium truncate">{displayFileName}</p>
                    {currentFileForDisplay && (
                      <p className="text-xs text-gray-500">{formatFileSize(currentFileForDisplay.size)}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemove}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Image Preview */}
              {previewUrl && currentFileForDisplay && isImageFile(currentFileForDisplay) && (
                <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-white/70 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm">
                  <Label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 block">Preview:</Label>
                  <div className="flex justify-center">
                    <img
                      src={previewUrl || "/placeholder.svg"}
                      alt="Preview"
                      className="max-w-full max-h-32 sm:max-h-48 object-contain rounded-lg shadow-sm"
                      onError={() => setPreviewUrl("")}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Link Mode */}
      {mode === "link" && (
        <div className="space-y-2">
          <Input
            type="text"
            value={currentLink}
            onChange={handleLinkChange}
            placeholder="Masukkan tautan file di sini"
            className={cn(
              "border-gray-200 focus:border-indigo-500 bg-white/70 backdrop-blur-sm text-xs sm:text-sm h-9 sm:h-10",
              linkError && "border-red-500 focus:border-red-500",
            )}
          />
          {linkError && (
            <p className="text-xs sm:text-sm text-red-600 flex items-center">
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              {linkError}
            </p>
          )}
          {currentLink && !linkError && (
            <div className="mt-2 p-2 bg-white/70 backdrop-blur-sm rounded-lg border border-gray-200 flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium truncate">{currentLink}</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(currentLink, "_blank")}
                  className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 h-7 w-7 p-0"
                >
                  <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
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

// Helper function to get file display name
const getFileDisplayName = (file: File | FileDataForForm | PersistedFileData | string | null): string => {
  if (!file) return "Tidak ada file"
  if (typeof file === "string") return file.length > 30 ? file.substring(0, 30) + "..." : file
  return file.name
}

// Helper function to check if content has files
const hasFiles = (item: FormContentItem): boolean => {
  return !!(
    item.narasiFile ||
    item.suratFile ||
    item.audioDubbingFile ||
    item.audioDubbingLainLainFile ||
    item.audioBacksoundFile ||
    item.audioBacksoundLainLainFile ||
    item.pendukungVideoFile ||
    item.pendukungFotoFile ||
    item.pendukungLainLainFile
  )
}

// Define a specific interface for contentTimelineErrors
interface ContentTimelineErrors {
  [itemId: string]: {
    orderMasuk?: boolean
    jadi?: boolean
    tayang?: boolean
  }
}

// Helper function to determine workflow stage
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

// Validation Dialog Component
const ValidationDialog = ({
  isOpen,
  onOpenChange,
  onConfirm,
  submissionData,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  submissionData: {
    tema: string
    judul: string
    totalItems: number
    petugasPelaksana: string
    supervisor: string
    contentTypes: string[]
  }
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md mx-4 rounded-2xl border-0 shadow-2xl bg-gradient-to-br from-white to-blue-50/30">
        <DialogHeader className="text-center pb-4">
          <motion.div
            className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            <CheckCircle className="h-10 w-10 text-white" />
          </motion.div>
          <DialogTitle className="text-2xl font-bold text-gray-900">Validasi Data</DialogTitle>
          <DialogDescription className="text-gray-600">
            Periksa kembali data pengajuan Anda sebelum mengirim.
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 mb-4"
        >
          <h4 className="font-bold text-gray-900 mb-3 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Ringkasan Pengajuan
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Tema:</span>
              <span className="font-semibold text-gray-900">{submissionData.tema}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Judul:</span>
              <span className="font-semibold text-gray-900 text-right max-w-[60%] truncate">
                {submissionData.judul}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Item:</span>
              <span className="font-semibold text-gray-900">{submissionData.totalItems}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Petugas:</span>
              <span className="font-semibold text-gray-900">{submissionData.petugasPelaksana}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Supervisor:</span>
              <span className="font-semibold text-gray-900">{submissionData.supervisor}</span>
            </div>
          </div>
        </motion.div>

        <DialogFooter className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-12 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
          >
            Periksa Lagi
          </Button>
          <motion.button
            onClick={onConfirm}
            className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Lanjutkan
          </motion.button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Enhanced Confirmation Dialog Component
const EnhancedConfirmationDialog = ({
  isOpen,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText,
  isLoading,
  submissionData,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title: string
  description: string
  confirmText: string
  isLoading: boolean
  submissionData: {
    judul: string
    totalItems: number
    petugasPelaksana: string
  }
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md mx-4 rounded-2xl border-0 shadow-2xl bg-gradient-to-br from-white to-orange-50/30">
        <DialogHeader className="text-center pb-4">
          <motion.div
            className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            <AlertTriangle className="h-10 w-10 text-white" />
          </motion.div>
          <DialogTitle className="text-2xl font-bold text-gray-900">{title}</DialogTitle>
          <DialogDescription className="text-gray-600">{description}</DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200 mb-4"
        >
          <h4 className="font-bold text-gray-900 mb-3 flex items-center">
            <Save className="h-5 w-5 mr-2 text-orange-600" />
            Detail Pengajuan
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Judul:</span>
              <span className="font-semibold text-gray-900 text-right max-w-[60%] truncate">
                {submissionData.judul}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Item:</span>
              <span className="font-semibold text-gray-900">{submissionData.totalItems}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Petugas:</span>
              <span className="font-semibold text-gray-900">{submissionData.petugasPelaksana}</span>
            </div>
          </div>
        </motion.div>

        <DialogFooter className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1 h-12 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
          >
            Batal
          </Button>
          <motion.button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 h-12 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            whileHover={!isLoading ? { scale: 1.02 } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
          >
            {isLoading ? (
              <>
                <motion.div
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                />
                Mengirim...
              </>
            ) : (
              confirmText
            )}
          </motion.button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Document Sent Dialog Component
const DocumentSentDialog = ({
  isOpen,
  onOpenChange,
  credentials,
  onClose,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  credentials: { noComtab: string; password: string } | null
  onClose: () => void
}) => {
  const router = useRouter()

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md mx-4 rounded-2xl border-0 shadow-2xl bg-gradient-to-br from-white to-green-50/30">
        <DialogHeader className="text-center pb-4">
          <motion.div
            className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            <CheckCircle className="h-10 w-10 text-white" />
          </motion.div>
          <DialogTitle className="text-2xl font-bold text-gray-900">Dokumen Terkirim!</DialogTitle>
          <DialogDescription className="text-gray-600">
            Pengajuan Anda telah berhasil dikirim dan sedang diproses.
          </DialogDescription>
        </DialogHeader>

        {credentials && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 mb-4"
          >
            <h4 className="font-bold text-gray-900 mb-3 flex items-center">
              <Crown className="h-5 w-5 mr-2 text-blue-600" />
              Informasi Akses Anda
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white/80 rounded-lg">
                <span className="text-sm font-medium text-gray-700">No. Comtab:</span>
                <span className="text-sm font-bold text-blue-600">{credentials.noComtab}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/80 rounded-lg">
                <span className="text-sm font-medium text-gray-700">PIN:</span>
                <span className="text-sm font-bold text-green-600">{credentials.password}</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-3 flex items-center">
              <AlertTriangle className="h-3 w-3 mr-1 text-orange-500" />
              Simpan informasi ini untuk melacak status pengajuan Anda
            </p>
          </motion.div>
        )}

        <DialogFooter className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => router.push("/history")}
            className="flex-1 h-12 border-2 border-blue-200 rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center space-x-2"
          >
            <History className="h-4 w-4" />
            <span>Lihat Riwayat</span>
          </Button>
          <motion.button
            onClick={onClose}
            className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <CheckCircle className="h-4 w-4" />
            <span>Selesai</span>
          </motion.button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Floating Orb Component - Fixed version
const FloatingOrb = ({
  delay = 0,
  duration = 30,
  size = "w-96 h-96",
  color = "bg-gradient-to-r from-blue-400/20 to-indigo-400/20",
  position = "top-0 left-0",
}: {
  delay?: number
  duration?: number
  size?: string
  color?: string
  position?: string
}) => (
  <motion.div
    className={`absolute rounded-full blur-3xl ${size} ${color} ${position}`}
    animate={{
      x: [0, 100, -50, 0],
      y: [0, -30, 30, 0],
      scale: [1, 0.8, 1.1, 1],
    }}
    transition={{
      duration: duration,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
      delay: delay,
    }}
  />
)

export default function PelayananPublikKomprehensif() {
  const router = useRouter()
// State untuk autentikasi
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminUser, setAdminUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Cek status autentikasi
  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem("adminLoggedIn")
      const adminUserData = localStorage.getItem("adminUser")

      if (isLoggedIn === "true" && adminUserData) {
        try {
          const userData = JSON.parse(adminUserData)
          if (userData.loginTime) {
            const loginTime = new Date(userData.loginTime)
            const now = new Date()
            const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60)

            // Check session validity (30 days if remember me, 24 hours otherwise)
            const sessionDuration = userData.rememberMe ? 24 * 30 : 24

            if (hoursDiff < sessionDuration) {
              setIsAuthenticated(true)
              setAdminUser(userData)
              setIsLoading(false)
              return
            }
          }
        } catch (error) {
          console.error("Error parsing admin user data:", error)
        }
      }

      // Clear invalid session and redirect to login
      handleLogout()
    }

    checkAuth()
  }, [router])

  // Handle logout
  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem("adminLoggedIn")
    localStorage.removeItem("adminUser")

    // Reset state
    setIsAuthenticated(false)
    setAdminUser(null)
    setIsLoading(true)

    // Redirect to login page
    router.push("/")
  }

  // Confirm logout
  const confirmLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin logout dari dashboard user?")) {
      handleLogout()
    }
  }

  const searchParams = useSearchParams()

  // Use responsive redirect hook
  const { isMobile, isInitialized } = useResponsiveRedirect({
    enableAutoRedirect: true,
    mobileBreakpoint: 768,
    preserveSearchParams: true,
  })

  /** prevents re-initialising edit-mode on every render */
  const [hasInitEditMode, setHasInitEditMode] = useState(false)

  const [isSubmissionSuccessOpen, setIsSubmissionSuccessOpen] = useState(false)
  const [generatedCredentials, setGeneratedCredentials] = useState<{ noComtab: string; password: string } | null>(null)
  const [showCopySuccess, setShowCopySuccess] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([])
  // Removed selectedMediaPemerintah and selectedMediaMassa from global state
  const [contentQuantities, setContentQuantities] = useState<Record<string, number>>({})
  const [openMediaCategories, setOpenMediaCategories] = useState<Record<string, boolean>>({})

  const [contentNameErrors, setContentNameErrors] = useState<Record<string, boolean>>({})
  // Use the defined interface for contentTimelineErrors
  const [contentTimelineErrors, setContentTimelineErrors] = useState<ContentTimelineErrors>({})

  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingSubmissionId, setEditingSubmissionId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isValidationDialogOpen, setIsValidationDialogOpen] = useState(false)
  const [isDocumentSentDialogOpen, setIsDocumentSentDialogOpen] = useState(false)

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

    // Initialize file ID fields with default values
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

    narasiFileManualText: "",
    suratFileManualText: "",
    audioDubbingFileManualText: "",
    audioDubbingLainLainFileManualText: "",
    audioBacksoundFileManualText: "",
    audioBacksoundLainLainFileManualText: "",
    pendukungVideoFileManualText: "",
    pendukungFotoFileManualText: "",
    pendukungLainLainFileManualText: "",
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
    uploadedBuktiMengetahuiManualText: "",
  })

  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [toastMessage, setToastMessage] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null)

  /** --------------------------------------------------------------
   * Initial data + (optional) edit-mode bootstrap – run **once**.
   * -------------------------------------------------------------- */
  useEffect(() => {
    if (hasInitEditMode) return // already done

    const storedSubmissions = loadSubmissionsFromStorage()
    setSubmissions(storedSubmissions)

    // Check for edit parameters in URL (only on first render)
    const editId = searchParams.get("editId")
    const editPin = searchParams.get("editPin")

    if (editId && editPin) {
      const submissionToEdit = storedSubmissions.find(
        (sub: Submission) => sub.noComtab === editId && sub.pin === editPin,
      )

      if (submissionToEdit) {
        loadSubmissionForEdit(submissionToEdit)
        showToastMessage("Mode edit diaktifkan! Anda dapat mengubah pengajuan ini.", "info")
      } else {
        showToastMessage("Pengajuan tidak ditemukan atau PIN salah!", "error")
        router.replace("/") // Remove wrong query params
      }
    }

    setHasInitEditMode(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // <-- empty deps -> runs once

  const loadSubmissionForEdit = (submission: Submission) => {
    setIsEditMode(true)
    setEditingSubmissionId(submission.id)

    // Convert ContentItem to FormContentItem
    const convertedContentItems: FormContentItem[] =
      submission.contentItems?.map((item) => ({
        ...item,
        // When loading from storage, these are PersistedFileData or string
        narasiFile: item.narasiFile || null,
        suratFile: item.suratFile || null,
        audioDubbingFile: item.audioDubbingFile || null,
        audioDubbingLainLainFile: item.audioDubbingLainLainFile || null,
        audioBacksoundFile: item.audioBacksoundFile || null,
        audioDubbingLainLainFile: item.audioDubbingLainLainFile || null,
        pendukungVideoFile: item.pendukungVideoFile || null,
        pendukungFotoFile: item.pendukungFotoFile || null,
        pendukungLainLainFile: item.pendukungLainLainFile || null,
        narasiSourceType: item.narasiSourceType || [],
        audioDubbingSourceType: item.audioDubbingSourceType || [],
        audioBacksoundSourceType: item.audioBacksoundSourceType || [],
        pendukungLainnyaSourceType: item.pendukungLainnyaSourceType || [],
        mediaPemerintah: item.mediaPemerintah || [], // Load mediaPemerintah for each item
        mediaMassa: item.mediaMassa || [], // Load mediaMassa for each item
      })) || []

    setFormData({
      tema: submission.tema || "",
      judul: submission.judul || "",
      contentItems: convertedContentItems,
      petugasPelaksana: submission.petugasPelaksana || "",
      supervisor: submission.supervisor || "",
      pinSandi: submission.pin || "",
      noComtab: submission.noComtab || "",
      uploadedBuktiMengetahui: submission.uploadedBuktiMengetahui || null,
      uploadedBuktiMengetahuiManualText: "",
    })

    // Set selected content types and quantities
    const contentTypes = [...new Set(convertedContentItems.map((item) => item.jenisKonten))]
    setSelectedContentTypes(contentTypes)

    const quantities: Record<string, number> = {}
    contentTypes.forEach((type) => {
      quantities[type] = convertedContentItems.filter((item) => item.jenisKonten === type).length
    })
    setContentQuantities(quantities)

    // Removed setting global selectedMediaPemerintah and selectedMediaMassa
    // Start from step 1 for editing to allow full editing
    setCurrentStep(1)
  }

  const showToastMessage = (message: string, type: "success" | "error" | "info" = "info") => {
    setToastMessage({ message, type })
    setTimeout(() => setToastMessage(null), 5000)
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setShowCopySuccess(true)
    setTimeout(() => setShowCopySuccess(false), 2000)
  }

  // Function to scroll to the top of the page
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.tema || !formData.judul || !formData.petugasPelaksana || !formData.supervisor) {
        showToastMessage("Harap lengkapi semua informasi dasar sebelum melanjutkan!", "error")
        return
      }
    }
    if (currentStep === 2) {
      if (selectedContentTypes.length === 0) {
        showToastMessage("Harap pilih setidaknya satu jenis konten!", "error")
        return
      }
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
      scrollToTop() // Scroll to top after changing step
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      scrollToTop() // Scroll to top after changing step
    }
  }

  const handleContentTypeChange = (contentType: string, checked: boolean) => {
    if (checked) {
      setSelectedContentTypes((prev) => [...prev, contentType])
      setContentQuantities((prev) => ({ ...prev, [contentType]: 1 }))

      // Auto-generate content item when a new type is selected
      const newItem: FormContentItem = {
        ...initialFormContentItemState,
        id: `${contentType}-1-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        jenisKonten: contentType,
        nama: generateContentTitle(contentType, formData.contentItems),
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

      // Remove all items of this content type
      setFormData((prev) => ({
        ...prev,
        contentItems: prev.contentItems.filter((item) => item.jenisKonten !== contentType),
      }))
    }
  }

  // Removed handleMediaPemerintahChange as it's now handled per content item

  // Helper function to get content type display name
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

  // Helper function to get content type icon
  const getContentTypeIcon = (jenisKonten: string) => {
    const iconMap: Record<string, React.ElementType> = {
      infografis: FileImage,
      "naskah-berita": Newspaper,
      audio: AudioWaveform,
      video: VideoIcon,
      fotografis: ImageIcon,
      bumper: PlayCircle,
    }
    return iconMap[jenisKonten] || FileText
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

  // Helper function to generate content title with number
  const generateContentTitle = (jenisKonten: string, existingItems: FormContentItem[]) => {
    const sameTypeItems = existingItems.filter((item) => item.jenisKonten === jenisKonten)
    const nextNumber = sameTypeItems.length + 1
    const displayName = getContentTypeDisplayName(jenisKonten)
    return `${displayName} ${nextNumber}`
  }

  const handleQuantityChange = (contentType: string, newQuantity: number) => {
    setContentQuantities((prev) => {
      const updatedQuantities = { ...prev }
      if (newQuantity > 0) {
        updatedQuantities[contentType] = newQuantity
      } else {
        delete updatedQuantities[contentType]
        return updatedQuantities
      }
      return updatedQuantities
    })

    // Auto-update content items based on new quantities
    setFormData((prev) => {
      const currentItems = prev.contentItems.filter((item) => item.jenisKonten !== contentType)
      const newItems: FormContentItem[] = []

      for (let i = 0; i < newQuantity; i++) {
        const existingItem = prev.contentItems.find(
          (item) => item.jenisKonten === contentType && item.id.includes(`${contentType}-${i + 1}-`),
        )

        if (existingItem) {
          // Keep existing item if it exists
          newItems.push(existingItem)
        } else {
          // Create new item
          const generatedTitle = `${getContentTypeDisplayName(contentType)} ${i + 1}`
          newItems.push({
            ...initialFormContentItemState,
            id: `${contentType}-${i + 1}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            jenisKonten: contentType,
            nama: generatedTitle,
          })
        }
      }

      return { ...prev, contentItems: [...currentItems, ...newItems] }
    })
  }

  async function submitPengajuanToApi(formData: FormData, url: string) {
    // Helper untuk format tanggal konten
    const formatTanggal = (date?: Date) =>
      date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:00` : null

    // Siapkan payload sesuai kebutuhan API
    const payload = {
      noComtab: formData.noComtab,
      pin: formData.pinSandi,
      tema: formData.tema,
      judul: formData.judul,
      jenisMedia: "digital",
      mediaPemerintah: JSON.stringify([]), // global, biasanya kosong
      mediaMassa: JSON.stringify([]),
      jenisKonten: JSON.stringify(formData.contentItems.map(item => item.jenisKonten)),
      tanggalOrder: new Date().toISOString(),
      petugasPelaksana: formData.petugasPelaksana,
      supervisor: formData.supervisor,
      durasi: "30 hari",
      jumlahProduksi: String(formData.contentItems.length),
      tanggalSubmit: new Date().toISOString(),
      uploadedBuktiMengetahui: JSON.stringify(formData.uploadedBuktiMengetahui),
      isConfirmed: true,
      workflowStage: "review",
      contentItems: formData.contentItems.map(item => ({
        id: item.id,
        nama: item.nama,
        jenisKonten: item.jenisKonten,
        mediaPemerintah: JSON.stringify(item.mediaPemerintah),
        mediaMassa: JSON.stringify(item.mediaMassa),
        nomorSurat: item.nomorSurat || null,
        narasiText: item.narasiText || null,
        sourceNarasi: JSON.stringify(item.sourceNarasi),
        sourceAudioDubbing: JSON.stringify(item.sourceAudioDubbing),
        sourceAudioBacksound: JSON.stringify(item.sourceAudioBacksound),
        sourcePendukungLainnya: JSON.stringify(item.sourcePendukungLainnya),
        narasiFile: item.narasiFile ? JSON.stringify(item.narasiFile) : "null",
        suratFile: item.suratFile ? JSON.stringify(item.suratFile) : "null",
        audioDubbingFile: item.audioDubbingFile ? JSON.stringify(item.audioDubbingFile) : "null",
        audioDubbingLainLainFile: item.audioDubbingLainLainFile ? JSON.stringify(item.audioDubbingLainLainFile) : "null",
        audioBacksoundFile: item.audioBacksoundFile ? JSON.stringify(item.audioBacksoundFile) : "null",
        audioBacksoundLainLainFile: item.audioBacksoundLainLainFile ? JSON.stringify(item.audioBacksoundLainLainFile) : "null",
        pendukungVideoFile: item.pendukungVideoFile ? JSON.stringify(item.pendukungVideoFile) : "null",
        pendukungFotoFile: item.pendukungFotoFile ? JSON.stringify(item.pendukungFotoFile) : "null",
        pendukungLainLainFile: item.pendukungLainLainFile ? JSON.stringify(item.pendukungLainLainFile) : "null",
        narasiFileId: item.narasiFileId || null,
        suratFileId: item.suratFileId || null,
        audioDubbingFileId: item.audioDubbingFileId || null,
        audioDubbingLainLainFileId: item.audioDubbingLainLainFileId || null,
        audioBacksoundFileId: item.audioBacksoundFileId || null,
        audioBacksoundLainLainFileId: item.audioBacksoundLainLainFileId || null,
        pendukungVideoFileId: item.pendukungVideoFileId || null,
        pendukungFotoFileId: item.pendukungFotoFileId || null,
        pendukungLainLainFileId: item.pendukungLainLainFileId || null,
        tanggalOrderMasuk: formatTanggal(item.tanggalOrderMasuk),
        tanggalJadi: formatTanggal(item.tanggalJadi),
        tanggalTayang: formatTanggal(item.tanggalTayang),
        keterangan: item.keterangan || null,
        status: item.status || "pending",
        narasiSourceType: JSON.stringify(item.narasiSourceType),
        audioDubbingSourceType: JSON.stringify(item.audioDubbingSourceType),
        audioBacksoundSourceType: JSON.stringify(item.audioBacksoundSourceType),
        pendukungLainnyaSourceType: JSON.stringify(item.pendukungLainnyaSourceType),
        narasiFileManualText: item.narasiFileManualText || null,
        suratFileManualText: item.suratFileManualText || null,
        audioDubbingFileManualText: item.audioDubbingFileManualText || null,
        audioDubbingLainLainFileManualText: item.audioDubbingLainLainFileManualText || null,
        audioBacksoundFileManualText: item.audioBacksoundFileManualText || null,
        audioBacksoundLainLainFileManualText: item.audioBacksoundLainLainFileManualText || null,
        pendukungVideoFileManualText: item.pendukungVideoFileManualText || null,
        pendukungFotoFileManualText: item.pendukungFotoFileManualText || null,
        pendukungLainLainFileManualText: item.pendukungLainLainFileManualText || null,
      }))
    }

    // Kirim data ke API
    const res = await fetch(`${url}/api/pengajuan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!res.ok) throw new Error("Gagal menyimpan pengajuan")
    return await res.json()
  }

  const confirmSubmission = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Validasi seperti sebelumnya
      const newContentNameErrors: Record<string, boolean> = {};
      let hasContentNameErrors = false;
      formData.contentItems.forEach((item) => {
        if (!item.nama || item.nama.trim() === "") {
          newContentNameErrors[item.id] = true;
          hasContentNameErrors = true;
        }
      });

      if (hasContentNameErrors) {
        setContentNameErrors(newContentNameErrors);
        showToastMessage("Nama konten wajib diisi!", "error");
        setCurrentStep(3);
        setIsSubmitConfirmOpen(false);
        return;
      }

      // Validasi tanggal timeline
      const newContentTimelineErrors: ContentTimelineErrors = {};
      let hasContentTimelineErrors = false;
      formData.contentItems.forEach((item) => {
        const itemErrors: { orderMasuk?: boolean; jadi?: boolean; tayang?: boolean } = {};
        if (!item.tanggalOrderMasuk) itemErrors.orderMasuk = true;
        if (!item.tanggalJadi) itemErrors.jadi = true;
        if (!item.tanggalTayang) itemErrors.tayang = true;
        if (Object.keys(itemErrors).length > 0) {
          newContentTimelineErrors[item.id] = itemErrors;
          hasContentTimelineErrors = true;
        }
      });

      if (hasContentTimelineErrors) {
        setContentTimelineErrors(newContentTimelineErrors);
        showToastMessage("Lengkapi tanggal konten!", "error");
        setCurrentStep(3);
        setIsSubmitConfirmOpen(false);
        return;
      }

      // Validasi bukti mengetahui
      if (!formData.uploadedBuktiMengetahui) {
        showToastMessage("Bukti Mengetahui wajib diisi!", "error");
        setIsSubmitConfirmOpen(false);
        return;
      }

      // Validasi Comtab dan PIN
      if (!formData.noComtab?.trim() || !formData.pinSandi?.trim()) {
        showToastMessage("No Comtab dan PIN wajib diisi!", "error");
        setCurrentStep(4);
        setIsSubmitConfirmOpen(false);
        return;
      }

      // Cek duplikat No Comtab jika pengajuan baru
      if (!isEditMode) {
        const isDuplicate = submissions.some((s) => s.noComtab === formData.noComtab);
        if (isDuplicate) {
          showToastMessage("No Comtab sudah digunakan!", "error");
          setCurrentStep(4);
          setIsSubmitConfirmOpen(false);
          return;
        }
      }

      // 🔄 Panggil API jika pengajuan baru
      if (!isEditMode) {
        const response = await submitPengajuanToApi(formData, process.env.NEXT_PUBLIC_API_URL!); // <- pastikan API URL di env

        showToastMessage("Pengajuan berhasil dikirim!", "success");
        setGeneratedCredentials({
          noComtab: response.no_comtab,
          password: response.pin_sandi,
        });
        setIsDocumentSentDialogOpen(true);
      }

      // TODO: Tambahkan else { ... } jika kamu ingin menyesuaikan juga untuk mode edit.

      // Reset form setelah berhasil
      setFormData({
        tema: "",
        judul: "",
        contentItems: [],
        petugasPelaksana: "",
        supervisor: "",
        pinSandi: "",
        noComtab: "",
        uploadedBuktiMengetahui: null,
        uploadedBuktiMengetahuiManualText: "",
      });
      setSelectedContentTypes([]);
      setContentQuantities({});
      setOpenMediaCategories({});
      setCurrentStep(1);
      setContentNameErrors({});
      setContentTimelineErrors({});
    } catch (error) {
      console.error("Submission error:", error);
      showToastMessage("Gagal mengirim pengajuan ke server!", "error");
    } finally {
      setIsSubmitting(false);
      setIsSubmitConfirmOpen(false);
    }
  };

  const handleSubmit = () => {
    const baseValidation =
      !formData.tema ||
      !formData.judul ||
      !formData.petugasPelaksana ||
      !formData.supervisor ||
      formData.contentItems.length === 0

    const buktiMengetahuiValidation = !formData.uploadedBuktiMengetahui
    const hasEmptyContentNames = formData.contentItems.some((item) => !item.nama || item.nama.trim() === "")
    const hasEmptyTimelineDates = formData.contentItems.some(
      (item) => !item.tanggalOrderMasuk || !item.tanggalJadi || !item.tanggalTayang,
    )
    const comtabAndPinRequired =
      !formData.noComtab || formData.noComtab.trim() === "" || !formData.pinSandi || formData.pinSandi.trim() === ""

    if (
      baseValidation ||
      buktiMengetahuiValidation ||
      hasEmptyContentNames ||
      hasEmptyTimelineDates ||
      comtabAndPinRequired
    ) {
      if (baseValidation) {
        showToastMessage("Harap lengkapi semua informasi dasar!", "error")
        setCurrentStep(1)
      } else if (hasEmptyContentNames || hasEmptyTimelineDates) {
        showToastMessage("Harap lengkapi detail konten dan timeline!", "error")
        setCurrentStep(3)
      } else if (buktiMengetahuiValidation) {
        showToastMessage("Bukti Mengetahui wajib diisi!", "error")
        setCurrentStep(4)
      } else if (comtabAndPinRequired) {
        showToastMessage("No Comtab dan PIN wajib diisi!", "error")
        setCurrentStep(4)
      }
      return
    }

    // Open validation dialog instead of confirmation dialog
    setIsValidationDialogOpen(true)
  }

  const isSubmitDisabled = useMemo(() => {
    const baseValidation =
      !formData.tema ||
      !formData.judul ||
      !formData.petugasPelaksana ||
      !formData.supervisor ||
      formData.contentItems.length === 0

    const buktiMengetahuiValidation = !formData.uploadedBuktiMengetahui
    const hasEmptyContentNames = formData.contentItems.some((item) => !item.nama || item.nama.trim() === "")
    const hasEmptyTimelineDates = formData.contentItems.some(
      (item) => !item.tanggalOrderMasuk || !item.tanggalJadi || !item.tanggalTayang,
    )
    const comtabAndPinRequired =
      !formData.noComtab || formData.noComtab.trim() === "" || !formData.pinSandi || formData.pinSandi.trim() === ""

    // Add duplicate check only for new submissions
    const isDuplicateNoComtab =
      !isEditMode && submissions.some((sub) => sub.noComtab === formData.noComtab && formData.noComtab.trim() !== "")

    return (
      baseValidation ||
      buktiMengetahuiValidation ||
      hasEmptyContentNames ||
      hasEmptyTimelineDates ||
      comtabAndPinRequired ||
      isDuplicateNoComtab ||
      isSubmitting
    )
  }, [
    formData.tema,
    formData.judul,
    formData.petugasPelaksana,
    formData.supervisor,
    formData.contentItems,
    formData.uploadedBuktiMengetahui,
    formData.noComtab,
    formData.pinSandi,
    submissions,
    isEditMode,
    isSubmitting,
  ])

  const isNextButtonDisabled = useMemo(() => {
    switch (currentStep) {
      case 1:
        return !formData.tema || !formData.judul || !formData.petugasPelaksana || !formData.supervisor
      case 2:
        return selectedContentTypes.length === 0
      case 3:
        if (formData.contentItems.length === 0) {
          return true
        }
        const hasEmptyContentNames = formData.contentItems.some((item) => !item.nama || item.nama.trim() === "")
        const hasEmptyTimelineDates = formData.contentItems.some(
          (item) => !item.tanggalOrderMasuk || !item.tanggalJadi || !item.tanggalTayang,
        )
        return hasEmptyContentNames || hasEmptyTimelineDates
      default:
        return false
    }
  }, [currentStep, formData, selectedContentTypes])

  const cancelEdit = () => {
    setIsEditMode(false)
    setEditingSubmissionId(null)
    router.replace("/") // Remove query params

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
      uploadedBuktiMengetahuiManualText: "",
    })
    setSelectedContentTypes([])
    // Removed resetting selectedMediaPemerintah and selectedMediaMassa
    setContentQuantities({})
    setOpenMediaCategories({})
    setCurrentStep(1)
    setContentNameErrors({})
    setContentTimelineErrors({})

    showToastMessage("Mode edit dibatalkan", "info")
  }

  const updateContentItem = (index: number, updatedValues: Partial<FormContentItem>) => {
    setFormData((prev) => {
      const newContentItems = [...prev.contentItems]
      newContentItems[index] = { ...newContentItems[index], ...updatedValues }
      return { ...prev, contentItems: newContentItems }
    })
  }

  // Don't render anything if not initialized (ResponsiveLayoutWrapper will handle loading)
  if (!isInitialized) {
    return null
  }

  return (
    <TooltipProvider>
      <motion.div
        className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <motion.div
            className="absolute -top-40 -right-40 w-60 sm:w-80 h-60 sm:h-80 bg-gradient-to-r from-indigo-300/30 to-purple-300/30 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-60 sm:w-80 h-60 sm:h-80 bg-gradient-to-r from-blue-300/30 to-cyan-300/30 rounded-full blur-3xl"
            animate={{
              x: [0, -100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 25,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-40 sm:w-60 h-40 sm:h-60 bg-gradient-to-r from-emerald-300/20 to-teal-300/20 rounded-full blur-3xl"
            animate={{
              x: [0, 50, -50, 0],
              y: [0, -30, 30, 0],
              scale: [1, 0.8, 1.1, 1],
            }}
            transition={{
              duration: 30,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        </div>
        {/* Header */}
        <motion.div
          className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg sticky top-0 z-50 relative"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <motion.header
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative z-10 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm sticky top-0"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
              <div className="flex items-center justify-between">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center space-x-2 sm:space-x-4"
                >
                  <motion.div
                    whileHover={{ rotate: 15 }}
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
                  >
                    <ClipboardPlus className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Pengajuan
                    </h1>
                  </div>
                </motion.div>

                {/* Desktop Navigation */}
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="hidden sm:flex items-center space-x-3"
                >
                  {isEditMode ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={cancelEdit}
                      className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-300"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Batal Edit
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push("/history")}
                        className="hover:bg-blue-50 hover:border-blue-200 transition-all duration-300"
                      >
                        <History className="h-4 w-4 mr-2" />
                        Riwayat
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={confirmLogout}
                        className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-300"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  )}
                </motion.div>

                {/* Mobile Navigation - Icon Only */}
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex sm:hidden items-center space-x-2"
                >
                  {isEditMode ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={cancelEdit}
                      className="border-red-200 text-red-600 hover:bg-red-50 p-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push("/history")}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 p-2"
                      >
                        <History className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={confirmLogout}
                        className="border-red-200 text-red-600 hover:bg-red-50 p-2"
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.header>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          className="bg-white/60 backdrop-blur-sm border-b border-white/20"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 sm:py-4">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-xs sm:text-sm font-medium text-gray-600">Langkah {currentStep} dari 4</span>
              <span className="text-xs sm:text-sm font-medium text-indigo-600">
                {Math.round((currentStep / 4) * 100)}% Selesai
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 overflow-hidden">
              <motion.div
                className="h-1.5 sm:h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-sm"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / 4) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <motion.div
                  className="relative"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-2xl relative overflow-hidden">
                    {/* Card Header Decoration */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                    <CardContent className="p-4 sm:p-8">
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="mb-6 sm:mb-8"
                      >
                        <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                          <motion.div
                            className="relative"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                              <UserIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                            </div>
                            <motion.div
                              className="absolute -top-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center justify-center"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                            >
                              <Sparkles className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
                            </motion.div>
                          </motion.div>
                          <div>
                            <h2 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                              Informasi Dasar
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                              Lengkapi informasi dasar pengajuan Anda dengan detail yang akurat
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                        {/* Tema Dropdown - Enhanced */}
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="space-y-2 sm:space-y-3"
                        >
                          <Label
                            htmlFor="tema"
                            className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center"
                          >
                            <TargetIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-indigo-500" />
                            Tema <span className="text-red-500 ml-1">*</span>
                          </Label>
                          <Select
                            value={formData.tema}
                            onValueChange={(value) => setFormData((prev) => ({ ...prev, tema: value }))}
                          >
                            <SelectTrigger className="h-10 sm:h-14 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 hover:shadow-lg transition-all duration-300 rounded-xl text-xs sm:text-sm">
                              <SelectValue placeholder="🎯 Pilih tema pengajuan Anda" />
                            </SelectTrigger>

                            <SelectContent className="bg-white/95 backdrop-blur-xl border-white/30 shadow-2xl rounded-xl">
                              <SelectItem
                                value="sosial"
                                className="hover:bg-indigo-50 focus:bg-indigo-50 rounded-lg m-1 transition-all duration-200"
                              >
                                <div className="flex items-center space-x-2 sm:space-x-3 py-1 sm:py-2">
                                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-red-400 to-pink-400 rounded-lg flex items-center justify-center">
                                    <span className="text-white text-xs sm:text-sm">🏥</span>
                                  </div>
                                  <div>
                                    <div className="font-medium text-xs sm:text-sm">Sosial</div>
                                    <div className="text-xs text-gray-500 hidden sm:block">
                                      Kesehatan masyarakat, layanan sosial
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                              <SelectItem
                                value="ekonomi"
                                className="hover:bg-indigo-50 focus:bg-indigo-50 rounded-lg m-1 transition-all duration-200"
                              >
                                <div className="flex items-center space-x-2 sm:space-x-3 py-1 sm:py-2">
                                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg flex items-center justify-center">
                                    <span className="text-white text-xs sm:text-sm">💰</span>
                                  </div>
                                  <div>
                                    <div className="font-medium text-xs sm:text-sm">Ekonomi & Bisnis</div>
                                    <div className="text-xs text-gray-500 hidden sm:block">
                                      UMKM, perdagangan, investasi
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                              <SelectItem
                                value="lingkungan"
                                className="hover:bg-indigo-50 focus:bg-indigo-50 rounded-lg m-1 transition-all duration-200"
                              >
                                <div className="flex items-center space-x-2 sm:space-x-3 py-1 sm:py-2">
                                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white text-xs sm:text-sm">🌱</span>
                                  </div>
                                  <div>
                                    <div className="font-medium text-xs sm:text-sm">Lingkungan & Alam</div>
                                    <div className="text-xs text-gray-500 hidden sm:block">
                                      Konservasi, kebersihan, go green
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </motion.div>

                        {/* Enhanced other inputs */}
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="space-y-2 sm:space-y-3"
                        >
                          <Label
                            htmlFor="judul"
                            className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center"
                          >
                            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-purple-500" />
                            Judul <span className="text-red-500 ml-1">*</span>
                          </Label>
                          <Input
                            id="judul"
                            value={formData.judul}
                            onChange={(e) => setFormData((prev) => ({ ...prev, judul: e.target.value }))}
                            placeholder="✨ Masukkan judul pengajuan yang menarik"
                            className="h-10 sm:h-14 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 hover:shadow-lg transition-all duration-300 rounded-xl text-xs sm:text-sm"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.4 }}
                          className="space-y-2 sm:space-y-3"
                        >
                          <Label
                            htmlFor="petugasPelaksana"
                            className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center"
                          >
                            <UserIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-emerald-500" />
                            Petugas Pelaksana <span className="text-red-500 ml-1">*</span>
                          </Label>
                          <Input
                            id="petugasPelaksana"
                            value={formData.petugasPelaksana}
                            onChange={(e) => setFormData((prev) => ({ ...prev, petugasPelaksana: e.target.value }))}
                            placeholder="👤 Nama petugas yang bertanggung jawab"
                            className="h-10 sm:h-14 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 hover:shadow-lg transition-all duration-300 rounded-xl text-xs sm:text-sm"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="space-y-2 sm:space-y-3"
                        >
                          <Label
                            htmlFor="supervisor"
                            className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center"
                          >
                            <Crown className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-blue-500" />
                            Supervisor <span className="text-red-500 ml-1">*</span>
                          </Label>
                          <Input
                            id="supervisor"
                            value={formData.supervisor}
                            onChange={(e) => setFormData((prev) => ({ ...prev, supervisor: e.target.value }))}
                            placeholder="👨‍💼 Nama supervisor yang mengawasi"
                            className="h-10 sm:h-14 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 hover:shadow-lg transition-all duration-300 rounded-xl text-xs sm:text-sm"
                          />
                        </motion.div>
                      </div>

                      {/* Progress Indicator */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-6 sm:mt-8 p-3 sm:p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100"
                      >
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-indigo-500 rounded-full animate-pulse" />
                            <span className="text-indigo-700 font-medium">Langkah 1 dari 4</span>
                          </div>
                          <span className="text-gray-600">Informasi Dasar</span>
                        </div>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 2: Content Type Selection */}
              {currentStep === 2 && (
                <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
                  <CardContent className="p-4 sm:p-8">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="mb-6 sm:mb-8"
                    >
                      <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <TargetIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-lg sm:text-2xl font-bold text-gray-800">Pilih Jenis Konten</h2>
                          <p className="text-xs sm:text-sm text-gray-600">Tentukan jenis konten yang akan diproduksi</p>
                        </div>
                      </div>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                      {[
                        { id: "infografis", label: "Infografis", icon: FileText, color: "from-blue-500 to-cyan-500" },
                        {
                          id: "naskah-berita",
                          label: "Naskah Berita",
                          icon: FileText,
                          color: "from-green-500 to-emerald-500",
                        },
                        { id: "audio", label: "Audio", icon: Mic, color: "from-purple-500 to-pink-500" },
                        { id: "video", label: "Video", icon: Tv, color: "from-red-500 to-orange-500" },
                        { id: "fotografis", label: "Fotografis", icon: Eye, color: "from-yellow-500 to-amber-500" },
                        { id: "bumper", label: "Bumper", icon: Zap, color: "from-indigo-500 to-purple-500" },
                      ].map((contentType, index) => (
                        <motion.div
                          key={contentType.id}
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.1 * (index + 1) }}
                          className={cn(
                            "relative p-3 sm:p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 bg-white/50 backdrop-blur-sm",
                            selectedContentTypes.includes(contentType.id)
                              ? "border-indigo-500 bg-indigo-50/50 shadow-lg scale-105"
                              : "border-gray-200 hover:border-gray-300 hover:shadow-md",
                          )}
                          onClick={() =>
                            handleContentTypeChange(contentType.id, !selectedContentTypes.includes(contentType.id))
                          }
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                            <div
                              className={cn(
                                "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center bg-gradient-to-r",
                                contentType.color,
                              )}
                            >
                              <contentType.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                            </div>
                            <h3 className="font-semibold text-sm sm:text-base text-gray-800">{contentType.label}</h3>
                          </div>

                          {selectedContentTypes.includes(contentType.id) && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="space-y-2 sm:space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <Label className="text-xs sm:text-sm font-medium text-gray-700">Jumlah:</Label>
                                <div className="flex items-center space-x-1 sm:space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      const currentQuantity = contentQuantities[contentType.id] || 1
                                      if (currentQuantity > 1) {
                                        handleQuantityChange(contentType.id, currentQuantity - 1)
                                      }
                                    }}
                                    className="h-6 w-6 sm:h-8 sm:w-8 p-0 bg-white/70 backdrop-blur-sm"
                                  >
                                    <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </Button>
                                  <span className="w-6 sm:w-8 text-center font-medium text-xs sm:text-sm">
                                    {contentQuantities[contentType.id] || 1}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      const currentQuantity = contentQuantities[contentType.id] || 1
                                      handleQuantityChange(contentType.id, currentQuantity + 1)
                                    }}
                                    className="h-6 w-6 sm:h-8 sm:w-8 p-0 bg-white/70 backdrop-blur-sm"
                                  >
                                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          )}

                          {selectedContentTypes.includes(contentType.id) && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-2 right-2 sm:top-3 sm:right-3"
                            >
                              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-500" />
                            </motion.div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Content Details - Enhanced */}
              {currentStep === 3 && (
                <div className="space-y-6 sm:space-y-8">
                  {formData.contentItems.map((item, index) => {
                    const ContentIcon = getContentTypeIcon(item.jenisKonten)
                    const contentColor = getContentTypeColor(item.jenisKonten)

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-2xl relative overflow-hidden">
                          {/* Enhanced Header with gradient decoration */}
                          <div
                            className={cn("absolute top-0 left-0 right-0 h-1 sm:h-2 bg-gradient-to-r", contentColor)}
                          />

                          <CardContent className="p-4 sm:p-8">
                            {/* Enhanced Header Section */}
                            <motion.div
                              initial={{ y: 10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.2 }}
                              className="mb-6 sm:mb-8"
                            >
                              <div className="flex items-center justify-between mb-4 sm:mb-6">
                                <div className="flex items-center space-x-3 sm:space-x-4">
                                  <motion.div
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                    className={cn(
                                      "w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center bg-gradient-to-r shadow-lg",
                                      contentColor,
                                    )}
                                  >
                                    <ContentIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                                  </motion.div>
                                  <div>
                                    <h3 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center space-x-2">
                                      <span>{getContentTypeDisplayName(item.jenisKonten)}</span>
                                      <Badge className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border-indigo-200 font-semibold text-xs">
                                        #{index + 1}
                                      </Badge>
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1 flex items-center">
                                      <Layers className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-indigo-500" />
                                      Detail konten dan timeline produksi
                                    </p>
                                  </div>
                                </div>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold border-2",
                                    "bg-gradient-to-r from-white/80 to-gray-50/80 backdrop-blur-sm",
                                  )}
                                >
                                  {getContentTypeDisplayName(item.jenisKonten)}
                                </Badge>
                              </div>
                            </motion.div>

                            {/* Enhanced Basic Information Section */}
                            <motion.div
                              initial={{ y: 10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.3 }}
                              className="mb-6 sm:mb-8"
                            >
                              <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-blue-100/50">
                                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-blue-600" />
                                  Informasi Dasar
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                  {/* Nama Konten */}
                                  <div className="space-y-2 sm:space-y-3">
                                    <Label
                                      htmlFor={`nama-${item.id}`}
                                      className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center"
                                    >
                                      Nama Konten <span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <Input
                                      id={`nama-${item.id}`}
                                      value={item.nama}
                                      onChange={(e) => {
                                        updateContentItem(index, { nama: e.target.value })
                                        if (contentNameErrors[item.id]) {
                                          setContentNameErrors((prev) => {
                                            const newErrors = { ...prev }
                                            delete newErrors[item.id]
                                            return newErrors
                                          })
                                        }
                                      }}
                                      placeholder="Masukkan nama konten yang deskriptif"
                                      className={cn(
                                        "h-9 sm:h-12 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-sm",
                                        contentNameErrors[item.id] &&
                                          "border-red-500 focus:border-red-500 bg-red-50/50",
                                      )}
                                    />
                                    {contentNameErrors[item.id] && (
                                      <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-xs sm:text-sm text-red-600 flex items-center bg-red-50 p-1.5 sm:p-2 rounded-lg"
                                      >
                                        <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                        Nama konten wajib diisi
                                      </motion.p>
                                    )}
                                  </div>

                                  {/* Nomor Surat */}
                                  <div className="space-y-2 sm:space-y-3">
                                    <Label
                                      htmlFor={`nomorSurat-${item.id}`}
                                      className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center"
                                    >
                                      Nomor Surat
                                    </Label>
                                    <Input
                                      id={`nomorSurat-${item.id}`}
                                      value={item.nomorSurat}
                                      onChange={(e) => updateContentItem(index, { nomorSurat: e.target.value })}
                                      placeholder="Masukkan nomor surat jika ada"
                                      className="h-9 sm:h-12 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-sm"
                                    />
                                  </div>
                                </div>
                              </div>
                            </motion.div>

                            {/* Enhanced Media Selection */}
                            <motion.div
                              initial={{ y: 10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.4 }}
                              className="mb-6 sm:mb-8"
                            >
                              <div className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-purple-100/50">
                                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                                  <Radio className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-purple-600" />
                                  Pemilihan Media
                                </h4>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                  {/* Media Pemerintah */}
                                  <div className="space-y-3 sm:space-y-4">
                                    <Label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center">
                                      <Globe className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-blue-600" />
                                      Media Pemerintah
                                    </Label>
                                    <div className="space-y-2 sm:space-y-3">
                                      {mediaPemerintahCategories.map((category) => (
                                        <Collapsible
                                          key={category.id}
                                          open={openMediaCategories[`${item.id}-pemerintah-${category.id}`]}
                                          onOpenChange={(open) =>
                                            setOpenMediaCategories((prev) => ({
                                              ...prev,
                                              [`${item.id}-pemerintah-${category.id}`]: open,
                                            }))
                                          }
                                        >
                                          <CollapsibleTrigger asChild>
                                            <Button
                                              variant="outline"
                                              className="w-full justify-between h-9 sm:h-12 bg-white/70 backdrop-blur-sm border-gray-200 hover:bg-blue-50 hover:border-blue-300 rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-sm"
                                            >
                                              <div className="flex items-center space-x-2">
                                                <category.icon className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                                                <span>{category.label}</span>
                                              </div>
                                              <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-200" />
                                            </Button>
                                          </CollapsibleTrigger>
                                          <CollapsibleContent className="mt-2 sm:mt-3">
                                            <div className="space-y-1.5 sm:space-y-2 pl-2 sm:pl-4">
                                              {category.channels?.map((channel) => (
                                                <label
                                                  key={channel.id}
                                                  className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-white/60 backdrop-blur-sm rounded-lg hover:bg-blue-50 transition-all duration-200 cursor-pointer"
                                                >
                                                  <input
                                                    type="checkbox"
                                                    checked={item.mediaPemerintah.includes(channel.id)}
                                                    onChange={(e) => {
                                                      const newMediaPemerintah = e.target.checked
                                                        ? [...item.mediaPemerintah, channel.id]
                                                        : item.mediaPemerintah.filter((id) => id !== channel.id)
                                                      updateContentItem(index, { mediaPemerintah: newMediaPemerintah })
                                                    }}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                  />
                                                  <span className="text-xs sm:text-sm text-gray-700 font-medium">
                                                    {channel.label}
                                                  </span>
                                                </label>
                                              ))}
                                            </div>
                                          </CollapsibleContent>
                                        </Collapsible>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Media Massa */}
                                  <div className="space-y-3 sm:space-y-4">
                                    <Label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center">
                                      <Newspaper className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-green-600" />
                                      Media Massa
                                    </Label>
                                    <div className="space-y-1.5 sm:space-y-2">
                                      {mediaMassaChannels.map((channel) => (
                                        <label
                                          key={channel.id}
                                          className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-white/60 backdrop-blur-sm rounded-lg hover:bg-green-50 transition-all duration-200 cursor-pointer"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={item.mediaMassa.includes(channel.id)}
                                            onChange={(e) => {
                                              const newMediaMassa = e.target.checked
                                                ? [...item.mediaMassa, channel.id]
                                                : item.mediaMassa.filter((id) => id !== channel.id)
                                              updateContentItem(index, { mediaMassa: newMediaMassa })
                                            }}
                                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                          />
                                          <div className="flex items-center space-x-2">
                                            <channel.icon className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                                            <span className="text-xs sm:text-sm text-gray-700 font-medium">
                                              {channel.label}
                                            </span>
                                          </div>
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>

                            {/* Enhanced Timeline Section */}
                            <motion.div
                              initial={{ y: 10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.5 }}
                              className="mb-6 sm:mb-8"
                            >
                              <div className="bg-gradient-to-r from-emerald-50/50 to-teal-50/50 rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-emerald-100/50">
                                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-emerald-600" />
                                  Timeline Produksi
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                                  {/* Tanggal Order Masuk */}
                                  <div className="space-y-2 sm:space-y-3">
                                    <Label
                                      htmlFor={`tanggalOrderMasuk-${item.id}`}
                                      className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center"
                                    >
                                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-blue-600" />
                                      Tanggal Order Masuk <span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <Input
                                      id={`tanggalOrderMasuk-${item.id}`}
                                      type="date"
                                      value={item.tanggalOrderMasuk ? format(item.tanggalOrderMasuk, "yyyy-MM-dd") : ""}
                                      onChange={(e) => {
                                        const date = e.target.value ? new Date(e.target.value) : undefined
                                        updateContentItem(index, { tanggalOrderMasuk: date })
                                        if (contentTimelineErrors[item.id]?.orderMasuk) {
                                          setContentTimelineErrors((prev) => {
                                            const newErrors = { ...prev }
                                            if (newErrors[item.id]) {
                                              delete newErrors[item.id].orderMasuk
                                              if (Object.keys(newErrors[item.id]).length === 0) {
                                                delete newErrors[item.id]
                                              }
                                            }
                                            return newErrors
                                          })
                                        }
                                      }}
                                      className={cn(
                                        "h-9 sm:h-12 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-sm",
                                        contentTimelineErrors[item.id]?.orderMasuk &&
                                          "border-red-500 focus:border-red-500 bg-red-50/50",
                                      )}
                                    />
                                    {contentTimelineErrors[item.id]?.orderMasuk && (
                                      <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-xs sm:text-sm text-red-600 flex items-center bg-red-50 p-1.5 sm:p-2 rounded-lg"
                                      >
                                        <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                        Tanggal wajib diisi
                                      </motion.p>
                                    )}
                                  </div>

                                  {/* Tanggal Jadi */}
                                  <div className="space-y-2 sm:space-y-3">
                                    <Label
                                      htmlFor={`tanggalJadi-${item.id}`}
                                      className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center"
                                    >
                                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-green-600" />
                                      Tanggal Jadi <span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <Input
                                      id={`tanggalJadi-${item.id}`}
                                      type="date"
                                      value={item.tanggalJadi ? format(item.tanggalJadi, "yyyy-MM-dd") : ""}
                                      onChange={(e) => {
                                        const date = e.target.value ? new Date(e.target.value) : undefined
                                        updateContentItem(index, { tanggalJadi: date })
                                        if (contentTimelineErrors[item.id]?.jadi) {
                                          setContentTimelineErrors((prev) => {
                                            const newErrors = { ...prev }
                                            if (newErrors[item.id]) {
                                              delete newErrors[item.id].jadi
                                              if (Object.keys(newErrors[item.id]).length === 0) {
                                                delete newErrors[item.id]
                                              }
                                            }
                                            return newErrors
                                          })
                                        }
                                      }}
                                      className={cn(
                                        "h-9 sm:h-12 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-sm",
                                        contentTimelineErrors[item.id]?.jadi &&
                                          "border-red-500 focus:border-red-500 bg-red-50/50",
                                      )}
                                    />
                                    {contentTimelineErrors[item.id]?.jadi && (
                                      <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-xs sm:text-sm text-red-600 flex items-center bg-red-50 p-1.5 sm:p-2 rounded-lg"
                                      >
                                        <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                        Tanggal wajib diisi
                                      </motion.p>
                                    )}
                                  </div>

                                  {/* Tanggal Tayang */}
                                  <div className="space-y-2 sm:space-y-3">
                                    <Label
                                      htmlFor={`tanggalTayang-${item.id}`}
                                      className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center"
                                    >
                                      <PlayCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-purple-600" />
                                      Tanggal Tayang <span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <Input
                                      id={`tanggalTayang-${item.id}`}
                                      type="date"
                                      value={item.tanggalTayang ? format(item.tanggalTayang, "yyyy-MM-dd") : ""}
                                      onChange={(e) => {
                                        const date = e.target.value ? new Date(e.target.value) : undefined
                                        updateContentItem(index, { tanggalTayang: date })
                                        if (contentTimelineErrors[item.id]?.tayang) {
                                          setContentTimelineErrors((prev) => {
                                            const newErrors = { ...prev }
                                            if (newErrors[item.id]) {
                                              delete newErrors[item.id].tayang
                                              if (Object.keys(newErrors[item.id]).length === 0) {
                                                delete newErrors[item.id]
                                              }
                                            }
                                            return newErrors
                                          })
                                        }
                                      }}
                                      className={cn(
                                        "h-9 sm:h-12 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-sm",
                                        contentTimelineErrors[item.id]?.tayang &&
                                          "border-red-500 focus:border-red-500 bg-red-50/50",
                                      )}
                                    />
                                    {contentTimelineErrors[item.id]?.tayang && (
                                      <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-xs sm:text-sm text-red-600 flex items-center bg-red-50 p-1.5 sm:p-2 rounded-lg"
                                      >
                                        <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                        Tanggal wajib diisi
                                      </motion.p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>

                            {/* Enhanced File Upload Section */}
                            <motion.div
                              initial={{ y: 10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.6 }}
                              className="mb-6 sm:mb-8"
                            >
                              <div className="bg-gradient-to-r from-orange-50/50 to-red-50/50 rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-orange-100/50">
                                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                                  <Upload className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-orange-600" />
                                  Upload File & Sumber
                                </h4>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                  {/* Narasi Section */}
                                  <div className="space-y-3 sm:space-y-4">
                                    <h5 className="font-semibold text-gray-800 text-sm sm:text-base flex items-center">
                                      <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-blue-600" />
                                      Narasi
                                    </h5>

                                    {/* Narasi Source Type Selection */}
                                    <div className="space-y-2">
                                      <Label className="text-xs sm:text-sm font-medium text-gray-700">
                                        Sumber Narasi:
                                      </Label>
                                      <div className="flex flex-wrap gap-2">
                                        {["text", "file", "surat"].map((type) => (
                                          <label
                                            key={type}
                                            className="flex items-center space-x-1.5 sm:space-x-2 p-1.5 sm:p-2 bg-white/60 backdrop-blur-sm rounded-lg hover:bg-blue-50 transition-all duration-200 cursor-pointer text-xs sm:text-sm"
                                          >
                                            <input
                                              type="checkbox"
                                              checked={item.narasiSourceType.includes(type as any)}
                                              onChange={(e) => {
                                                const newSourceType = e.target.checked
                                                  ? [...item.narasiSourceType, type as any]
                                                  : item.narasiSourceType.filter((t) => t !== type)
                                                updateContentItem(index, { narasiSourceType: newSourceType })
                                              }}
                                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="font-medium">
                                              {type === "text" ? "Teks" : type === "file" ? "File" : "Surat"}
                                            </span>
                                          </label>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Conditional Narasi Inputs */}
                                    {item.narasiSourceType.includes("text") && (
                                      <div className="space-y-2">
                                        <Label className="text-xs sm:text-sm font-medium text-gray-700">
                                          Teks Narasi:
                                        </Label>
                                        <Textarea
                                          value={item.narasiText}
                                          onChange={(e) => updateContentItem(index, { narasiText: e.target.value })}
                                          placeholder="Masukkan teks narasi di sini..."
                                          className="min-h-[80px] sm:min-h-[100px] bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg sm:rounded-xl text-xs sm:text-sm"
                                        />
                                      </div>
                                    )}

                                    {item.narasiSourceType.includes("file") && (
                                      <FileOrLinkInput
                                        id={`narasiFile-${item.id}`}
                                        label="File Narasi:"
                                        value={item.narasiFile}
                                        onChange={(newValue) => updateContentItem(index, { narasiFile: newValue })}
                                        accept=".pdf,.doc,.docx,.txt"
                                        manualText={item.narasiFileManualText}
                                        onManualTextChange={(text) =>
                                          updateContentItem(index, { narasiFileManualText: text })
                                        }
                                        fileId={item.narasiFileId}
                                        onFileIdChange={(id) => updateContentItem(index, { narasiFileId: id })}
                                      />
                                    )}

                                    {item.narasiSourceType.includes("surat") && (
                                      <FileOrLinkInput
                                        id={`suratFile-${item.id}`}
                                        label="File Surat:"
                                        value={item.suratFile}
                                        onChange={(newValue) => updateContentItem(index, { suratFile: newValue })}
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        manualText={item.suratFileManualText}
                                        onManualTextChange={(text) =>
                                          updateContentItem(index, { suratFileManualText: text })
                                        }
                                        fileId={item.suratFileId}
                                        onFileIdChange={(id) => updateContentItem(index, { suratFileId: id })}
                                      />
                                    )}
                                  </div>

                                  {/* Audio Section */}
                                  <div className="space-y-3 sm:space-y-4">
                                    <h5 className="font-semibold text-gray-800 text-sm sm:text-base flex items-center">
                                      <AudioWaveform className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-purple-600" />
                                      Audio
                                    </h5>

                                    {/* Audio Dubbing */}
                                    <div className="space-y-2">
                                      <Label className="text-xs sm:text-sm font-medium text-gray-700">
                                        Audio Dubbing:
                                      </Label>
                                      <div className="flex flex-wrap gap-2">
                                        {["file-audio", "lain-lain"].map((type) => (
                                          <label
                                            key={type}
                                            className="flex items-center space-x-1.5 sm:space-x-2 p-1.5 sm:p-2 bg-white/60 backdrop-blur-sm rounded-lg hover:bg-purple-50 transition-all duration-200 cursor-pointer text-xs sm:text-sm"
                                          >
                                            <input
                                              type="checkbox"
                                              checked={item.audioDubbingSourceType.includes(type as any)}
                                              onChange={(e) => {
                                                const newSourceType = e.target.checked
                                                  ? [...item.audioDubbingSourceType, type as any]
                                                  : item.audioDubbingSourceType.filter((t) => t !== type)
                                                updateContentItem(index, { audioDubbingSourceType: newSourceType })
                                              }}
                                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                            />
                                            <span className="font-medium">
                                              {type === "file-audio" ? "File Audio" : "Lain-lain"}
                                            </span>
                                          </label>
                                        ))}
                                      </div>
                                    </div>

                                    {item.audioDubbingSourceType.includes("file-audio") && (
                                      <FileOrLinkInput
                                        id={`audioDubbingFile-${item.id}`}
                                        label="File Audio Dubbing:"
                                        value={item.audioDubbingFile}
                                        onChange={(newValue) =>
                                          updateContentItem(index, { audioDubbingFile: newValue })
                                        }
                                        accept=".mp3,.wav,.m4a,.aac"
                                        manualText={item.audioDubbingFileManualText}
                                        onManualTextChange={(text) =>
                                          updateContentItem(index, { audioDubbingFileManualText: text })
                                        }
                                        fileId={item.audioDubbingFileId}
                                        onFileIdChange={(id) => updateContentItem(index, { audioDubbingFileId: id })}
                                      />
                                    )}

                                    {item.audioDubbingSourceType.includes("lain-lain") && (
                                      <FileOrLinkInput
                                        id={`audioDubbingLainLainFile-${item.id}`}
                                        label="File Audio Dubbing Lain-lain:"
                                        value={item.audioDubbingLainLainFile}
                                        onChange={(newValue) =>
                                          updateContentItem(index, { audioDubbingLainLainFile: newValue })
                                        }
                                        accept="*"
                                        manualText={item.audioDubbingLainLainFileManualText}
                                        onManualTextChange={(text) =>
                                          updateContentItem(index, { audioDubbingLainLainFileManualText: text })
                                        }
                                        fileId={item.audioDubbingLainLainFileId}
                                        onFileIdChange={(id) =>
                                          updateContentItem(index, { audioDubbingLainLainFileId: id })
                                        }
                                      />
                                    )}

                                    {/* Audio Backsound */}
                                    <div className="space-y-2">
                                      <Label className="text-xs sm:text-sm font-medium text-gray-700">
                                        Audio Backsound:
                                      </Label>
                                      <div className="flex flex-wrap gap-2">
                                        {["file-audio", "lain-lain"].map((type) => (
                                          <label
                                            key={type}
                                            className="flex items-center space-x-1.5 sm:space-x-2 p-1.5 sm:p-2 bg-white/60 backdrop-blur-sm rounded-lg hover:bg-purple-50 transition-all duration-200 cursor-pointer text-xs sm:text-sm"
                                          >
                                            <input
                                              type="checkbox"
                                              checked={item.audioBacksoundSourceType.includes(type as any)}
                                              onChange={(e) => {
                                                const newSourceType = e.target.checked
                                                  ? [...item.audioBacksoundSourceType, type as any]
                                                  : item.audioBacksoundSourceType.filter((t) => t !== type)
                                                updateContentItem(index, { audioBacksoundSourceType: newSourceType })
                                              }}
                                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                            />
                                            <span className="font-medium">
                                              {type === "file-audio" ? "File Audio" : "Lain-lain"}
                                            </span>
                                          </label>
                                        ))}
                                      </div>
                                    </div>

                                    {item.audioBacksoundSourceType.includes("file-audio") && (
                                      <FileOrLinkInput
                                        id={`audioBacksoundFile-${item.id}`}
                                        label="File Audio Backsound:"
                                        value={item.audioBacksoundFile}
                                        onChange={(newValue) =>
                                          updateContentItem(index, { audioBacksoundFile: newValue })
                                        }
                                        accept=".mp3,.wav,.m4a,.aac"
                                        manualText={item.audioBacksoundFileManualText}
                                        onManualTextChange={(text) =>
                                          updateContentItem(index, { audioBacksoundFileManualText: text })
                                        }
                                        fileId={item.audioBacksoundFileId}
                                        onFileIdChange={(id) => updateContentItem(index, { audioBacksoundFileId: id })}
                                      />
                                    )}

                                    {item.audioBacksoundSourceType.includes("lain-lain") && (
                                      <FileOrLinkInput
                                        id={`audioBacksoundLainLainFile-${item.id}`}
                                        label="File Audio Backsound Lain-lain:"
                                        value={item.audioBacksoundLainLainFile}
                                        onChange={(newValue) =>
                                          updateContentItem(index, { audioBacksoundLainLainFile: newValue })
                                        }
                                        accept="*"
                                        manualText={item.audioBacksoundLainLainFileManualText}
                                        onManualTextChange={(text) =>
                                          updateContentItem(index, { audioBacksoundLainLainFileManualText: text })
                                        }
                                        fileId={item.audioBacksoundLainLainFileId}
                                        onFileIdChange={(id) =>
                                          updateContentItem(index, { audioBacksoundLainLainFileId: id })
                                        }
                                      />
                                    )}
                                  </div>
                                </div>

                                {/* Pendukung Lainnya Section */}
                                <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                                  <h5 className="font-semibold text-gray-800 text-sm sm:text-base flex items-center">
                                    <Layers className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-green-600" />
                                    Pendukung Lainnya
                                  </h5>

                                  <div className="space-y-2">
                                    <Label className="text-xs sm:text-sm font-medium text-gray-700">
                                      Jenis Pendukung:
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                      {["video", "foto", "lain-lain"].map((type) => (
                                        <label
                                          key={type}
                                          className="flex items-center space-x-1.5 sm:space-x-2 p-1.5 sm:p-2 bg-white/60 backdrop-blur-sm rounded-lg hover:bg-green-50 transition-all duration-200 cursor-pointer text-xs sm:text-sm"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={item.pendukungLainnyaSourceType.includes(type as any)}
                                            onChange={(e) => {
                                              const newSourceType = e.target.checked
                                                ? [...item.pendukungLainnyaSourceType, type as any]
                                                : item.pendukungLainnyaSourceType.filter((t) => t !== type)
                                              updateContentItem(index, { pendukungLainnyaSourceType: newSourceType })
                                            }}
                                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                          />
                                          <span className="font-medium">
                                            {type === "video" ? "Video" : type === "foto" ? "Foto" : "Lain-lain"}
                                          </span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                                    {item.pendukungLainnyaSourceType.includes("video") && (
                                      <FileOrLinkInput
                                        id={`pendukungVideoFile-${item.id}`}
                                        label="File Video Pendukung:"
                                        value={item.pendukungVideoFile}
                                        onChange={(newValue) =>
                                          updateContentItem(index, { pendukungVideoFile: newValue })
                                        }
                                        accept=".mp4,.avi,.mov,.wmv"
                                        manualText={item.pendukungVideoFileManualText}
                                        onManualTextChange={(text) =>
                                          updateContentItem(index, { pendukungVideoFileManualText: text })
                                        }
                                        fileId={item.pendukungVideoFileId}
                                        onFileIdChange={(id) => updateContentItem(index, { pendukungVideoFileId: id })}
                                      />
                                    )}

                                    {item.pendukungLainnyaSourceType.includes("foto") && (
                                      <FileOrLinkInput
                                        id={`pendukungFotoFile-${item.id}`}
                                        label="File Foto Pendukung:"
                                        value={item.pendukungFotoFile}
                                        onChange={(newValue) =>
                                          updateContentItem(index, { pendukungFotoFile: newValue })
                                        }
                                        accept=".jpg,.jpeg,.png,.gif"
                                        manualText={item.pendukungFotoFileManualText}
                                        onManualTextChange={(text) =>
                                          updateContentItem(index, { pendukungFotoFileManualText: text })
                                        }
                                        fileId={item.pendukungFotoFileId}
                                        onFileIdChange={(id) => updateContentItem(index, { pendukungFotoFileId: id })}
                                      />
                                    )}

                                    {item.pendukungLainnyaSourceType.includes("lain-lain") && (
                                      <FileOrLinkInput
                                        id={`pendukungLainLainFile-${item.id}`}
                                        label="File Pendukung Lain-lain:"
                                        value={item.pendukungLainLainFile}
                                        onChange={(newValue) =>
                                          updateContentItem(index, { pendukungLainLainFile: newValue })
                                        }
                                        accept="*"
                                        manualText={item.pendukungLainLainFileManualText}
                                        onManualTextChange={(text) =>
                                          updateContentItem(index, { pendukungLainLainFileManualText: text })
                                        }
                                        fileId={item.pendukungLainLainFileId}
                                        onFileIdChange={(id) =>
                                          updateContentItem(index, { pendukungLainLainFileId: id })
                                        }
                                      />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>

                            {/* Enhanced Keterangan Section */}
                            <motion.div
                              initial={{ y: 10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.7 }}
                            >
                              <div className="bg-gradient-to-r from-gray-50/50 to-slate-50/50 rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-gray-100/50">
                                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-gray-600" />
                                  Keterangan Tambahan
                                </h4>
                                <Textarea
                                  value={item.keterangan}
                                  onChange={(e) => updateContentItem(index, { keterangan: e.target.value })}
                                  placeholder="Masukkan keterangan atau catatan tambahan untuk konten ini..."
                                  className="min-h-[80px] sm:min-h-[100px] bg-white/80 backdrop-blur-sm border-gray-200 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 rounded-lg sm:rounded-xl text-xs sm:text-sm"
                                />
                              </div>
                            </motion.div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
              )}

              {/* Step 4: Final Confirmation */}
              {currentStep === 4 && (
                <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
                  <CardContent className="p-4 sm:p-8">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="mb-6 sm:mb-8"
                    >
                      <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-lg sm:text-2xl font-bold text-gray-800">Konfirmasi & Finalisasi</h2>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Lengkapi informasi terakhir dan konfirmasi pengajuan
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    <div className="space-y-6 sm:space-y-8">
                      {/* Bukti Mengetahui */}
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl p-4 sm:p-6 border border-blue-100/50"
                      >
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                          <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-blue-600" />
                          Bukti Mengetahui
                        </h3>
                        <FileOrLinkInput
                          id="buktiMengetahui"
                          label="Bukti Mengetahui (Kepala Bidang Informasi Komunikasi Publik) *"
                          value={formData.uploadedBuktiMengetahui}
                          onChange={(newValue) =>
                            setFormData((prev) => ({ ...prev, uploadedBuktiMengetahui: newValue }))
                          }
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          manualText={formData.uploadedBuktiMengetahuiManualText}
                          onManualTextChange={(text) =>
                            setFormData((prev) => ({ ...prev, uploadedBuktiMengetahuiManualText: text }))
                          }
                        />
                      </motion.div>

                      {/* Credentials Section */}
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-xl p-4 sm:p-6 border border-purple-100/50"
                      >
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                          <Bell className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-purple-600" />
                          Informasi Akses
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-2 sm:space-y-3">
                            <Label
                              htmlFor="noComtab"
                              className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center"
                            >
                              No Comtab <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <div className="flex space-x-2">
                              <Input
                                id="noComtab"
                                value={formData.noComtab}
                                onChange={(e) => setFormData((prev) => ({ ...prev, noComtab: e.target.value }))}
                                placeholder="Masukkan No Comtab"
                                className="flex-1 h-9 sm:h-12 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg sm:rounded-xl text-xs sm:text-sm"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  const credentials = generateCredentials()
                                  setFormData((prev) => ({ ...prev, noComtab: credentials.noComtab }))
                                }}
                                className="h-9 sm:h-12 px-2 sm:px-4 bg-white/70 backdrop-blur-sm border-gray-200 hover:bg-purple-50 hover:border-purple-300 text-xs sm:text-sm"
                              >
                                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                            {!isEditMode &&
                              submissions.some(
                                (sub) => sub.noComtab === formData.noComtab && formData.noComtab.trim() !== "",
                              ) && (
                                <p className="text-xs sm:text-sm text-red-600 flex items-center bg-red-50 p-1.5 sm:p-2 rounded-lg">
                                  <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                  No Comtab sudah digunakan!
                                </p>
                              )}
                          </div>

                          <div className="space-y-2 sm:space-y-3">
                            <Label
                              htmlFor="pinSandi"
                              className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center"
                            >
                              PIN Sandi <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <div className="flex space-x-2">
                              <div className="relative flex-1">
                                <Input
                                  id="pinSandi"
                                  type={showPin ? "text" : "password"}
                                  value={formData.pinSandi}
                                  onChange={(e) => setFormData((prev) => ({ ...prev, pinSandi: e.target.value }))}
                                  placeholder="Masukkan PIN 4 digit"
                                  className="h-9 sm:h-12 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg sm:rounded-xl text-xs sm:text-sm"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowPin(!showPin)}
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 sm:h-7 sm:w-7 p-0 hover:bg-gray-100 rounded-md"
                                >
                                  {showPin ? (
                                    <EyeOff className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                                  ) : (
                                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                                  )}
                                </Button>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  const credentials = generateCredentials()
                                  setFormData((prev) => ({ ...prev, pinSandi: credentials.password }))
                                }}
                                className="h-9 sm:h-12 px-2 sm:px-4 bg-white/70 backdrop-blur-sm border-gray-200 hover:bg-purple-50 hover:border-purple-300 text-xs sm:text-sm"
                              >
                                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Summary Section */}
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-xl p-4 sm:p-6 border border-green-100/50"
                      >
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                          <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-green-600" />
                          Ringkasan Pengajuan
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-xs sm:text-sm">
                          <div className="space-y-2 sm:space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tema:</span>
                              <span className="font-medium text-gray-900">{formData.tema || "-"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Judul:</span>
                              <span className="font-medium text-gray-900 text-right max-w-[60%] truncate">
                                {formData.judul || "-"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Petugas:</span>
                              <span className="font-medium text-gray-900">{formData.petugasPelaksana || "-"}</span>
                            </div>
                          </div>
                          <div className="space-y-2 sm:space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Supervisor:</span>
                              <span className="font-medium text-gray-900">{formData.supervisor || "-"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Konten:</span>
                              <span className="font-medium text-gray-900">{formData.contentItems.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Jenis Konten:</span>
                              <span className="font-medium text-gray-900">{selectedContentTypes.length} jenis</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <motion.div
            className="flex justify-between items-center mt-6 sm:mt-8 sticky bottom-4 bg-white/80 backdrop-blur-xl rounded-2xl p-3 sm:p-4 shadow-lg border border-white/30"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={cn(
                "h-10 sm:h-12 px-4 sm:px-6 bg-white/70 backdrop-blur-sm border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-xl font-semibold transition-all duration-200 text-xs sm:text-sm",
                currentStep === 1 && "opacity-50 cursor-not-allowed",
              )}
            >
              <ArrowLeftIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Sebelumnya
            </Button>

            <div className="flex items-center space-x-1 sm:space-x-2">
              {[1, 2, 3, 4].map((step) => (
                <motion.div
                  key={step}
                  className={cn(
                    "w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300",
                    step === currentStep
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 scale-125"
                      : step < currentStep
                        ? "bg-green-500"
                        : "bg-gray-300",
                  )}
                  whileHover={{ scale: 1.2 }}
                />
              ))}
            </div>

            {currentStep < 4 ? (
              <Button
                onClick={nextStep}
                disabled={isNextButtonDisabled}
                className={cn(
                  "h-10 sm:h-12 px-4 sm:px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-xs sm:text-sm",
                  isNextButtonDisabled && "opacity-50 cursor-not-allowed",
                )}
              >
                Selanjutnya
                <ArrowRightIcon className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
                className={cn(
                  "h-10 sm:h-12 px-4 sm:px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-xs sm:text-sm",
                  isSubmitDisabled && "opacity-50 cursor-not-allowed",
                )}
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent rounded-full mr-1 sm:mr-2"
                    />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    {isEditMode ? "Perbarui Pengajuan" : "Kirim Pengajuan"}
                  </>
                )}
              </Button>
            )}
          </motion.div>
        </div>

        {/* Toast Message */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="fixed bottom-4 right-4 z-50"
            >
              <div
                className={cn(
                  "p-3 sm:p-4 rounded-xl shadow-2xl backdrop-blur-xl border max-w-sm",
                  toastMessage.type === "success" &&
                    "bg-green-50/90 border-green-200 text-green-800 shadow-green-200/50",
                  toastMessage.type === "error" && "bg-red-50/90 border-red-200 text-red-800 shadow-red-200/50",
                  toastMessage.type === "info" && "bg-blue-50/90 border-blue-200 text-blue-800 shadow-blue-200/50",
                )}
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  {toastMessage.type === "success" && <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />}
                  {toastMessage.type === "error" && <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />}
                  {toastMessage.type === "info" && <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />}
                  <p className="text-xs sm:text-sm font-medium">{toastMessage.message}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Validation Dialog */}
        <ValidationDialog
          isOpen={isValidationDialogOpen}
          onOpenChange={setIsValidationDialogOpen}
          onConfirm={() => {
            setIsValidationDialogOpen(false)
            setIsSubmitConfirmOpen(true)
          }}
          submissionData={{
            tema: formData.tema,
            judul: formData.judul,
            totalItems: formData.contentItems.length,
            petugasPelaksana: formData.petugasPelaksana,
            supervisor: formData.supervisor,
            contentTypes: selectedContentTypes.map(getContentTypeDisplayName),
          }}
        />

        {/* Confirmation Dialog */}
        <EnhancedConfirmationDialog
          isOpen={isSubmitConfirmOpen}
          onOpenChange={setIsSubmitConfirmOpen}
          onConfirm={confirmSubmission}
          title={isEditMode ? "Konfirmasi Perubahan" : "Konfirmasi Pengajuan"}
          description={
            isEditMode
              ? "Apakah Anda yakin ingin menyimpan perubahan pada pengajuan ini?"
              : "Apakah Anda yakin ingin mengirim pengajuan ini?"
          }
          confirmText={isEditMode ? "Ya, Simpan" : "Ya, Kirim"}
          isLoading={isSubmitting}
          submissionData={{
            judul: formData.judul,
            totalItems: formData.contentItems.length,
            petugasPelaksana: formData.petugasPelaksana,
          }}
        />

        {/* Document Sent Dialog */}
        <DocumentSentDialog
          isOpen={isDocumentSentDialogOpen}
          onOpenChange={setIsDocumentSentDialogOpen}
          credentials={generatedCredentials}
          onClose={() => {
            setIsDocumentSentDialogOpen(false)
            setGeneratedCredentials(null)
          }}
        />

        {/* Floating Background Orbs */}
        <FloatingOrb
          delay={0}
          duration={30}
          size="w-96 h-96"
          color="bg-gradient-to-r from-blue-400/20 to-indigo-400/20"
          position="top-0 left-0"
        />
        <FloatingOrb
          delay={10}
          duration={25}
          size="w-80 h-80"
          color="bg-gradient-to-r from-purple-400/15 to-pink-400/15"
          position="bottom-0 right-0"
        />
        <FloatingOrb
          delay={5}
          duration={35}
          size="w-60 h-60"
          color="bg-gradient-to-r from-emerald-400/10 to-teal-400/10"
          position="top-1/2 left-1/2"
        />
      </motion.div>
    </TooltipProvider>
  )
}

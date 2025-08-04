"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Users,
  Activity,
  Globe,
  Hash,
  Video,
  Mic,
  ImageIcon,
  Eye,
  Shield,
  Clock,
  ChevronLeft,
  Download,
  Star,
  Zap,
  PlayCircle,
  PauseCircle,
  Target,
  Check,
  ArrowRight,
  Rocket,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Send,
  Calendar,
  Upload,
  LinkIcon,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import PreviewModal  from "./preview-modal"
import { loadSubmissionsFromStorage, saveSubmissionsToStorage, getFileIcon, downloadFile } from "@/lib/utils"
import { MobileValidasiOutputDialog } from "./mobile-validasi-output-dialog"

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

interface Submission {
  id: number
  noComtab: string
  pin: string
  tema: string
  judul: string
  jenisMedia: string
  mediaPemerintah: string[]
  mediaMassa: string[]
  jenisKonten: string[]
  tanggalOrder: Date | undefined
  petugasPelaksana: string
  supervisor: string
  durasi: string
  jumlahProduksi: string
  tanggalSubmit: Date | undefined
  lastModified?: Date | undefined
  uploadedBuktiMengetahui?: any
  isConfirmed?: boolean
  tanggalKonfirmasi?: string
  contentItems?: ContentItem[]
  workflowStage?: "submitted" | "review" | "validation" | "completed"
  isOutputValidated?: boolean
  tanggalValidasiOutput?: string
}

interface ContentItem {
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
  tanggalOrderMasuk: Date | undefined
  tanggalJadi: Date | undefined
  tanggalTayang: Date | undefined
  keterangan: string
  status?: "pending" | "approved" | "rejected"
  alasanPenolakan?: string
  tanggalDiproses?: string
  diprosesoleh?: string
  narasiSourceType?: ("text" | "file" | "surat")[]
  audioDubbingSourceType?: ("file-audio" | "lain-lain")[]
  audioBacksoundSourceType?: ("file-audio" | "lain-lain")[]
  pendukungLainnyaSourceType?: ("video" | "foto" | "lain-lain")[]
  narasiFile?: any
  suratFile?: any
  audioDubbingFile?: any
  audioDubbingLainLainFile?: any
  audioBacksoundFile?: any
  audioBacksoundLainLainFile?: any
  pendukungVideoFile?: any
  pendukungFotoFile?: any
  pendukungLainLainFile?: any
  hasilProdukFile?: any
  hasilProdukLink?: string
  isTayang?: boolean
  tanggalValidasiTayang?: string
  validatorTayang?: string
  keteranganValidasi?: string
  alasanTidakTayang?: string
  // New fields for validation
  tanggalTayangValidasi?: string
  hasilProdukValidasiFile?: any
  hasilProdukValidasiLink?: string
}

interface ValidasiOutputDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  submission: Submission | null
  contentItem?: ContentItem | null
  onUpdate: (submissions: Submission[]) => void
  onToast: (message: string, type: "success" | "error" | "info") => void
}

// Helper functions
const getContentTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "video":
      return <PlayCircle className="h-5 w-5 text-red-500" />
    case "audio":
      return <PauseCircle className="h-5 w-5 text-purple-500" />
    case "fotografis":
      return <Eye className="h-5 w-5 text-blue-500" />
    case "infografis":
      return <FileText className="h-5 w-5 text-green-500" />
    case "naskah-berita":
      return <FileText className="h-5 w-5 text-orange-500" />
    case "bumper":
      return <Zap className="h-5 w-5 text-indigo-500" />
    default:
      return <FileText className="h-5 w-5 text-gray-500" />
  }
}

const getMediaIcon = (media: string) => {
  switch (media) {
    case "website":
      return <Globe className="h-4 w-4 text-blue-500" />
    case "instagram":
      return <ImageIcon className="h-4 w-4 text-pink-500" />
    case "youtube":
      return <Video className="h-4 w-4 text-red-500" />
    case "facebook":
      return <Users className="h-4 w-4 text-blue-600" />
    case "twitter":
      return <Hash className="h-4 w-4 text-blue-400" />
    case "radio":
      return <Mic className="h-4 w-4 text-green-500" />
    case "tv":
    case "televisi":
      return <Video className="h-4 w-4 text-purple-500" />
    default:
      return <Globe className="h-4 w-4 text-gray-500" />
  }
}

const formatDate = (date?: Date | string): string => {
  if (!date) return "N/A"
  const d = typeof date === "string" ? new Date(date) : date
  if (isNaN(d.getTime())) return "N/A"
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

const formatDateForInput = (date?: Date | string): string => {
  if (!date) return ""
  const d = typeof date === "string" ? new Date(date) : date
  if (isNaN(d.getTime())) return ""
  return d.toISOString().split("T")[0]
}

// Helper function to get file display name
const getFileDisplayName = (file: any): string => {
  if (!file) return "Tidak ada file"
  if (typeof file === "string") return file.length > 50 ? file.substring(0, 50) + "..." : file
  if (file.name) return file.name
  return "File tidak dikenal"
}

// Helper function to check if file is a link
const isFileLink = (file: any): boolean => {
  return typeof file === "string" && (file.startsWith("http://") || file.startsWith("https://"))
}

// Enhanced helper function to get preview URL from file with better fallbacks
const getPreviewUrl = (file: any): string | null => {
  console.log("Getting preview URL for file:", file)

  if (!file) {
    console.log("No file provided")
    return null
  }

  // If it's a string (link), validate and return it
  if (typeof file === "string") {
    console.log("File is string:", file)
    // Check if it's a valid URL
    if (file.startsWith("http://") || file.startsWith("https://")) {
      return file
    }
    // If it's not a URL but a string, it might be a base64 or file path
    if (file.startsWith("data:")) {
      return file
    }
    // For other strings, return as-is (might be a relative path)
    return file
  }

  // If it's a file object with URL property
  if (file && typeof file === "object" && file.url) {
    console.log("File has URL property:", file.url)
    return file.url
  }

  // If it's a file object with base64 property
  if (file && typeof file === "object" && file.base64) {
    console.log("File has base64 property")
    const base64Data = file.base64
    // Check if base64 already has data URL format
    if (base64Data.startsWith("data:")) {
      return base64Data
    }
    // Create proper data URL with mime type
    const mimeType = file.type || "application/octet-stream"
    return `data:${mimeType};base64,${base64Data}`
  }

  // Check for browser File object using property checks instead of instanceof
  const isBrowserFile = (obj: any): boolean => {
    return (
      obj &&
      typeof obj === "object" &&
      typeof obj.name === "string" &&
      typeof obj.size === "number" &&
      typeof obj.type === "string" &&
      typeof obj.lastModified === "number" &&
      typeof obj.slice === "function"
    )
  }

  if (isBrowserFile(file) && typeof URL !== "undefined" && typeof URL.createObjectURL === "function") {
    console.log("File is File object")
    try {
      return URL.createObjectURL(file)
    } catch (error) {
      console.error("Failed to create object URL:", error)
      return null
    }
  }

  // If it has a preview property
  if (file && typeof file === "object" && file.preview) {
    console.log("File has preview property:", file.preview)
    return file.preview
  }

  console.log("Could not determine preview URL, file object:", file)
  return null
}

// Enhanced helper function to get file type for preview
const getFileType = (file: any): string => {
  if (!file) return "application/octet-stream"

  // Check for browser File object using property checks
  const isBrowserFile = (obj: any): boolean => {
    return (
      obj &&
      typeof obj === "object" &&
      typeof obj.name === "string" &&
      typeof obj.size === "number" &&
      typeof obj.type === "string" &&
      typeof obj.lastModified === "number" &&
      typeof obj.slice === "function"
    )
  }

  if (isBrowserFile(file) && file.type) {
    return file.type
  }

  // If it's a file object with type
  if (file && typeof file === "object" && file.type) {
    return file.type
  }

  // If it's a string (link), try to determine type from extension
  if (typeof file === "string") {
    const extension = file.split(".").pop()?.toLowerCase()
    const mimeTypes: Record<string, string> = {
      pdf: "application/pdf",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      mp4: "video/mp4",
      webm: "video/webm",
      mov: "video/quicktime",
      mp3: "audio/mpeg",
      wav: "audio/wav",
      ogg: "audio/ogg",
      txt: "text/plain",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }
    return mimeTypes[extension || ""] || "text/html"
  }

  return "application/octet-stream"
}

// Simplified Validation Summary Confirmation Component
const ValidationSummaryConfirmation = ({
  contentItems,
  validationDecisions,
  rejectionReasons,
  validationNotes,
  tayangDates,
  hasilProdukFiles,
  hasilProdukLinks,
  onConfirm,
  onBack,
  isSubmitting,
}: {
  contentItems: ContentItem[]
  validationDecisions: Record<string, boolean | null>
  rejectionReasons: Record<string, string>
  validationNotes: Record<string, string>
  tayangDates: Record<string, string>
  hasilProdukFiles: Record<string, any>
  hasilProdukLinks: Record<string, string>
  onConfirm: () => void
  onBack: () => void
  isSubmitting: boolean
}) => {
  const tayangItems = contentItems.filter((item) => validationDecisions[item.id] === true)
  const tidakTayangItems = contentItems.filter((item) => validationDecisions[item.id] === false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full w-16 h-16 flex items-center justify-center">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-yellow-600 mb-2">Konfirmasi Validasi</h3>
        <p className="text-gray-600">Periksa ringkasan validasi sebelum menyimpan</p>
      </div>

      {/* Summary Stats - Horizontal */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="text-3xl font-bold text-yellow-800 mb-1">{tayangItems.length}</div>
          <div className="text-sm text-yellow-700 flex items-center justify-center">
            <ThumbsUp className="h-4 w-4 mr-1" />
            Konten Tayang
          </div>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="text-3xl font-bold text-red-800 mb-1">{tidakTayangItems.length}</div>
          <div className="text-sm text-red-700 flex items-center justify-center">
            <ThumbsDown className="h-4 w-4 mr-1" />
            Tidak Tayang
          </div>
        </div>
      </div>

      {/* Content List - Compact */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" />
          Ringkasan Validasi
        </h4>

        <div className="max-h-48 overflow-y-auto space-y-2">
          {contentItems.map((item) => {
            const decision = validationDecisions[item.id]
            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg text-sm",
                  decision === true
                    ? "bg-yellow-100 border border-yellow-200"
                    : decision === false
                      ? "bg-red-100 border border-red-200"
                      : "bg-gray-100",
                )}
              >
                <div className="flex items-center space-x-2">
                  {getContentTypeIcon(item.jenisKonten)}
                  <span className="font-medium text-gray-900">{item.nama}</span>
                </div>
                <Badge
                  className={cn(
                    "text-xs",
                    decision === true
                      ? "bg-yellow-200 text-yellow-800"
                      : decision === false
                        ? "bg-red-200 text-red-800"
                        : "bg-gray-200 text-gray-800",
                  )}
                >
                  {decision === true ? "Tayang" : decision === false ? "Tidak Tayang" : "Pending"}
                </Badge>
              </div>
            )
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center space-x-4 pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting} className="px-6 bg-transparent">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>

        <Button
          onClick={onConfirm}
          disabled={isSubmitting}
          className="px-8 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              Menyimpan...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Konfirmasi & Simpan
            </>
          )}
        </Button>
      </div>
    </motion.div>
  )
}

// Simple Validation Confirmation Dialog Component
const SimpleValidationConfirmationDialog = ({
  isOpen,
  onOpenChange,
  submission,
  tayangItems,
  tidakTayangCount,
  onConfirm,
  isSubmitting,
  onBack,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  submission: Submission
  tayangItems: ContentItem[]
  tidakTayangCount: number
  onConfirm: () => void
  isSubmitting: boolean
  onBack: () => void
}) => {
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShowSuccess(false)
    }
  }, [isOpen])

  const handleConfirm = async () => {
    setShowSuccess(true)
    await onConfirm()
    setTimeout(() => {
      onOpenChange(false)
    }, 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-4 md:mx-auto">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="text-center py-4"
        >
          <AnimatePresence mode="wait">
            {!showSuccess ? (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Success Icon */}
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>

                {/* Title */}
                <div>
                  <DialogTitle className="text-xl font-bold text-gray-900 mb-2">Validasi Selesai!</DialogTitle>
                  <p className="text-gray-600">
                    Dokumen <span className="font-semibold text-yellow-700">{submission.noComtab}</span> siap publikasi
                  </p>
                </div>

                {/* Stats - Horizontal Layout */}
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-2xl font-bold text-yellow-800">{tayangItems.length}</div>
                    <div className="text-sm text-yellow-700">Tayang</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-2xl font-bold text-red-800">{tidakTayangCount}</div>
                    <div className="text-sm text-red-700">Tidak Tayang</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={onBack}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-transparent"
                  >
                    Kembali
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <Rocket className="h-4 w-4 mr-2" />
                        Konfirmasi
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-6"
              >
                {/* Success Animation */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4"
                >
                  <Check className="h-10 w-10 text-white" />
                </motion.div>

                <h3 className="text-xl font-bold text-green-600 mb-2">Berhasil!</h3>
                <p className="text-gray-600">Validasi telah disimpan</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

export function ValidasiOutputDialog({
  isOpen,
  onOpenChange,
  submission,
  contentItem,
  onUpdate,
  onToast,
}: ValidasiOutputDialogProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [validationDecisions, setValidationDecisions] = useState<Record<string, boolean | null>>({})
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({})
  const [validationNotes, setValidationNotes] = useState<Record<string, string>>({})
  const [tayangDates, setTayangDates] = useState<Record<string, string>>({})
  const [hasilProdukFiles, setHasilProdukFiles] = useState<Record<string, any>>({})
  const [hasilProdukLinks, setHasilProdukLinks] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showValidationSummary, setShowValidationSummary] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Preview modal state
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    file: null as any,
    url: "",
    type: "",
    fileName: "",
    title: "",
  })

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
      setValidationDecisions({})
      setRejectionReasons({})
      setValidationNotes({})
      setTayangDates({})
      setHasilProdukFiles({})
      setHasilProdukLinks({})
      setShowValidationSummary(false)
      setShowConfirmation(false)
      setPreviewModal({ isOpen: false, file: null, url: "", type: "", fileName: "", title: "" })
    }
  }, [isOpen])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  if (!submission) return null

  const approvedItems = submission.contentItems?.filter((item) => item.status === "approved") || []
  const currentItem = contentItem || approvedItems[currentStep]

  if (!currentItem && approvedItems.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md mx-4 md:mx-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-8"
          >
            <div className="mx-auto mb-6 p-4 bg-gradient-to-r from-orange-400 to-red-400 rounded-full w-20 h-20 flex items-center justify-center">
              <AlertTriangle className="h-10 w-10 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900 mb-2">Tidak Ada Konten untuk Validasi</DialogTitle>
            <p className="text-gray-600 mb-6">
              Semua konten sudah divalidasi atau belum ada konten yang perlu divalidasi.
            </p>
            <Button onClick={() => onOpenChange(false)} className="bg-gradient-to-r from-blue-500 to-purple-600">
              Tutup
            </Button>
          </motion.div>
        </DialogContent>
      </Dialog>
    )
  }

  const validationItem = approvedItems[currentStep] || approvedItems[0]
  const currentDecision = validationDecisions[validationItem.id]
  const currentRejectionReason = rejectionReasons[validationItem.id] || ""
  const currentValidationNote = validationNotes[validationItem.id] || ""
  const currentTayangDate = tayangDates[validationItem.id] || ""
  const currentHasilFile = hasilProdukFiles[validationItem.id]
  const currentHasilLink = hasilProdukLinks[validationItem.id] || ""

  // Check if all content items have been validated
  const allItemsValidated = approvedItems.every(
    (item) => validationDecisions[item.id] !== undefined && validationDecisions[item.id] !== null,
  )

  // Check if any rejected items have rejection reasons
  const rejectedItemsHaveReasons = approvedItems
    .filter((item) => validationDecisions[item.id] === false)
    .every((item) => rejectionReasons[item.id]?.trim())

  // Check if tayang items have required fields
  const tayangItemsComplete = approvedItems
    .filter((item) => validationDecisions[item.id] === true)
    .every((item) => {
      const hasDate = tayangDates[item.id]?.trim()
      const hasFile = hasilProdukFiles[item.id]
      const hasLink = hasilProdukLinks[item.id]?.trim()
      return hasDate && (hasFile || hasLink)
    })

  const canSubmit = allItemsValidated && rejectedItemsHaveReasons && tayangItemsComplete

  const getValidatedCount = () => {
    return Object.values(validationDecisions).filter((d) => d !== null).length
  }

  // Use mobile dialog on mobile devices
  if (isMobile) {
    return (
      <MobileValidasiOutputDialog
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        submission={submission}
        contentItem={contentItem}
        onUpdate={onUpdate}
        onToast={onToast}
      />
    )
  }

  // Enhanced handle preview file function with better error handling
  const handlePreviewFile = (file: any, title: string) => {
    console.log("Handling preview for file:", file, "with title:", title)

    try {
      const url = getPreviewUrl(file)
      const fileType = getFileType(file)
      const fileName = getFileDisplayName(file)

      console.log("Preview data:", { url, fileType, fileName, file })

      // Always open the modal, even if there's no URL - the modal will handle the error display
      setPreviewModal({
        isOpen: true,
        file: file,
        url: url || "",
        type: fileType,
        fileName: fileName,
        title: title,
      })

      // Show appropriate toast messages
      if (!file) {
        onToast("File tidak ditemukan", "error")
      } else if (!url && file) {
        onToast("File ditemukan tetapi tidak dapat ditampilkan. Mungkin hanya metadata yang tersimpan.", "info")
      }
    } catch (error) {
      console.error("Error opening file preview:", error)
      onToast("Terjadi kesalahan saat membuka preview file", "error")
    }
  }

  // Handle validation decision change
  const handleValidationDecisionChange = (decision: boolean) => {
    setValidationDecisions((prev) => ({
      ...prev,
      [validationItem.id]: decision,
    }))

    // Clear rejection reason if switching to approved
    if (decision === true) {
      setRejectionReasons((prev) => ({
        ...prev,
        [validationItem.id]: "",
      }))
    } else {
      // Clear tayang-related fields if switching to rejected
      setTayangDates((prev) => ({
        ...prev,
        [validationItem.id]: "",
      }))
      setHasilProdukFiles((prev) => ({
        ...prev,
        [validationItem.id]: null,
      }))
      setHasilProdukLinks((prev) => ({
        ...prev,
        [validationItem.id]: "",
      }))
    }
  }

  // Handle rejection reason change
  const handleRejectionReasonChange = (reason: string) => {
    setRejectionReasons((prev) => ({
      ...prev,
      [validationItem.id]: reason,
    }))
  }

  // Handle validation note change
  const handleValidationNoteChange = (note: string) => {
    setValidationNotes((prev) => ({
      ...prev,
      [validationItem.id]: note,
    }))
  }

  // Handle tayang date change
  const handleTayangDateChange = (date: string) => {
    setTayangDates((prev) => ({
      ...prev,
      [validationItem.id]: date,
    }))
  }

  // Handle hasil produk file change
  const handleHasilFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setHasilProdukFiles((prev) => ({
        ...prev,
        [validationItem.id]: file,
      }))
    }
  }

  // Handle hasil produk link change
  const handleHasilLinkChange = (link: string) => {
    setHasilProdukLinks((prev) => ({
      ...prev,
      [validationItem.id]: link,
    }))
  }

  // Remove hasil file
  const removeHasilFile = () => {
    setHasilProdukFiles((prev) => ({
      ...prev,
      [validationItem.id]: null,
    }))
  }

  // Navigate to next content item
  const goToNextItem = () => {
    if (currentStep < approvedItems.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  // Navigate to previous content item
  const goToPreviousItem = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canGoNext = () => {
    return currentStep < approvedItems.length - 1
  }

  const canGoPrevious = () => {
    return currentStep > 0
  }

  const isCurrentItemValid = () => {
    const decision = validationDecisions[validationItem.id]
    if (decision === null || decision === undefined) return false
    if (decision === false && !rejectionReasons[validationItem.id]?.trim()) return false
    if (decision === true) {
      const hasDate = tayangDates[validationItem.id]?.trim()
      const hasFile = hasilProdukFiles[validationItem.id]
      const hasLink = hasilProdukLinks[validationItem.id]?.trim()
      return hasDate && (hasFile || hasLink)
    }
    return true
  }

  // Handle validation submission - now shows summary first
  const handleValidationSubmit = async () => {
    if (!canSubmit) {
      onToast("Harap lengkapi semua validasi dengan tanggal tayang dan hasil produk untuk konten yang tayang", "error")
      return
    }

    // Show validation summary confirmation
    setShowValidationSummary(true)
  }

  // Handle confirmed validation submission
  const handleConfirmedValidationSubmit = async () => {
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const submissions = loadSubmissionsFromStorage()
    const updatedSubmissions = submissions.map((sub: any) => {
      if (sub.id === submission.id) {
        const updatedContentItems = sub.contentItems?.map((contentItem: any) => {
          const decision = validationDecisions[contentItem.id]
          if (decision !== undefined && decision !== null) {
            return {
              ...contentItem,
              isTayang: decision,
              tanggalValidasiTayang: new Date().toLocaleDateString("id-ID"),
              validatorTayang: "Admin",
              keteranganValidasi: validationNotes[contentItem.id] || "",
              alasanTidakTayang: decision === false ? rejectionReasons[contentItem.id] : undefined,
              // Add new validation fields
              tanggalTayangValidasi: decision === true ? tayangDates[contentItem.id] : undefined,
              hasilProdukValidasiFile: decision === true ? hasilProdukFiles[contentItem.id] : undefined,
              hasilProdukValidasiLink: decision === true ? hasilProdukLinks[contentItem.id] : undefined,
            }
          }
          return contentItem
        })

        const updatedSubmission = {
          ...sub,
          contentItems: updatedContentItems,
          lastModified: new Date(),
          isOutputValidated: true, // Mark as validated
          tanggalValidasiOutput: new Date().toISOString(), // Add validation timestamp
        }
        updatedSubmission.workflowStage = getWorkflowStage(updatedSubmission)

        return updatedSubmission
      }
      return sub
    })

    saveSubmissionsToStorage(updatedSubmissions)
    onUpdate(updatedSubmissions)

    const tayangCount = Object.values(validationDecisions).filter((d) => d === true).length
    const tidakTayangCount = Object.values(validationDecisions).filter((d) => d === false).length

    onToast(`Validasi selesai! ${tayangCount} konten tayang, ${tidakTayangCount} konten tidak tayang`, "success")
    setIsSubmitting(false)
    setShowValidationSummary(false)

    // Show confirmation step if there are tayang items
    if (tayangCount > 0) {
      setShowConfirmation(true)
    } else {
      onOpenChange(false)
    }
  }

  // Handle document confirmation
  const handleConfirmDocument = async () => {
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const submissions = loadSubmissionsFromStorage()
    const updatedSubmissions = submissions.map((sub: any) => {
      if (sub.id === submission.id) {
        return {
          ...sub,
          workflowStage: "completed",
          lastModified: new Date(),
          isOutputValidated: true, // Ensure it's marked as validated
          tanggalValidasiOutput: new Date().toISOString(),
        }
      }
      return sub
    })

    saveSubmissionsToStorage(updatedSubmissions)
    onUpdate(updatedSubmissions)

    onToast("Validasi berhasil diselesaikan! Dokumen telah selesai diproses.", "success")
    setIsSubmitting(false)
    onOpenChange(false) // Close the dialog
  }

  // Show validation summary confirmation
  if (showValidationSummary) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden mx-4 md:mx-auto">
          <ScrollArea className="max-h-[85vh]">
            <div className="p-4 md:p-6">
              <ValidationSummaryConfirmation
                contentItems={approvedItems}
                validationDecisions={validationDecisions}
                rejectionReasons={rejectionReasons}
                validationNotes={validationNotes}
                tayangDates={tayangDates}
                hasilProdukFiles={hasilProdukFiles}
                hasilProdukLinks={hasilProdukLinks}
                onConfirm={handleConfirmedValidationSubmit}
                onBack={() => setShowValidationSummary(false)}
                isSubmitting={isSubmitting}
              />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    )
  }

  // Show enhanced confirmation step
  if (showConfirmation) {
    const tayangItems = approvedItems.filter((item) => validationDecisions[item.id] === true)
    const tidakTayangCount = Object.values(validationDecisions).filter((d) => d === false).length

    return (
      <SimpleValidationConfirmationDialog
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        submission={submission}
        tayangItems={tayangItems}
        tidakTayangCount={tidakTayangCount}
        onConfirm={handleConfirmDocument}
        isSubmitting={isSubmitting}
        onBack={() => setShowConfirmation(false)}
      />
    )
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-7xl h-[95vh] overflow-hidden bg-gradient-to-br from-slate-50 via-white to-yellow-50 mx-4 md:mx-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full flex flex-col relative"
          >
            {/* Floating Confirmation Button - appears when all validations are complete - positioned at bottom right */}
            <AnimatePresence>
              {canSubmit && !showValidationSummary && !showConfirmation && (
                <motion.div
                  initial={{ scale: 0, opacity: 0, x: 100, y: 100 }}
                  animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
                  exit={{ scale: 0, opacity: 0, x: 100, y: 100 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    delay: 0.5,
                  }}
                  className="fixed bottom-6 right-6 z-50"
                >
                  <motion.div
                    animate={{
                      boxShadow: [
                        "0 0 0 0 rgba(245, 158, 11, 0.4)",
                        "0 0 0 10px rgba(245, 158, 11, 0)",
                        "0 0 0 0 rgba(245, 158, 11, 0)",
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                    className="relative"
                  >
                    <Button
                      onClick={handleValidationSubmit}
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 px-6 py-3 rounded-full border-2 border-white"
                      size="lg"
                    >
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{
                          duration: 0.5,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatDelay: 3,
                        }}
                        className="mr-2"
                      >
                        <Shield className="h-5 w-5" />
                      </motion.div>
                      <span className="font-bold">Konfirmasi Validasi</span>
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{
                          duration: 1,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                        }}
                        className="ml-2"
                      >
                        <ArrowRight className="h-5 w-5" />
                      </motion.div>
                    </Button>

                    {/* Floating badge showing completion status */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1, type: "spring", stiffness: 300 }}
                      className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white shadow-lg"
                    >
                      <Check className="h-3 w-3" />
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <DialogHeader className="border-b border-gradient-to-r from-yellow-200 to-amber-200 pb-6 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <motion.div
                    initial={{ rotate: -180, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="p-3 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-2xl shadow-lg"
                  >
                    <Shield className="h-7 w-7 text-white" />
                  </motion.div>
                  <div>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                      Validasi Output
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 mt-1 font-medium">
                      {submission.noComtab} • {submission.judul}
                    </DialogDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className="bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200 px-4 py-2">
                    <Star className="h-4 w-4 mr-2" />
                    {currentStep + 1} dari {approvedItems.length}
                  </Badge>
                  {canSubmit && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                    >
                      <Badge className="bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200 px-4 py-2">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Siap Konfirmasi
                      </Badge>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="mt-6"
              >
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span className="font-medium">Progress Validasi</span>
                  <span
                    className={cn(
                      "font-bold transition-colors duration-300",
                      canSubmit ? "text-yellow-600" : "text-yellow-600",
                    )}
                  >
                    {getValidatedCount()} / {approvedItems.length} selesai
                    {canSubmit && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="ml-2 text-yellow-600"
                      >
                        ✓ Lengkap
                      </motion.span>
                    )}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(getValidatedCount() / approvedItems.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className={cn(
                      "h-3 rounded-full shadow-sm transition-all duration-500",
                      canSubmit
                        ? "bg-gradient-to-r from-yellow-500 to-amber-500"
                        : "bg-gradient-to-r from-yellow-500 to-amber-500",
                    )}
                  />
                </div>
              </motion.div>
            </DialogHeader>

            {/* Content - Make this scrollable */}
            <div className="flex-1 overflow-hidden min-h-0">
              <ScrollArea className="h-full">
                <div className="grid grid-cols-12 gap-6 p-6">
                  {/* Left Sidebar - Content List and Document Info in Tabs */}
                  <div className="col-span-4 space-y-4">
                    <Tabs defaultValue="content" className="h-full">
                      <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-amber-100 to-yellow-100 shadow-sm">
                        <TabsTrigger
                          value="content"
                          className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 text-xs"
                        >
                          <Activity className="h-3 w-3 mr-1" />
                          Konten
                        </TabsTrigger>
                        <TabsTrigger
                          value="info"
                          className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 text-xs"
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Info
                        </TabsTrigger>
                      </TabsList>

                      <div className="mt-4">
                        <TabsContent value="content" className="space-y-4 m-0">
                          {/* Content List */}
                          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 shadow-lg">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm flex items-center space-x-2">
                                <Activity className="h-4 w-4 text-amber-600" />
                                <span>Konten Disetujui</span>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ScrollArea className="h-[60vh]">
                                <div className="space-y-3">
                                  {approvedItems.map((item, index) => {
                                    const decision = validationDecisions[item.id]
                                    const isActive = currentStep === index

                                    return (
                                      <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={cn(
                                          "p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 shadow-md",
                                          isActive
                                            ? "border-yellow-400 bg-gradient-to-r from-yellow-100 to-amber-100 shadow-lg"
                                            : "border-gray-200 bg-white hover:border-yellow-300 hover:shadow-lg",
                                        )}
                                        onClick={() => setCurrentStep(index)}
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center space-x-2">
                                            {getContentTypeIcon(item.jenisKonten)}
                                            <div className="flex-1">
                                              <p className="font-semibold text-gray-900 text-xs">{item.nama}</p>
                                              <p className="text-xs text-gray-600 capitalize">
                                                {item.jenisKonten.replace("-", " ")}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="flex items-center space-x-1">
                                            {decision === true && (
                                              <Badge className="bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200 text-xs px-1 py-0">
                                                <CheckCircle className="h-2 w-2 mr-1" />✓
                                              </Badge>
                                            )}
                                            {decision === false && (
                                              <Badge className="bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200 text-xs px-1 py-0">
                                                <XCircle className="h-2 w-2 mr-1" />✗
                                              </Badge>
                                            )}
                                            {(decision === null || decision === undefined) && (
                                              <Badge className="bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 border-orange-200 text-xs px-1 py-0">
                                                <Clock className="h-2 w-2 mr-1" />?
                                              </Badge>
                                            )}
                                            {isActive && (
                                              <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-2 h-2 bg-yellow-500 rounded-full"
                                              />
                                            )}
                                          </div>
                                        </div>
                                      </motion.div>
                                    )
                                  })}
                                </div>
                              </ScrollArea>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="info" className="space-y-4 m-0">
                          <ScrollArea className="h-[60vh]">
                            <div className="space-y-4">
                              {/* Enhanced Document Info */}
                              <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 shadow-lg">
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-sm flex items-center space-x-2">
                                    <FileText className="h-4 w-4 text-yellow-600" />
                                    <span>Informasi Dokumen</span>
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-xs">
                                  {/* Basic Info */}
                                  <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <span className="text-gray-600 text-xs font-medium">No. Comtab:</span>
                                        <p className="font-bold text-gray-900 text-xs">{submission.noComtab}</p>
                                      </div>
                                      <div>
                                        <span className="text-gray-600 text-xs font-medium">PIN:</span>
                                        <p className="font-bold text-gray-900 text-xs">{submission.pin}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-gray-600 text-xs font-medium">Judul:</span>
                                      <p className="font-bold text-gray-900 text-xs">{submission.judul}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-600 text-xs font-medium">Tema:</span>
                                      <p className="font-bold text-gray-900 text-xs">{submission.tema}</p>
                                    </div>
                                  </div>

                                  {/* Media Info */}
                                  <div className="space-y-2">
                                    <div>
                                      <span className="text-gray-600 text-xs font-medium">Media Pemerintah:</span>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {submission.mediaPemerintah.map((media, index) => (
                                          <Badge
                                            key={index}
                                            className="bg-blue-100 text-blue-800 border-blue-200 text-xs px-1 py-0"
                                          >
                                            {getMediaIcon(media)}
                                            <span className="ml-1 capitalize">{media}</span>
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-gray-600 text-xs font-medium">Media Massa:</span>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {submission.mediaMassa.map((media, index) => (
                                          <Badge
                                            key={index}
                                            className="bg-purple-100 text-purple-800 border-purple-200 text-xs px-1 py-0"
                                          >
                                            {getMediaIcon(media)}
                                            <span className="ml-1 capitalize">{media}</span>
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Personnel Info */}
                                  <div className="space-y-2">
                                    <div>
                                      <span className="text-gray-600 text-xs font-medium">Petugas Pelaksana:</span>
                                      <p className="font-bold text-gray-900 text-xs">{submission.petugasPelaksana}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-600 text-xs font-medium">Supervisor:</span>
                                      <p className="font-bold text-gray-900 text-xs">{submission.supervisor}</p>
                                    </div>
                                  </div>

                                  {/* Production Info */}
                                  <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <span className="text-gray-600 text-xs font-medium">Durasi:</span>
                                        <p className="font-bold text-gray-900 text-xs">{submission.durasi}</p>
                                      </div>
                                      <div>
                                        <span className="text-gray-600 text-xs font-medium">Jumlah Produksi:</span>
                                        <p className="font-bold text-gray-900 text-xs">{submission.jumlahProduksi}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Dates */}
                                  <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <span className="text-gray-600 text-xs font-medium">Tanggal Order:</span>
                                        <p className="font-bold text-gray-900 text-xs">
                                          {formatDate(submission.tanggalOrder)}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-gray-600 text-xs font-medium">Tanggal Submit:</span>
                                        <p className="font-bold text-gray-900 text-xs">
                                          {formatDate(submission.tanggalSubmit)}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </ScrollArea>
                        </TabsContent>
                      </div>
                    </Tabs>
                  </div>

                  {/* Main Content Area - Validation Interface */}
                  <div className="col-span-8 space-y-6">
                    {/* Current Content Item Header */}

                    {/* Keputusan Konten Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 shadow-lg">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <Shield className="h-5 w-5 text-yellow-600" />
                            <span>Keputusan Konten</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <ScrollArea className="h-[60vh] px-6 py-4">
                            <div className="space-y-6">
                              {/* Validation Decision Buttons */}
                              <div className="space-y-4">
                                <Label className="text-base font-semibold text-gray-900">
                                  Apakah konten ini layak untuk tayang?
                                </Label>
                                <div className="grid grid-cols-2 gap-4">
                                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button
                                      variant={currentDecision === true ? "default" : "outline"}
                                      onClick={() => handleValidationDecisionChange(true)}
                                      className={cn(
                                        "w-full h-16 text-lg font-semibold transition-all duration-300",
                                        currentDecision === true
                                          ? "bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white shadow-lg"
                                          : "border-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-400",
                                      )}
                                    >
                                      <ThumbsUp className="h-6 w-6 mr-3" />
                                      Tayang
                                    </Button>
                                  </motion.div>

                                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button
                                      variant={currentDecision === false ? "default" : "outline"}
                                      onClick={() => handleValidationDecisionChange(false)}
                                      className={cn(
                                        "w-full h-16 text-lg font-semibold transition-all duration-300",
                                        currentDecision === false
                                          ? "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg"
                                          : "border-2 border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400",
                                      )}
                                    >
                                      <ThumbsDown className="h-6 w-6 mr-3" />
                                      Tidak Tayang
                                    </Button>
                                  </motion.div>
                                </div>
                              </div>

                              {/* Tayang Fields - Show when Tayang is selected */}
                              <AnimatePresence>
                                {currentDecision === true && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0, y: -20 }}
                                    animate={{ opacity: 1, height: "auto", y: 0 }}
                                    exit={{ opacity: 0, height: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200"
                                  >
                                    <h4 className="font-semibold text-yellow-800 flex items-center">
                                      <Calendar className="h-4 w-4 mr-2" />
                                      Detail Publikasi
                                    </h4>

                                    {/* Tanggal Tayang */}
                                    <div className="space-y-2">
                                      <Label htmlFor="tanggal-tayang" className="text-sm font-semibold text-gray-900">
                                        Tanggal Tayang *
                                      </Label>
                                      <Input
                                        id="tanggal-tayang"
                                        type="date"
                                        value={currentTayangDate}
                                        onChange={(e) => handleTayangDateChange(e.target.value)}
                                        className="border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500"
                                      />
                                      {!currentTayangDate.trim() && (
                                        <p className="text-yellow-600 text-sm flex items-center">
                                          <AlertCircle className="h-4 w-4 mr-1" />
                                          Tanggal tayang wajib diisi
                                        </p>
                                      )}
                                    </div>

                                    {/* Hasil Produk Upload */}
                                    <div className="space-y-3">
                                      <Label className="text-sm font-semibold text-gray-900">
                                        Hasil Produk * (File atau Link)
                                      </Label>

                                      {/* File Upload */}
                                      <div className="space-y-2">
                                        <Label className="text-xs text-gray-600">Upload File</Label>
                                        <div className="flex items-center space-x-2">
                                          <Input
                                            type="file"
                                            onChange={handleHasilFileChange}
                                            className="flex-1 border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500"
                                            accept="*/*"
                                          />
                                          {currentHasilFile && (
                                            <Button
                                              type="button"
                                              variant="outline"
                                              size="sm"
                                              onClick={removeHasilFile}
                                              className="text-red-600 border-red-300 hover:bg-red-50 bg-transparent"
                                            >
                                              <X className="h-4 w-4" />
                                            </Button>
                                          )}
                                        </div>
                                        {currentHasilFile && (
                                          <div className="p-2 bg-green-50 rounded border border-green-200">
                                            <p className="text-xs text-green-700 flex items-center">
                                              <Upload className="h-3 w-3 mr-1" />
                                              {getFileDisplayName(currentHasilFile)}
                                            </p>
                                          </div>
                                        )}
                                      </div>

                                      {/* Link Input */}
                                      <div className="space-y-2">
                                        <Label className="text-xs text-gray-600">Atau Masukkan Link</Label>
                                        <Input
                                          type="url"
                                          placeholder="https://example.com/hasil-produk"
                                          value={currentHasilLink}
                                          onChange={(e) => handleHasilLinkChange(e.target.value)}
                                          className="border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500"
                                        />
                                        {currentHasilLink && (
                                          <div className="p-2 bg-blue-50 rounded border border-blue-200">
                                            <p className="text-xs text-blue-700 flex items-center">
                                              <LinkIcon className="h-3 w-3 mr-1" />
                                              {currentHasilLink}
                                            </p>
                                          </div>
                                        )}
                                      </div>

                                      {!currentHasilFile && !currentHasilLink.trim() && (
                                        <p className="text-yellow-600 text-sm flex items-center">
                                          <AlertCircle className="h-4 w-4 mr-1" />
                                          Harap upload file atau masukkan link hasil produk
                                        </p>
                                      )}
                                    </div>

                                    {/* Preview Existing Files */}
                                    {(validationItem.hasilProdukFile || validationItem.hasilProdukLink) && (
                                      <div className="space-y-2">
                                        <Label className="text-xs text-gray-600">File Hasil Produksi yang Ada</Label>

                                        {/* Production Result File */}
                                        {validationItem.hasilProdukFile && (
                                          <div className="bg-white rounded-lg p-3 border border-amber-200 shadow-sm">
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center space-x-3">
                                                {getFileIcon(validationItem.hasilProdukFile)}
                                                <div>
                                                  <p className="font-semibold text-gray-900 text-sm">Hasil Produksi</p>
                                                  <p className="text-xs text-gray-600">
                                                    {getFileDisplayName(validationItem.hasilProdukFile)}
                                                  </p>
                                                </div>
                                              </div>
                                              <div className="flex items-center space-x-2">
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() =>
                                                    handlePreviewFile(validationItem.hasilProdukFile, "Hasil Produksi")
                                                  }
                                                  className="text-amber-600 border-amber-300 hover:bg-amber-50"
                                                >
                                                  <Eye className="h-4 w-4 mr-1" />
                                                  Preview
                                                </Button>
                                                {!isFileLink(validationItem.hasilProdukFile) && (
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                      downloadFile(validationItem.hasilProdukFile, "hasil-produksi")
                                                    }
                                                    className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                                                  >
                                                    <Download className="h-4 w-4 mr-1" />
                                                    Download
                                                  </Button>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        )}

                                        {/* Production Result Link */}
                                        {validationItem.hasilProdukLink && (
                                          <div className="bg-white rounded-lg p-3 border border-amber-200 shadow-sm">
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center space-x-3">
                                                <Globe className="h-8 w-8 text-amber-500" />
                                                <div>
                                                  <p className="font-semibold text-gray-900 text-sm">
                                                    Link Hasil Produksi
                                                  </p>
                                                  <p className="text-xs text-gray-600 break-all">
                                                    {validationItem.hasilProdukLink.length > 50
                                                      ? validationItem.hasilProdukLink.substring(0, 50) + "..."
                                                      : validationItem.hasilProdukLink}
                                                  </p>
                                                </div>
                                              </div>
                                              <div className="flex items-center space-x-2">
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() =>
                                                    handlePreviewFile(
                                                      validationItem.hasilProdukLink,
                                                      "Link Hasil Produksi",
                                                    )
                                                  }
                                                  className="text-amber-600 border-amber-300 hover:bg-amber-50"
                                                >
                                                  <Eye className="h-4 w-4 mr-1" />
                                                  Buka Link
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              {/* Rejection Reason - Only show if "Tidak Tayang" is selected */}
                              <AnimatePresence>
                                {currentDecision === false && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0, y: -20 }}
                                    animate={{ opacity: 1, height: "auto", y: 0 }}
                                    exit={{ opacity: 0, height: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-3"
                                  >
                                    <Label htmlFor="rejection-reason" className="text-base font-semibold text-red-700">
                                      Alasan Tidak Tayang *
                                    </Label>
                                    <Textarea
                                      id="rejection-reason"
                                      placeholder="Jelaskan alasan mengapa konten ini tidak layak untuk tayang..."
                                      value={currentRejectionReason}
                                      onChange={(e) => handleRejectionReasonChange(e.target.value)}
                                      className="min-h-[100px] border-red-300 focus:border-red-500 focus:ring-red-500"
                                    />
                                    {currentDecision === false && !currentRejectionReason.trim() && (
                                      <p className="text-red-600 text-sm flex items-center">
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        Alasan penolakan wajib diisi
                                      </p>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              {/* Validation Notes - Always visible */}
                              <div className="space-y-3">
                                <Label htmlFor="validation-notes" className="text-base font-semibold text-gray-900">
                                  Catatan Validasi (Opsional)
                                </Label>
                                <Textarea
                                  id="validation-notes"
                                  placeholder="Tambahkan catatan atau komentar terkait validasi konten ini..."
                                  value={currentValidationNote}
                                  onChange={(e) => handleValidationNoteChange(e.target.value)}
                                  className="min-h-[80px] border-gray-300 focus:border-yellow-500 focus:ring-yellow-500"
                                />
                              </div>

                              {/* Validation Status Indicator */}
                              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                                <div className="flex items-center space-x-3">
                                  {isCurrentItemValid() ? (
                                    <CheckCircle className="h-6 w-6 text-yellow-500" />
                                  ) : (
                                    <Clock className="h-6 w-6 text-orange-500" />
                                  )}
                                  <div>
                                    <p className="font-semibold text-gray-900">
                                      {isCurrentItemValid() ? "Validasi Lengkap" : "Validasi Belum Lengkap"}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {isCurrentItemValid()
                                        ? "Konten ini sudah siap untuk dilanjutkan"
                                        : "Harap lengkapi keputusan validasi"}
                                    </p>
                                  </div>
                                </div>
                                {isCurrentItemValid() && (
                                  <Badge className="bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Selesai
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Navigation Controls */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="flex items-center justify-between"
                    >
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outline"
                          onClick={goToPreviousItem}
                          disabled={!canGoPrevious()}
                          className="px-6 py-3 border-2 border-gray-300 hover:border-gray-400 transition-all duration-200 bg-transparent"
                        >
                          <ChevronLeft className="h-4 w-4 mr-2" />
                          Konten Sebelumnya
                        </Button>
                      </motion.div>

                      <div className="flex items-center space-x-4">
                        <Badge className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-200 px-4 py-2">
                          <Target className="h-4 w-4 mr-2" />
                          {currentStep + 1} dari {approvedItems.length}
                        </Badge>
                      </div>

                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outline"
                          onClick={goToNextItem}
                          disabled={!canGoNext()}
                          className="px-6 py-3 border-2 border-gray-300 hover:border-gray-400 transition-all duration-200 bg-transparent"
                        >
                          Konten Selanjutnya
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal((prev) => ({ ...prev, isOpen: false }))}
        file={previewModal.file}
        url={previewModal.url}
        type={previewModal.type}
        fileName={previewModal.fileName}
        title={previewModal.title}
      />
    </>
  )
}

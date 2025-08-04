"use client"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Users,
  Sparkles,
  Globe,
  Hash,
  Video,
  Mic,
  ImageIcon,
  Eye,
  Shield,
  Clock,
  ChevronLeft,
  AudioWaveform,
  Layers,
  Zap,
  PlayCircle,
  PauseCircle,
  AlertCircle,
  FileCheck,
  Send,
  ChevronRight,
  ArrowRight,
  Target,
  Check,
  TrendingUp,
  Rocket,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import PreviewModal from "./preview-modal"
import { loadSubmissionsFromStorage, saveSubmissionsToStorage } from "@/lib/utils"
import { MobileContentReviewDialog } from "./mobile-content-review-dialog"

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
  tanggalReview?: string
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
}

interface ContentReviewDialogProps {
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

// Simplified Review Summary Confirmation Component
const ReviewSummaryConfirmation = ({
  contentItems,
  reviewDecisions,
  rejectionReasons,
  onConfirm,
  onBack,
  isSubmitting,
}: {
  contentItems: ContentItem[]
  reviewDecisions: Record<string, "approved" | "rejected" | null>
  rejectionReasons: Record<string, string>
  onConfirm: () => void
  onBack: () => void
  isSubmitting: boolean
}) => {
  const approvedItems = contentItems.filter((item) => reviewDecisions[item.id] === "approved")
  const rejectedItems = contentItems.filter((item) => reviewDecisions[item.id] === "rejected")

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-3 p-3 bg-blue-500 rounded-full w-16 h-16 flex items-center justify-center">
          <FileCheck className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-blue-600 mb-1">Konfirmasi Review</h3>
        <p className="text-sm text-gray-600">Periksa hasil review sebelum menyimpan</p>
      </div>

      {/* Summary Statistics - Horizontal Layout */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
          <div className="w-10 h-10 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-2">
            <CheckCircle className="h-5 w-5 text-white" />
          </div>
          <p className="text-xs font-medium text-green-700 mb-1">Disetujui</p>
          <p className="text-2xl font-bold text-green-800">{approvedItems.length}</p>
        </div>

        <div className="bg-red-50 rounded-lg p-4 text-center border border-red-200">
          <div className="w-10 h-10 mx-auto bg-red-500 rounded-full flex items-center justify-center mb-2">
            <XCircle className="h-5 w-5 text-white" />
          </div>
          <p className="text-xs font-medium text-red-700 mb-1">Ditolak</p>
          <p className="text-2xl font-bold text-red-800">{rejectedItems.length}</p>
        </div>
      </div>

      {/* Compact Content List */}
      <div className="bg-gray-50 rounded-lg p-3 border">
        <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1 text-blue-600" />
          Detail Review ({contentItems.length} konten)
        </h4>

        <ScrollArea className="max-h-32">
          <div className="space-y-2">
            {contentItems.map((item) => {
              const decision = reviewDecisions[item.id]
              return (
                <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded border text-xs">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {getContentTypeIcon(item.jenisKonten)}
                    <span className="font-medium text-gray-900 truncate">{item.nama}</span>
                  </div>
                  <Badge
                    className={cn(
                      "text-xs px-2 py-0",
                      decision === "approved"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : "bg-red-100 text-red-800 border-red-200",
                    )}
                  >
                    {decision === "approved" ? "✓" : "✗"}
                  </Badge>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center space-x-3 pt-2">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting} className="px-4 py-2 bg-transparent">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Kembali
        </Button>

        <Button
          onClick={onConfirm}
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Menyimpan...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-1" />
              Konfirmasi Review
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

// Simplified Confirmation Dialog Component
const EnhancedConfirmationDialog = ({
  isOpen,
  onOpenChange,
  submission,
  approvedItems,
  rejectedCount,
  onConfirm,
  isSubmitting,
  onBack,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  submission: Submission
  approvedItems: ContentItem[]
  rejectedCount: number
  onConfirm: () => void
  isSubmitting: boolean
  onBack: () => void
}) => {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
    }
  }, [isOpen])

  const handleConfirm = async () => {
    setCurrentStep(1)
    await onConfirm()
    setTimeout(() => {
      setCurrentStep(2)
    }, 1000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <div className="p-4">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 text-center"
              >
                {/* Header */}
                <div>
                  <div className="mx-auto mb-3 p-3 bg-blue-500 rounded-full w-16 h-16 flex items-center justify-center">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-blue-600 mb-1">Review Selesai!</h3>
                  <p className="text-sm text-gray-600">Dokumen {submission.noComtab} siap untuk validasi</p>
                </div>

                {/* Stats - Horizontal */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-xs font-medium text-green-700">Disetujui</p>
                    <p className="text-2xl font-bold text-green-800">{approvedItems.length}</p>
                  </div>

                  <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <XCircle className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-xs font-medium text-red-700">Ditolak</p>
                    <p className="text-2xl font-bold text-red-800">{rejectedCount}</p>
                  </div>
                </div>

                {/* Approved Items - Compact List */}
                {approvedItems.length > 0 && (
                  <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                    <h4 className="text-sm font-semibold text-emerald-900 mb-2">
                      Konten yang Disetujui ({approvedItems.length})
                    </h4>
                    <ScrollArea className="max-h-24">
                      <div className="space-y-1">
                        {approvedItems.map((item) => (
                          <div key={item.id} className="flex items-center space-x-2 text-xs">
                            {getContentTypeIcon(item.jenisKonten)}
                            <span className="font-medium text-gray-900 truncate">{item.nama}</span>
                            <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-center gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={onBack}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-transparent"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Kembali
                  </Button>

                  <Button
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Rocket className="h-4 w-4 mr-1" />
                    Lanjutkan
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="animate-spin mx-auto mb-4 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Memproses...</h3>
                <p className="text-sm text-gray-600">Menyiapkan dokumen untuk validasi</p>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="mx-auto mb-4 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-green-600 mb-2">Berhasil!</h3>
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <p className="text-sm text-gray-700">
                    Dokumen <span className="font-bold text-green-700">{submission.noComtab}</span> siap untuk validasi
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function ContentReviewDialog({
  isOpen,
  onOpenChange,
  submission,
  contentItem,
  onUpdate,
  onToast,
}: ContentReviewDialogProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [reviewDecisions, setReviewDecisions] = useState<Record<string, "approved" | "rejected" | null>>({})
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showReviewSummary, setShowReviewSummary] = useState(false)
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
      setReviewDecisions({})
      setRejectionReasons({})
      setShowReviewSummary(false)
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

  const contentItems = submission.contentItems?.filter((item) => item.status === "pending") || []
  const currentItem = contentItem || contentItems[currentStep]

  if (!currentItem && contentItems.length === 0) {
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
            <DialogTitle className="text-xl font-bold text-gray-900 mb-2">Tidak Ada Konten untuk Review</DialogTitle>
            <p className="text-gray-600 mb-6">Semua konten sudah direview atau belum ada konten yang perlu direview.</p>
            <Button onClick={() => onOpenChange(false)} className="bg-gradient-to-r from-blue-500 to-purple-600">
              Tutup
            </Button>
          </motion.div>
        </DialogContent>
      </Dialog>
    )
  }

  // Use mobile dialog on mobile devices
  if (isMobile) {
    return (
      <MobileContentReviewDialog
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        submission={submission}
        contentItem={contentItem}
        onUpdate={onUpdate}
        onToast={onToast}
      />
    )
  }

  const reviewItem = contentItems[currentStep] || contentItems[0]
  const currentDecision = reviewDecisions[reviewItem.id]
  const currentRejectionReason = rejectionReasons[reviewItem.id] || ""

  // Check if all content items have been reviewed
  const allItemsReviewed = contentItems.every(
    (item) => reviewDecisions[item.id] !== undefined && reviewDecisions[item.id] !== null,
  )

  // Check if any rejected items have rejection reasons
  const rejectedItemsHaveReasons = contentItems
    .filter((item) => reviewDecisions[item.id] === "rejected")
    .every((item) => rejectionReasons[item.id]?.trim())

  const canSubmit = allItemsReviewed && rejectedItemsHaveReasons

  const getReviewedCount = () => {
    return Object.values(reviewDecisions).filter((d) => d !== null).length
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

  // Handle review decision change
  const handleReviewDecisionChange = (decision: "approved" | "rejected") => {
    setReviewDecisions((prev) => ({
      ...prev,
      [reviewItem.id]: decision,
    }))

    if (decision === "approved") {
      setRejectionReasons((prev) => ({
        ...prev,
        [reviewItem.id]: "",
      }))
    }
  }

  // Handle rejection reason change
  const handleRejectionReasonChange = (reason: string) => {
    setRejectionReasons((prev) => ({
      ...prev,
      [reviewItem.id]: reason,
    }))
  }

  // Navigate to next content item
  const goToNextItem = () => {
    if (currentStep < contentItems.length - 1) {
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
    return currentStep < contentItems.length - 1
  }

  const canGoPrevious = () => {
    return currentStep > 0
  }

  const isCurrentItemValid = () => {
    const decision = reviewDecisions[reviewItem.id]
    if (!decision) return false
    if (decision === "rejected" && !rejectionReasons[reviewItem.id]?.trim()) return false
    return true
  }

  // Handle review submission - now shows summary first
  const handleReviewSubmit = async () => {
    if (!canSubmit) {
      onToast("Harap review semua konten dan berikan alasan untuk konten yang ditolak", "error")
      return
    }

    // Show review summary confirmation
    setShowReviewSummary(true)
  }

  // Handle confirmed review submission
  const handleConfirmedReviewSubmit = async () => {
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const submissions = loadSubmissionsFromStorage()
    const updatedSubmissions = submissions.map((sub: any) => {
      if (sub.id === submission.id) {
        const updatedContentItems = sub.contentItems?.map((contentItem: any) => {
          const decision = reviewDecisions[contentItem.id]
          if (decision) {
            return {
              ...contentItem,
              status: decision,
              alasanPenolakan: decision === "rejected" ? rejectionReasons[contentItem.id] : undefined,
              tanggalDiproses: new Date().toLocaleDateString("id-ID"),
              diprosesoleh: "Admin",
            }
          }
          return contentItem
        })

        const updatedSubmission = {
          ...sub,
          contentItems: updatedContentItems,
          lastModified: new Date(),
          tanggalReview: new Date().toISOString(), // Add review timestamp
        }
        updatedSubmission.workflowStage = getWorkflowStage(updatedSubmission)

        return updatedSubmission
      }
      return sub
    })

    saveSubmissionsToStorage(updatedSubmissions)
    onUpdate(updatedSubmissions)

    const approvedCount = Object.values(reviewDecisions).filter((d) => d === "approved").length
    const rejectedCount = Object.values(reviewDecisions).filter((d) => d === "rejected").length

    onToast(`Review selesai! ${approvedCount} konten disetujui, ${rejectedCount} konten ditolak`, "success")
    setIsSubmitting(false)
    setShowReviewSummary(false)

    // Show confirmation step if there are approved items
    if (approvedCount > 0) {
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
          workflowStage: "validation",
          lastModified: new Date(),
        }
      }
      return sub
    })

    saveSubmissionsToStorage(updatedSubmissions)
    onUpdate(updatedSubmissions)

    onToast("Review berhasil diselesaikan! Dokumen siap untuk tahap validasi.", "success")
    setIsSubmitting(false)
    onOpenChange(false)
  }

  // Show review summary confirmation
  if (showReviewSummary) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden mx-4 md:mx-auto">
          <ScrollArea className="max-h-[75vh]">
            <div className="p-4">
              <ReviewSummaryConfirmation
                contentItems={contentItems}
                reviewDecisions={reviewDecisions}
                rejectionReasons={rejectionReasons}
                onConfirm={handleConfirmedReviewSubmit}
                onBack={() => setShowReviewSummary(false)}
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
    const approvedItems = contentItems.filter((item) => reviewDecisions[item.id] === "approved")
    const rejectedCount = Object.values(reviewDecisions).filter((d) => d === "rejected").length

    return (
      <EnhancedConfirmationDialog
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        submission={submission}
        approvedItems={approvedItems}
        rejectedCount={rejectedCount}
        onConfirm={handleConfirmDocument}
        isSubmitting={isSubmitting}
        onBack={() => setShowConfirmation(false)}
      />
    )
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-7xl h-[95vh] overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 mx-4 md:mx-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full flex flex-col relative"
          >
            {/* Floating Confirmation Button - appears when all reviews are complete - positioned at bottom right */}
            <AnimatePresence>
              {canSubmit && !showReviewSummary && !showConfirmation && (
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
                        "0 0 0 0 rgba(59, 130, 246, 0.4)",
                        "0 0 0 10px rgba(59, 130, 246, 0)",
                        "0 0 0 0 rgba(59, 130, 246, 0)",
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
                      onClick={handleReviewSubmit}
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 px-6 py-3 rounded-full border-2 border-white"
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
                        <FileCheck className="h-5 w-5" />
                      </motion.div>
                      <span className="font-bold">Konfirmasi Review</span>
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
                      className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white shadow-lg"
                    >
                      <Check className="h-3 w-3" />
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <DialogHeader className="border-b border-gradient-to-r from-blue-200 to-indigo-200 pb-6 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <motion.div
                    initial={{ rotate: -180, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg"
                  >
                    <Eye className="h-7 w-7 text-white" />
                  </motion.div>
                  <div>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Review Konten
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 mt-1 font-medium">
                      {submission.noComtab} • {submission.judul}
                    </DialogDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200 px-4 py-2">
                    <Sparkles className="h-4 w-4 mr-2" />
                    {currentStep + 1} dari {contentItems.length}
                  </Badge>
                  {canSubmit && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                    >
                      <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200 px-4 py-2">
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
                  <span className="font-medium">Progress Review</span>
                  <span
                    className={cn(
                      "font-bold transition-colors duration-300",
                      canSubmit ? "text-green-600" : "text-blue-600",
                    )}
                  >
                    {getReviewedCount()} / {contentItems.length} selesai
                    {canSubmit && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="ml-2 text-green-600"
                      >
                        ✓ Lengkap
                      </motion.span>
                    )}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(getReviewedCount() / contentItems.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className={cn(
                      "h-3 rounded-full shadow-sm transition-all duration-500",
                      canSubmit
                        ? "bg-gradient-to-r from-green-500 to-emerald-500"
                        : "bg-gradient-to-r from-blue-500 to-indigo-500",
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
                      <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-blue-100 to-indigo-100 shadow-sm">
                        <TabsTrigger
                          value="content"
                          className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 text-xs"
                        >
                          <Sparkles className="h-3 w-3 mr-1" />
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
                          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm flex items-center space-x-2">
                                <Sparkles className="h-4 w-4 text-blue-600" />
                                <span>Konten untuk Review</span>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ScrollArea className="h-[60vh]">
                                <div className="space-y-3">
                                  {contentItems.map((item, index) => {
                                    const decision = reviewDecisions[item.id]
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
                                            ? "border-blue-400 bg-gradient-to-r from-blue-100 to-indigo-100 shadow-lg"
                                            : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg",
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
                                            {decision === "approved" && (
                                              <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200 text-xs px-1 py-0">
                                                <CheckCircle className="h-2 w-2 mr-1" />✓
                                              </Badge>
                                            )}
                                            {decision === "rejected" && (
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
                                                className="w-2 h-2 bg-blue-500 rounded-full"
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
                              <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200 shadow-lg">
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-sm flex items-center space-x-2">
                                    <FileText className="h-4 w-4 text-indigo-600" />
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
                                      <p className="font-semibold text-gray-900 text-xs">{submission.judul}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-600 text-xs font-medium">Tema:</span>
                                      <p className="text-gray-900 text-xs">{submission.tema}</p>
                                    </div>
                                  </div>

                                  {/* Media Info */}
                                  <div className="pt-2 border-t border-indigo-200">
                                    <div className="space-y-2">
                                      <div>
                                        <span className="text-gray-600 text-xs font-medium">Jenis Media:</span>
                                        <p className="text-gray-900 text-xs capitalize">
                                          {submission.jenisMedia.replace("-", " ")}
                                        </p>
                                      </div>
                                      {submission.mediaPemerintah && submission.mediaPemerintah.length > 0 && (
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
                                      )}
                                      {submission.mediaMassa && submission.mediaMassa.length > 0 && (
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
                                      )}
                                    </div>
                                  </div>

                                  {/* Team Info */}
                                  <div className="pt-2 border-t border-indigo-200">
                                    <div className="space-y-2">
                                      <div>
                                        <span className="text-gray-600 text-xs font-medium">Petugas:</span>
                                        <p className="text-gray-900 text-xs">{submission.petugasPelaksana}</p>
                                      </div>
                                      <div>
                                        <span className="text-gray-600 text-xs font-medium">Supervisor:</span>
                                        <p className="text-gray-900 text-xs">{submission.supervisor}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Production Info */}
                                  <div className="pt-2 border-t border-indigo-200">
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <span className="text-gray-600 text-xs font-medium">Durasi:</span>
                                        <p className="text-gray-900 text-xs">{submission.durasi}</p>
                                      </div>
                                      <div>
                                        <span className="text-gray-600 text-xs font-medium">Jumlah:</span>
                                        <p className="text-gray-900 text-xs">{submission.jumlahProduksi}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Dates */}
                                  <div className="pt-2 border-t border-indigo-200">
                                    <div className="space-y-2">
                                      <div>
                                        <span className="text-gray-600 text-xs font-medium">Tanggal Order:</span>
                                        <p className="text-gray-900 text-xs">{formatDate(submission.tanggalOrder)}</p>
                                      </div>
                                      <div>
                                        <span className="text-gray-600 text-xs font-medium">Tanggal Submit:</span>
                                        <p className="text-gray-900 text-xs">{formatDate(submission.tanggalSubmit)}</p>
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

                  {/* Main Content Area - Review Interface */}
                  <div className="col-span-8">
                    <Card className="h-full bg-gradient-to-br from-white to-blue-50 border-blue-200 shadow-xl">
                      <CardHeader className="border-b border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getContentTypeIcon(reviewItem.jenisKonten)}
                            <div>
                              <CardTitle className="text-lg text-gray-900">{reviewItem.nama}</CardTitle>
                              <p className="text-sm text-gray-600 capitalize">
                                {reviewItem.jenisKonten.replace("-", " ")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {/* Navigation buttons */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={goToPreviousItem}
                              disabled={!canGoPrevious()}
                              className="bg-white border-gray-300 hover:bg-gray-50"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={goToNextItem}
                              disabled={!canGoNext()}
                              className="bg-white border-gray-300 hover:bg-gray-50"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="p-6">
                        <ScrollArea className="h-[calc(100vh-400px)]">
                          <div className="space-y-6">
                            {/* Content Details */}
                            <div className="grid grid-cols-2 gap-6">
                              {/* Basic Info */}
                              <div className="space-y-4">
                                <div>
                                  <Label className="text-sm font-semibold text-gray-700">Nomor Surat</Label>
                                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-lg mt-1">
                                    {reviewItem.nomorSurat || "Tidak ada"}
                                  </p>
                                </div>

                                <div>
                                  <Label className="text-sm font-semibold text-gray-700">Media Pemerintah</Label>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {reviewItem.mediaPemerintah?.map((media, index) => (
                                      <Badge key={index} className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                                        {getMediaIcon(media)}
                                        <span className="ml-1 capitalize">{media}</span>
                                      </Badge>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <Label className="text-sm font-semibold text-gray-700">Media Massa</Label>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {reviewItem.mediaMassa?.map((media, index) => (
                                      <Badge
                                        key={index}
                                        className="bg-purple-100 text-purple-800 border-purple-200 text-xs"
                                      >
                                        {getMediaIcon(media)}
                                        <span className="ml-1 capitalize">{media}</span>
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Dates */}
                              <div className="space-y-4">
                                <div>
                                  <Label className="text-sm font-semibold text-gray-700">Tanggal Order Masuk</Label>
                                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-lg mt-1">
                                    {formatDate(reviewItem.tanggalOrderMasuk)}
                                  </p>
                                </div>

                                <div>
                                  <Label className="text-sm font-semibold text-gray-700">Tanggal Jadi</Label>
                                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-lg mt-1">
                                    {formatDate(reviewItem.tanggalJadi)}
                                  </p>
                                </div>

                                <div>
                                  <Label className="text-sm font-semibold text-gray-700">Tanggal Tayang</Label>
                                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-lg mt-1">
                                    {formatDate(reviewItem.tanggalTayang)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Narasi Text */}
                            {reviewItem.narasiText && (
                              <div>
                                <Label className="text-sm font-semibold text-gray-700">Narasi</Label>
                                <div className="bg-gray-50 p-4 rounded-lg mt-1 border">
                                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{reviewItem.narasiText}</p>
                                </div>
                              </div>
                            )}

                            {/* Keterangan */}
                            {reviewItem.keterangan && (
                              <div>
                                <Label className="text-sm font-semibold text-gray-700">Keterangan</Label>
                                <div className="bg-gray-50 p-4 rounded-lg mt-1 border">
                                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{reviewItem.keterangan}</p>
                                </div>
                              </div>
                            )}

                            {/* File Sources */}
                            <div className="grid grid-cols-2 gap-6">
                              {/* Source Files */}
                              <div className="space-y-4">
                                <h4 className="font-semibold text-gray-900 text-sm">File Sumber</h4>

                                {/* Narasi Files */}
                                {(reviewItem.sourceNarasi?.length > 0 ||
                                  reviewItem.narasiFile ||
                                  reviewItem.suratFile) && (
                                  <div>
                                    <Label className="text-xs font-medium text-gray-600">Narasi</Label>
                                    <div className="space-y-2 mt-1">
                                      {reviewItem.narasiFile && (
                                        <div
                                          className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
                                          onClick={() => handlePreviewFile(reviewItem.narasiFile, "File Narasi")}
                                        >
                                          <div className="flex items-center space-x-2">
                                            <FileText className="h-4 w-4 text-blue-600" />
                                            <span className="text-xs text-gray-900">
                                              {getFileDisplayName(reviewItem.narasiFile)}
                                            </span>
                                          </div>
                                          <Eye className="h-4 w-4 text-blue-600" />
                                        </div>
                                      )}
                                      {reviewItem.suratFile && (
                                        <div
                                          className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
                                          onClick={() => handlePreviewFile(reviewItem.suratFile, "File Surat")}
                                        >
                                          <div className="flex items-center space-x-2">
                                            <FileText className="h-4 w-4 text-blue-600" />
                                            <span className="text-xs text-gray-900">
                                              {getFileDisplayName(reviewItem.suratFile)}
                                            </span>
                                          </div>
                                          <Eye className="h-4 w-4 text-blue-600" />
                                        </div>
                                      )}
                                      {reviewItem.sourceNarasi?.map((source, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
                                          onClick={() => handlePreviewFile(source, `Narasi ${index + 1}`)}
                                        >
                                          <div className="flex items-center space-x-2">
                                            <FileText className="h-4 w-4 text-blue-600" />
                                            <span className="text-xs text-gray-900">{getFileDisplayName(source)}</span>
                                          </div>
                                          <Eye className="h-4 w-4 text-blue-600" />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Audio Dubbing Files */}
                                {(reviewItem.sourceAudioDubbing?.length > 0 ||
                                  reviewItem.audioDubbingFile ||
                                  reviewItem.audioDubbingLainLainFile) && (
                                  <div>
                                    <Label className="text-xs font-medium text-gray-600">Audio Dubbing</Label>
                                    <div className="space-y-2 mt-1">
                                      {reviewItem.audioDubbingFile && (
                                        <div
                                          className="flex items-center justify-between p-2 bg-purple-50 rounded-lg border border-purple-200 cursor-pointer hover:bg-purple-100 transition-colors"
                                          onClick={() =>
                                            handlePreviewFile(reviewItem.audioDubbingFile, "Audio Dubbing")
                                          }
                                        >
                                          <div className="flex items-center space-x-2">
                                            <AudioWaveform className="h-4 w-4 text-purple-600" />
                                            <span className="text-xs text-gray-900">
                                              {getFileDisplayName(reviewItem.audioDubbingFile)}
                                            </span>
                                          </div>
                                          <Eye className="h-4 w-4 text-purple-600" />
                                        </div>
                                      )}
                                      {reviewItem.audioDubbingLainLainFile && (
                                        <div
                                          className="flex items-center justify-between p-2 bg-purple-50 rounded-lg border border-purple-200 cursor-pointer hover:bg-purple-100 transition-colors"
                                          onClick={() =>
                                            handlePreviewFile(
                                              reviewItem.audioDubbingLainLainFile,
                                              "Audio Dubbing Lain-lain",
                                            )
                                          }
                                        >
                                          <div className="flex items-center space-x-2">
                                            <AudioWaveform className="h-4 w-4 text-purple-600" />
                                            <span className="text-xs text-gray-900">
                                              {getFileDisplayName(reviewItem.audioDubbingLainLainFile)}
                                            </span>
                                          </div>
                                          <Eye className="h-4 w-4 text-purple-600" />
                                        </div>
                                      )}
                                      {reviewItem.sourceAudioDubbing?.map((source, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center justify-between p-2 bg-purple-50 rounded-lg border border-purple-200 cursor-pointer hover:bg-purple-100 transition-colors"
                                          onClick={() => handlePreviewFile(source, `Audio Dubbing ${index + 1}`)}
                                        >
                                          <div className="flex items-center space-x-2">
                                            <AudioWaveform className="h-4 w-4 text-purple-600" />
                                            <span className="text-xs text-gray-900">{getFileDisplayName(source)}</span>
                                          </div>
                                          <Eye className="h-4 w-4 text-purple-600" />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Audio Backsound Files */}
                                {(reviewItem.sourceAudioBacksound?.length > 0 ||
                                  reviewItem.audioBacksoundFile ||
                                  reviewItem.audioBacksoundLainLainFile) && (
                                  <div>
                                    <Label className="text-xs font-medium text-gray-600">Audio Backsound</Label>
                                    <div className="space-y-2 mt-1">
                                      {reviewItem.audioBacksoundFile && (
                                        <div
                                          className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100 transition-colors"
                                          onClick={() =>
                                            handlePreviewFile(reviewItem.audioBacksoundFile, "Audio Backsound")
                                          }
                                        >
                                          <div className="flex items-center space-x-2">
                                            <Mic className="h-4 w-4 text-green-600" />
                                            <span className="text-xs text-gray-900">
                                              {getFileDisplayName(reviewItem.audioBacksoundFile)}
                                            </span>
                                          </div>
                                          <Eye className="h-4 w-4 text-green-600" />
                                        </div>
                                      )}
                                      {reviewItem.audioBacksoundLainLainFile && (
                                        <div
                                          className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100 transition-colors"
                                          onClick={() =>
                                            handlePreviewFile(
                                              reviewItem.audioBacksoundLainLainFile,
                                              "Audio Backsound Lain-lain",
                                            )
                                          }
                                        >
                                          <div className="flex items-center space-x-2">
                                            <Mic className="h-4 w-4 text-green-600" />
                                            <span className="text-xs text-gray-900">
                                              {getFileDisplayName(reviewItem.audioBacksoundLainLainFile)}
                                            </span>
                                          </div>
                                          <Eye className="h-4 w-4 text-green-600" />
                                        </div>
                                      )}
                                      {reviewItem.sourceAudioBacksound?.map((source, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100 transition-colors"
                                          onClick={() => handlePreviewFile(source, `Audio Backsound ${index + 1}`)}
                                        >
                                          <div className="flex items-center space-x-2">
                                            <Mic className="h-4 w-4 text-green-600" />
                                            <span className="text-xs text-gray-900">{getFileDisplayName(source)}</span>
                                          </div>
                                          <Eye className="h-4 w-4 text-green-600" />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Supporting Files and Result */}
                              <div className="space-y-4">
                                <h4 className="font-semibold text-gray-900 text-sm">File Pendukung & Hasil</h4>

                                {/* Supporting Files */}
                                {(reviewItem.sourcePendukungLainnya?.length > 0 ||
                                  reviewItem.pendukungVideoFile ||
                                  reviewItem.pendukungFotoFile ||
                                  reviewItem.pendukungLainLainFile) && (
                                  <div>
                                    <Label className="text-xs font-medium text-gray-600">File Pendukung</Label>
                                    <div className="space-y-2 mt-1">
                                      {reviewItem.pendukungVideoFile && (
                                        <div
                                          className="flex items-center justify-between p-2 bg-red-50 rounded-lg border border-red-200 cursor-pointer hover:bg-red-100 transition-colors"
                                          onClick={() =>
                                            handlePreviewFile(reviewItem.pendukungVideoFile, "Video Pendukung")
                                          }
                                        >
                                          <div className="flex items-center space-x-2">
                                            <Video className="h-4 w-4 text-red-600" />
                                            <span className="text-xs text-gray-900">
                                              {getFileDisplayName(reviewItem.pendukungVideoFile)}
                                            </span>
                                          </div>
                                          <Eye className="h-4 w-4 text-red-600" />
                                        </div>
                                      )}
                                      {reviewItem.pendukungFotoFile && (
                                        <div
                                          className="flex items-center justify-between p-2 bg-orange-50 rounded-lg border border-orange-200 cursor-pointer hover:bg-orange-100 transition-colors"
                                          onClick={() =>
                                            handlePreviewFile(reviewItem.pendukungFotoFile, "Foto Pendukung")
                                          }
                                        >
                                          <div className="flex items-center space-x-2">
                                            <ImageIcon className="h-4 w-4 text-orange-600" />
                                            <span className="text-xs text-gray-900">
                                              {getFileDisplayName(reviewItem.pendukungFotoFile)}
                                            </span>
                                          </div>
                                          <Eye className="h-4 w-4 text-orange-600" />
                                        </div>
                                      )}
                                      {reviewItem.pendukungLainLainFile && (
                                        <div
                                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                                          onClick={() =>
                                            handlePreviewFile(
                                              reviewItem.pendukungLainLainFile,
                                              "File Pendukung Lainnya",
                                            )
                                          }
                                        >
                                          <div className="flex items-center space-x-2">
                                            <Layers className="h-4 w-4 text-gray-600" />
                                            <span className="text-xs text-gray-900">
                                              {getFileDisplayName(reviewItem.pendukungLainLainFile)}
                                            </span>
                                          </div>
                                          <Eye className="h-4 w-4 text-gray-600" />
                                        </div>
                                      )}
                                      {reviewItem.sourcePendukungLainnya?.map((source, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                                          onClick={() => handlePreviewFile(source, `File Pendukung ${index + 1}`)}
                                        >
                                          <div className="flex items-center space-x-2">
                                            <Layers className="h-4 w-4 text-gray-600" />
                                            <span className="text-xs text-gray-900">{getFileDisplayName(source)}</span>
                                          </div>
                                          <Eye className="h-4 w-4 text-gray-600" />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Result Files */}
                                {(reviewItem.hasilProdukFile || reviewItem.hasilProdukLink) && (
                                  <div>
                                    <Label className="text-xs font-medium text-gray-600">Hasil Produksi</Label>
                                    <div className="space-y-2 mt-1">
                                      {reviewItem.hasilProdukFile && (
                                        <div
                                          className="flex items-center justify-between p-2 bg-indigo-50 rounded-lg border border-indigo-200 cursor-pointer hover:bg-indigo-100 transition-colors"
                                          onClick={() =>
                                            handlePreviewFile(reviewItem.hasilProdukFile, "Hasil Produksi")
                                          }
                                        >
                                          <div className="flex items-center space-x-2">
                                            <Sparkles className="h-4 w-4 text-indigo-600" />
                                            <span className="text-xs text-gray-900">
                                              {getFileDisplayName(reviewItem.hasilProdukFile)}
                                            </span>
                                          </div>
                                          <Eye className="h-4 w-4 text-indigo-600" />
                                        </div>
                                      )}
                                      {reviewItem.hasilProdukLink && (
                                        <div
                                          className="flex items-center justify-between p-2 bg-indigo-50 rounded-lg border border-indigo-200 cursor-pointer hover:bg-indigo-100 transition-colors"
                                          onClick={() =>
                                            handlePreviewFile(reviewItem.hasilProdukLink, "Link Hasil Produksi")
                                          }
                                        >
                                          <div className="flex items-center space-x-2">
                                            <Globe className="h-4 w-4 text-indigo-600" />
                                            <span className="text-xs text-gray-900">
                                              {getFileDisplayName(reviewItem.hasilProdukLink)}
                                            </span>
                                          </div>
                                          <Eye className="h-4 w-4 text-indigo-600" />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Review Decision Section */}
                            <div className="border-t border-gray-200 pt-6">
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                  <Shield className="h-5 w-5 mr-2 text-blue-600" />
                                  Keputusan Review
                                </h4>

                                {/* Decision Buttons */}
                                <div className="flex items-center space-x-4 mb-4">
                                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                      onClick={() => handleReviewDecisionChange("approved")}
                                      className={cn(
                                        "px-6 py-3 transition-all duration-300 shadow-lg",
                                        currentDecision === "approved"
                                          ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-200"
                                          : "bg-white text-green-700 border-2 border-green-300 hover:bg-green-50",
                                      )}
                                    >
                                      <CheckCircle className="h-5 w-5 mr-2" />
                                      Setujui Konten
                                    </Button>
                                  </motion.div>

                                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                      onClick={() => handleReviewDecisionChange("rejected")}
                                      className={cn(
                                        "px-6 py-3 transition-all duration-300 shadow-lg",
                                        currentDecision === "rejected"
                                          ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-red-200"
                                          : "bg-white text-red-700 border-2 border-red-300 hover:bg-red-50",
                                      )}
                                    >
                                      <XCircle className="h-5 w-5 mr-2" />
                                      Tolak Konten
                                    </Button>
                                  </motion.div>
                                </div>

                                {/* Rejection Reason */}
                                <AnimatePresence>
                                  {currentDecision === "rejected" && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0, y: -20 }}
                                      animate={{ opacity: 1, height: "auto", y: 0 }}
                                      exit={{ opacity: 0, height: 0, y: -20 }}
                                      transition={{ duration: 0.3 }}
                                      className="space-y-2"
                                    >
                                      <Label className="text-sm font-semibold text-red-700">
                                        Alasan Penolakan <span className="text-red-500">*</span>
                                      </Label>
                                      <Textarea
                                        value={currentRejectionReason}
                                        onChange={(e) => handleRejectionReasonChange(e.target.value)}
                                        placeholder="Jelaskan alasan mengapa konten ini ditolak..."
                                        className="min-h-[100px] border-red-200 focus:border-red-400 focus:ring-red-200"
                                      />
                                      {currentDecision === "rejected" && !currentRejectionReason.trim() && (
                                        <p className="text-xs text-red-600 flex items-center">
                                          <AlertTriangle className="h-3 w-3 mr-1" />
                                          Alasan penolakan wajib diisi
                                        </p>
                                      )}
                                    </motion.div>
                                  )}
                                </AnimatePresence>

                                {/* Decision Status */}
                                <AnimatePresence>
                                  {currentDecision && (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                      transition={{ duration: 0.3 }}
                                      className={cn(
                                        "mt-4 p-4 rounded-lg border-2 flex items-center space-x-3",
                                        currentDecision === "approved"
                                          ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                                          : "bg-gradient-to-r from-red-50 to-rose-50 border-red-200",
                                      )}
                                    >
                                      {currentDecision === "approved" ? (
                                        <CheckCircle className="h-6 w-6 text-green-600" />
                                      ) : (
                                        <XCircle className="h-6 w-6 text-red-600" />
                                      )}
                                      <div>
                                        <p
                                          className={cn(
                                            "font-semibold text-sm",
                                            currentDecision === "approved" ? "text-green-800" : "text-red-800",
                                          )}
                                        >
                                          {currentDecision === "approved" ? "Konten Disetujui" : "Konten Ditolak"}
                                        </p>
                                        <p
                                          className={cn(
                                            "text-xs",
                                            currentDecision === "approved" ? "text-green-700" : "text-red-700",
                                          )}
                                        >
                                          {currentDecision === "approved"
                                            ? "Konten ini akan dilanjutkan ke tahap validasi"
                                            : "Konten ini akan dikembalikan untuk perbaikan"}
                                        </p>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </ScrollArea>
            </div>

            {/* Bottom Navigation */}
            <div className="border-t border-gray-200 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={goToPreviousItem}
                    disabled={!canGoPrevious()}
                    className="bg-white border-gray-300 hover:bg-gray-50"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Sebelumnya
                  </Button>

                  <div className="text-sm text-gray-600">
                    <span className="font-medium">
                      {currentStep + 1} dari {contentItems.length}
                    </span>
                    {isCurrentItemValid() && <span className="ml-2 text-green-600 font-medium">✓ Selesai</span>}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {!isCurrentItemValid() && (
                    <p className="text-sm text-orange-600 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Harap buat keputusan review
                    </p>
                  )}

                  <Button
                    onClick={goToNextItem}
                    disabled={!canGoNext()}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                  >
                    Selanjutnya
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
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

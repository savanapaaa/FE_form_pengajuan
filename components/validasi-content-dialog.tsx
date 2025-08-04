"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Shield,
  Clock,
  Send,
  Check,
  Info,
  MessageSquare,
  Eye,
  Download,
  ExternalLink,
  Link,
  Video,
  ImageIcon,
  FileImage,
  File,
  Music,
  FileAudio,
  FileIcon as FilePdf,
  FileTextIcon,
  Star,
  Activity,
  Globe,
  Building,
  Users,
  Calendar,
  Target,
  Sparkles,
  PlayCircle,
  PauseCircle,
  Zap,
  Hash,
  Mic,
} from "lucide-react"

// Define interfaces for type safety
interface ContentItem {
  id: string
  nama: string
  jenisKonten: string
  status?: "pending" | "approved" | "rejected"
  isTayang?: boolean
  alasanTidakTayang?: string
  keteranganValidasi?: string
  hasilProdukFile?: any
  hasilProdukLink?: string
  narasiText?: string
  nomorSurat?: string
  keterangan?: string
  tanggalOrderMasuk?: Date | string
  tanggalJadi?: Date | string
  tanggalTayang?: Date | string
  mediaPemerintah?: string[]
  mediaMassa?: string[]
  tema?: string
  narasiFile?: any
  suratFile?: any
  audioDubbingFile?: any
  audioBacksoundFile?: any
  pendukungVideoFile?: any
  pendukungFotoFile?: any
  pendukungLainLainFile?: any
}

interface Submission {
  id: number
  noComtab: string
  tema: string
  judul: string
  tanggalSubmit: Date | undefined
  isConfirmed?: boolean
  isOutputValidated?: boolean
  contentItems?: ContentItem[]
  tanggalReview?: string
  pin?: string
  jenisMedia?: string
  durasi?: string
  jumlahProduksi?: string
  petugasPelaksana?: string
  supervisor?: string
  tanggalOrder?: Date | string
  tanggalKonfirmasi?: string
  jenisKonten?: string[]
  mediaPemerintah?: string[]
  mediaMassa?: string[]
}

interface ValidasiContentDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  submission: Submission
  onValidationComplete: (submissionId: number) => void
  onToast: (message: string, type: "success" | "error" | "info") => void
}

// Helper function to get file icon based on file type
const getFileIcon = (file: any) => {
  if (!file) return <File className="h-5 w-5 text-gray-500" />

  // If it's a string URL, try to determine type from extension
  if (typeof file === "string") {
    const extension = file.split(".").pop()?.toLowerCase()

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")) {
      return <FileImage className="h-5 w-5 text-blue-500" />
    }
    if (["mp4", "webm", "mov", "avi"].includes(extension || "")) {
      return <Video className="h-5 w-5 text-red-500" />
    }
    if (["mp3", "wav", "ogg"].includes(extension || "")) {
      return <FileAudio className="h-5 w-5 text-purple-500" />
    }
    if (extension === "pdf") {
      return <FilePdf className="h-5 w-5 text-red-700" />
    }
    if (["doc", "docx", "txt"].includes(extension || "")) {
      return <FileTextIcon className="h-5 w-5 text-blue-700" />
    }

    return <Link className="h-5 w-5 text-blue-500" />
  }

  // If it's a file object with type
  if (file && typeof file === "object" && file.type) {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />
    }
    if (file.type.startsWith("video/")) {
      return <Video className="h-5 w-5 text-red-500" />
    }
    if (file.type.startsWith("audio/")) {
      return <Music className="h-5 w-5 text-purple-500" />
    }
    if (file.type === "application/pdf") {
      return <FilePdf className="h-5 w-5 text-red-700" />
    }
    if (file.type.includes("document") || file.type.includes("text")) {
      return <FileTextIcon className="h-5 w-5 text-blue-700" />
    }
  }

  return <File className="h-5 w-5 text-gray-500" />
}

// Helper function to get content type icon
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

// Helper function to get media icon
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

// Helper function to get file display name
const getFileDisplayName = (file: any): string => {
  if (!file) return "Tidak ada file"
  if (typeof file === "string") return file.length > 30 ? file.substring(0, 30) + "..." : file
  if (file.name) return file.name.length > 30 ? file.name.substring(0, 30) + "..." : file.name
  return "File tidak dikenal"
}

// Helper function to check if file is a link
const isFileLink = (file: any): boolean => {
  return typeof file === "string" && (file.startsWith("http://") || file.startsWith("https://"))
}

// Helper function to format date
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

// File Card Component
const FileCard = ({
  file,
  title,
  icon,
  onPreview,
  onDownload,
}: {
  file: any
  title: string
  icon: React.ReactNode
  onPreview?: () => void
  onDownload?: () => void
}) => {
  if (!file) return null

  return (
    <div className="p-3 bg-white rounded-lg border border-yellow-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className="p-2 bg-yellow-100 rounded-lg">{icon}</div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-700">{title}</p>
            <p className="text-xs text-gray-600 truncate">{getFileDisplayName(file)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-2">
          {onPreview && (
            <Button variant="outline" size="sm" onClick={onPreview} className="p-2 bg-transparent">
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {onDownload && !isFileLink(file) && (
            <Button variant="outline" size="sm" onClick={onDownload} className="p-2 bg-transparent">
              <Download className="h-4 w-4" />
            </Button>
          )}
          {isFileLink(file) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(file, "_blank")}
              className="p-2 bg-transparent"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export function ValidasiContentDialog({
  isOpen,
  onOpenChange,
  submission,
  onValidationComplete,
  onToast,
}: ValidasiContentDialogProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [validationDecisions, setValidationDecisions] = useState<Record<string, boolean | null>>({})
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({})
  const [validationNotes, setValidationNotes] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
      setValidationDecisions({})
      setRejectionReasons({})
      setValidationNotes({})
    }
  }, [isOpen])

  const contentItems = submission?.contentItems?.filter((item) => item.status === "approved") || []
  const currentItem = contentItems[currentStep]

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
            <DialogTitle className="text-xl font-bold text-gray-900 mb-2">Tidak Ada Konten untuk Validasi</DialogTitle>
            <p className="text-gray-600 mb-6">
              Semua konten sudah divalidasi atau belum ada konten yang perlu divalidasi.
            </p>
            <Button onClick={() => onOpenChange(false)} className="bg-gradient-to-r from-yellow-500 to-amber-600">
              Tutup
            </Button>
          </motion.div>
        </DialogContent>
      </Dialog>
    )
  }

  // Handle validation decision change
  const handleValidationDecisionChange = (itemId: string, decision: boolean) => {
    setValidationDecisions((prev) => ({
      ...prev,
      [itemId]: decision,
    }))

    // Clear rejection reason if switching to approved
    if (decision === true) {
      setRejectionReasons((prev) => ({
        ...prev,
        [itemId]: "",
      }))
    }
  }

  // Handle rejection reason change
  const handleRejectionReasonChange = (itemId: string, reason: string) => {
    setRejectionReasons((prev) => ({
      ...prev,
      [itemId]: reason,
    }))
  }

  // Handle validation note change
  const handleValidationNoteChange = (itemId: string, note: string) => {
    setValidationNotes((prev) => ({
      ...prev,
      [itemId]: note,
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

  // Check if all content items have been validated
  const allItemsValidated = contentItems.every(
    (item) => validationDecisions[item.id] !== undefined && validationDecisions[item.id] !== null,
  )

  // Check if any rejected items have rejection reasons
  const rejectedItemsHaveReasons = contentItems
    .filter((item) => validationDecisions[item.id] === false)
    .every((item) => rejectionReasons[item.id]?.trim())

  const canSubmit = allItemsValidated && rejectedItemsHaveReasons

  // Get validated count
  const getValidatedCount = () => {
    return Object.values(validationDecisions).filter((d) => d !== null).length
  }

  // Handle validation submission
  const handleValidationSubmit = async () => {
    if (!canSubmit) {
      onToast("Harap validasi semua konten dan berikan alasan untuk konten yang tidak tayang", "error")
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    try {
      // Get submissions from localStorage
      const storedSubmissions = localStorage.getItem("submissions")
      if (!storedSubmissions) {
        throw new Error("Tidak dapat menemukan data submissions")
      }

      const submissions = JSON.parse(storedSubmissions)

      // Update the submission with validation decisions
      const updatedSubmissions = submissions.map((sub: any) => {
        if (sub.id === submission.id) {
          const updatedContentItems = sub.contentItems?.map((item: ContentItem) => {
            const decision = validationDecisions[item.id]
            if (decision !== undefined && decision !== null) {
              return {
                ...item,
                isTayang: decision,
                alasanTidakTayang: decision === false ? rejectionReasons[item.id] : undefined,
                keteranganValidasi: validationNotes[item.id] || "",
                tanggalValidasiTayang: new Date().toISOString(),
                validatorTayang: "Admin",
              }
            }
            return item
          })

          return {
            ...sub,
            contentItems: updatedContentItems,
            isOutputValidated: true,
            tanggalValidasiOutput: new Date().toISOString(),
            workflowStage: "completed",
          }
        }
        return sub
      })

      // Save updated submissions to localStorage
      localStorage.setItem("submissions", JSON.stringify(updatedSubmissions))

      // Show success message
      const tayangCount = Object.values(validationDecisions).filter((d) => d === true).length
      const tidakTayangCount = Object.values(validationDecisions).filter((d) => d === false).length
      onToast(`Validasi berhasil! ${tayangCount} konten tayang, ${tidakTayangCount} konten tidak tayang`, "success")

      // Notify parent component
      onValidationComplete(submission.id)

      // Close dialog
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving validation:", error)
      onToast("Terjadi kesalahan saat menyimpan validasi", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[95vh] overflow-hidden bg-gradient-to-br from-yellow-50 via-white to-amber-50">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full flex flex-col"
        >
          {/* Header */}
          <DialogHeader className="border-b border-yellow-200 pb-4 flex-shrink-0">
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
                    Validasi Konten
                  </DialogTitle>
                  <p className="text-gray-600 mt-1 font-medium">
                    {submission.noComtab} • {submission.judul}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className="bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200 px-4 py-2">
                  <Star className="h-4 w-4 mr-2" />
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
              className="mt-4"
            >
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span className="font-medium">Progress Validasi</span>
                <span
                  className={cn(
                    "font-bold transition-colors duration-300",
                    canSubmit ? "text-green-600" : "text-yellow-600",
                  )}
                >
                  {getValidatedCount()} / {contentItems.length} selesai
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
                  animate={{ width: `${(getValidatedCount() / contentItems.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className={cn(
                    "h-3 rounded-full shadow-sm transition-all duration-500",
                    canSubmit
                      ? "bg-gradient-to-r from-green-500 to-emerald-500"
                      : "bg-gradient-to-r from-yellow-500 to-amber-500",
                  )}
                />
              </div>
            </motion.div>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-hidden min-h-0">
            <div className="grid grid-cols-12 gap-6 p-6 h-full">
              {/* Left Sidebar - Content List */}
              <div className="col-span-4 space-y-4">
                <Tabs defaultValue="content" className="h-full">
                  <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-yellow-100 to-amber-100 shadow-sm">
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

                  <div className="mt-4 h-[calc(100%-3rem)]">
                    <TabsContent value="content" className="space-y-4 m-0 h-full">
                      <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 shadow-lg h-full">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center space-x-2">
                            <Activity className="h-4 w-4 text-yellow-600" />
                            <span>Daftar Konten</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[calc(100%-5rem)]">
                          <ScrollArea className="h-full">
                            <div className="space-y-3 pr-4">
                              {contentItems.map((item, index) => {
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
                                          <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200 text-xs px-1 py-0">
                                            <CheckCircle className="h-2 w-2 mr-1" />✓
                                          </Badge>
                                        )}
                                        {decision === false && (
                                          <Badge className="bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200 text-xs px-1 py-0">
                                            <XCircle className="h-2 w-2 mr-1" />✗
                                          </Badge>
                                        )}
                                        {decision === null && (
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

                    <TabsContent value="info" className="space-y-4 m-0 h-full">
                      <ScrollArea className="h-full">
                        <div className="space-y-4 pr-4">
                          {/* Document Info */}
                          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm flex items-center space-x-2">
                                <FileText className="h-4 w-4 text-green-600" />
                                <span>Informasi Dokumen</span>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-xs">
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
                                  <p className="font-semibold text-gray-900 leading-tight text-xs">
                                    {submission.judul}
                                  </p>
                                </div>

                                <div>
                                  <span className="text-gray-600 text-xs font-medium">Tema:</span>
                                  <p className="font-medium text-gray-900 text-xs">{submission.tema}</p>
                                </div>
                              </div>

                              {/* Production Details */}
                              <div className="border-t border-green-200 pt-2 space-y-2">
                                <h4 className="font-semibold text-green-800 text-xs flex items-center">
                                  <Target className="h-3 w-3 mr-1" />
                                  Detail Produksi
                                </h4>

                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <span className="text-gray-600 text-xs font-medium">Jenis Media:</span>
                                    <p className="font-medium text-gray-900 capitalize text-xs">
                                      {submission.jenisMedia}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-gray-600 text-xs font-medium">Durasi:</span>
                                    <p className="font-medium text-gray-900 text-xs">{submission.durasi}</p>
                                  </div>
                                </div>

                                <div>
                                  <span className="text-gray-600 text-xs font-medium">Jumlah Produksi:</span>
                                  <p className="font-medium text-gray-900 text-xs">{submission.jumlahProduksi}</p>
                                </div>

                                {submission.jenisKonten && (
                                  <div>
                                    <span className="text-gray-600 text-xs font-medium">Jenis Konten:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {submission.jenisKonten.map((jenis, index) => (
                                        <Badge
                                          key={index}
                                          variant="outline"
                                          className="text-xs bg-green-50 text-green-700 border-green-300 px-1 py-0"
                                        >
                                          {jenis.replace("-", " ")}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Team Info */}
                              <div className="border-t border-green-200 pt-2 space-y-2">
                                <h4 className="font-semibold text-green-800 text-xs flex items-center">
                                  <Users className="h-3 w-3 mr-1" />
                                  Tim Pelaksana
                                </h4>

                                <div className="space-y-1">
                                  <div className="flex items-center space-x-1">
                                    <Users className="h-3 w-3 text-green-500" />
                                    <div className="flex-1">
                                      <span className="text-gray-600 text-xs">Petugas:</span>
                                      <p className="font-medium text-gray-900 text-xs">{submission.petugasPelaksana}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Shield className="h-3 w-3 text-green-500" />
                                    <div className="flex-1">
                                      <span className="text-gray-600 text-xs">Supervisor:</span>
                                      <p className="font-medium text-gray-900 text-xs">{submission.supervisor}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Timeline */}
                              <div className="border-t border-green-200 pt-2 space-y-2">
                                <h4 className="font-semibold text-green-800 text-xs flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Timeline
                                </h4>

                                <div className="space-y-1">
                                  <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <div className="flex-1">
                                      <span className="text-gray-600 text-xs">Order:</span>
                                      <p className="font-medium text-gray-900 text-xs">
                                        {formatDate(submission.tanggalOrder)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <div className="flex-1">
                                      <span className="text-gray-600 text-xs">Submit:</span>
                                      <p className="font-medium text-gray-900 text-xs">
                                        {formatDate(submission.tanggalSubmit)}
                                      </p>
                                    </div>
                                  </div>
                                  {submission.tanggalKonfirmasi && (
                                    <div className="flex items-center space-x-1">
                                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                      <div className="flex-1">
                                        <span className="text-gray-600 text-xs">Konfirmasi:</span>
                                        <p className="font-medium text-gray-900 text-xs">
                                          {formatDate(submission.tanggalKonfirmasi)}
                                        </p>
                                      </div>
                                    </div>
                                  )}
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

              {/* Main Content */}
              <div className="col-span-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                  >
                    <Tabs defaultValue="validation" className="h-full">
                      <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-yellow-100 to-amber-100 shadow-lg text-xs">
                        <TabsTrigger
                          value="info"
                          className="data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
                        >
                          <Info className="h-4 w-4 mr-2" />
                          <span>Info</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="files"
                          className="data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          <span>File</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="media"
                          className="data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          <span>Media</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="validation"
                          className="data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          <span>Validasi</span>
                        </TabsTrigger>
                      </TabsList>

                      <div className="mt-6 h-[calc(100%-4rem)]">
                        <ScrollArea className="h-full">
                          <div className="pr-4">
                            <TabsContent value="info" className="space-y-6 m-0">
                              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 shadow-lg">
                                <CardHeader className="pb-3">
                                  <CardTitle className="flex items-center space-x-2 text-lg">
                                    {getContentTypeIcon(currentItem.jenisKonten)}
                                    <span className="truncate">{currentItem.nama}</span>
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-semibold text-gray-700">Jenis Konten</Label>
                                      <p className="text-gray-900 capitalize font-medium text-sm">
                                        {currentItem.jenisKonten.replace("-", " ")}
                                      </p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-semibold text-gray-700">Nomor Surat</Label>
                                      <p className="text-gray-900 font-medium text-sm">
                                        {currentItem.nomorSurat || "Tidak ada"}
                                      </p>
                                    </div>
                                  </div>

                                  {currentItem.narasiText && (
                                    <div>
                                      <Label className="text-sm font-semibold text-gray-700">Narasi Konten</Label>
                                      <div className="mt-2 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                                        <p className="text-gray-800 leading-relaxed text-sm">
                                          {currentItem.narasiText}
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {currentItem.keterangan && (
                                    <div>
                                      <Label className="text-sm font-semibold text-gray-700">Keterangan Tambahan</Label>
                                      <div className="mt-2 p-4 bg-orange-50 rounded-lg border border-orange-200">
                                        <p className="text-gray-800 leading-relaxed text-sm">
                                          {currentItem.keterangan}
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Timeline Information */}
                                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                                    <div>
                                      <Label className="text-sm font-semibold text-gray-700 flex items-center">
                                        <Calendar className="h-3 w-3 mr-1 text-blue-600" />
                                        Tgl. Order
                                      </Label>
                                      <p className="text-gray-900 font-medium text-sm">
                                        {formatDate(currentItem.tanggalOrderMasuk)}
                                      </p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-semibold text-gray-700 flex items-center">
                                        <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                                        Tgl. Jadi
                                      </Label>
                                      <p className="text-gray-900 font-medium text-sm">
                                        {formatDate(currentItem.tanggalJadi)}
                                      </p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-semibold text-gray-700 flex items-center">
                                        <Star className="h-3 w-3 mr-1 text-yellow-600" />
                                        Tgl. Tayang
                                      </Label>
                                      <p className="text-gray-900 font-medium text-sm">
                                        {formatDate(currentItem.tanggalTayang)}
                                      </p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </TabsContent>

                            <TabsContent value="files" className="space-y-6 m-0">
                              {/* Hasil Produksi Section */}
                              <Card className="bg-gradient-to-r from-purple-50/30 to-indigo-50/30 border border-purple-100/50 shadow-lg">
                                <CardHeader>
                                  <CardTitle className="flex items-center space-x-2 text-lg">
                                    <Sparkles className="h-5 w-5 text-purple-600" />
                                    <span>Hasil Produksi</span>
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid grid-cols-2 gap-4">
                                    {currentItem.hasilProdukFile && (
                                      <FileCard
                                        file={currentItem.hasilProdukFile}
                                        title="File Hasil Produksi"
                                        icon={getFileIcon(currentItem.hasilProdukFile)}
                                        onPreview={() => {
                                          // Handle preview
                                        }}
                                        onDownload={() => {
                                          // Handle download
                                        }}
                                      />
                                    )}

                                    {currentItem.hasilProdukLink && (
                                      <div className="p-3 bg-white rounded-lg border border-yellow-200 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                                            <Link className="h-5 w-5 text-blue-600" />
                                            <div className="min-w-0 flex-1">
                                              <p className="text-sm font-medium text-gray-700">Link Hasil Produksi</p>
                                              <p className="text-xs text-gray-600 truncate">
                                                {currentItem.hasilProdukLink}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="flex items-center space-x-2 ml-2">
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() =>
                                                window.open(
                                                  currentItem.hasilProdukLink,
                                                  "_blank",
                                                  "noopener,noreferrer",
                                                )
                                              }
                                              className="p-2 bg-transparent"
                                            >
                                              <ExternalLink className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {!currentItem.hasilProdukFile && !currentItem.hasilProdukLink && (
                                    <div className="text-center py-8">
                                      <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                        <FileText className="h-8 w-8 text-gray-400" />
                                      </div>
                                      <p className="text-gray-600 text-sm">Tidak ada hasil produksi</p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>

                              {/* Source Files Section */}
                              <Card className="bg-gradient-to-r from-blue-50/30 to-cyan-50/30 border border-blue-100/50 shadow-lg">
                                <CardHeader>
                                  <CardTitle className="flex items-center space-x-2 text-lg">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    <span>File Sumber</span>
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid grid-cols-2 gap-4">
                                    {currentItem.narasiFile && (
                                      <FileCard
                                        file={currentItem.narasiFile}
                                        title="File Narasi"
                                        icon={getFileIcon(currentItem.narasiFile)}
                                        onPreview={() => {
                                          // Handle preview
                                        }}
                                        onDownload={() => {
                                          // Handle download
                                        }}
                                      />
                                    )}

                                    {currentItem.suratFile && (
                                      <FileCard
                                        file={currentItem.suratFile}
                                        title="File Surat"
                                        icon={getFileIcon(currentItem.suratFile)}
                                        onPreview={() => {
                                          // Handle preview
                                        }}
                                        onDownload={() => {
                                          // Handle download
                                        }}
                                      />
                                    )}

                                    {currentItem.audioDubbingFile && (
                                      <FileCard
                                        file={currentItem.audioDubbingFile}
                                        title="Audio Dubbing"
                                        icon={getFileIcon(currentItem.audioDubbingFile)}
                                        onPreview={() => {
                                          // Handle preview
                                        }}
                                        onDownload={() => {
                                          // Handle download
                                        }}
                                      />
                                    )}

                                    {currentItem.audioBacksoundFile && (
                                      <FileCard
                                        file={currentItem.audioBacksoundFile}
                                        title="Audio Backsound"
                                        icon={getFileIcon(currentItem.audioBacksoundFile)}
                                        onPreview={() => {
                                          // Handle preview
                                        }}
                                        onDownload={() => {
                                          // Handle download
                                        }}
                                      />
                                    )}

                                    {currentItem.pendukungVideoFile && (
                                      <FileCard
                                        file={currentItem.pendukungVideoFile}
                                        title="Video Pendukung"
                                        icon={getFileIcon(currentItem.pendukungVideoFile)}
                                        onPreview={() => {
                                          // Handle preview
                                        }}
                                        onDownload={() => {
                                          // Handle download
                                        }}
                                      />
                                    )}

                                    {currentItem.pendukungFotoFile && (
                                      <FileCard
                                        file={currentItem.pendukungFotoFile}
                                        title="Foto Pendukung"
                                        icon={getFileIcon(currentItem.pendukungFotoFile)}
                                        onPreview={() => {
                                          // Handle preview
                                        }}
                                        onDownload={() => {
                                          // Handle download
                                        }}
                                      />
                                    )}
                                  </div>

                                  {!currentItem.narasiFile &&
                                    !currentItem.suratFile &&
                                    !currentItem.audioDubbingFile &&
                                    !currentItem.audioBacksoundFile &&
                                    !currentItem.pendukungVideoFile &&
                                    !currentItem.pendukungFotoFile && (
                                      <div className="text-center py-8">
                                        <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                          <FileText className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <p className="text-gray-600 text-sm">Tidak ada file sumber</p>
                                      </div>
                                    )}
                                </CardContent>
                              </Card>
                            </TabsContent>

                            <TabsContent value="media" className="space-y-6 m-0">
                              <div className="grid grid-cols-2 gap-6">
                                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 shadow-lg">
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center space-x-2">
                                      <Building className="h-4 w-4 text-blue-600" />
                                      <span>Media Pemerintah</span>
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-2">
                                      {currentItem.mediaPemerintah?.length > 0 ? (
                                        currentItem.mediaPemerintah.map((media, index) => (
                                          <div
                                            key={index}
                                            className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg border border-blue-200"
                                          >
                                            {getMediaIcon(media)}
                                            <span className="capitalize font-medium text-blue-800 text-sm">
                                              {media}
                                            </span>
                                          </div>
                                        ))
                                      ) : (
                                        <p className="text-gray-500 italic text-sm">Tidak ada media pemerintah</p>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center space-x-2">
                                      <Globe className="h-4 w-4 text-green-600" />
                                      <span>Media Massa</span>
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-2">
                                      {currentItem.mediaMassa?.length > 0 ? (
                                        currentItem.mediaMassa.map((media, index) => (
                                          <div
                                            key={index}
                                            className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg border border-green-200"
                                          >
                                            {getMediaIcon(media)}
                                            <span className="capitalize font-medium text-green-800 text-sm">
                                              {media}
                                            </span>
                                          </div>
                                        ))
                                      ) : (
                                        <p className="text-gray-500 italic text-sm">Tidak ada media massa</p>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            </TabsContent>

                            <TabsContent value="validation" className="space-y-6 m-0">
                              <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 shadow-lg">
                                <CardHeader>
                                  <CardTitle className="flex items-center space-x-2 text-lg">
                                    <Shield className="h-5 w-5 text-yellow-600" />
                                    <span>Form Validasi Konten</span>
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                  {/* Validation Decision Buttons */}
                                  <div className="space-y-4">
                                    <Label className="text-base font-bold text-gray-900">Keputusan Validasi</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Button
                                          type="button"
                                          variant={validationDecisions[currentItem.id] === true ? "default" : "outline"}
                                          onClick={() => handleValidationDecisionChange(currentItem.id, true)}
                                          className={cn(
                                            "w-full h-20 flex flex-col items-center justify-center space-y-2 relative overflow-hidden",
                                            validationDecisions[currentItem.id] === true
                                              ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
                                              : "border-2 border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300",
                                          )}
                                        >
                                          <CheckCircle className="h-8 w-8" />
                                          <span className="font-bold">TAYANG</span>
                                          {validationDecisions[currentItem.id] === true && (
                                            <motion.div
                                              initial={{ scale: 0 }}
                                              animate={{ scale: 1 }}
                                              className="absolute top-2 right-2"
                                            >
                                              <Check className="h-5 w-5 text-white" />
                                            </motion.div>
                                          )}
                                        </Button>
                                      </motion.div>

                                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Button
                                          type="button"
                                          variant={
                                            validationDecisions[currentItem.id] === false ? "default" : "outline"
                                          }
                                          onClick={() => handleValidationDecisionChange(currentItem.id, false)}
                                          className={cn(
                                            "w-full h-20 flex flex-col items-center justify-center space-y-2 relative overflow-hidden",
                                            validationDecisions[currentItem.id] === false
                                              ? "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-lg"
                                              : "border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300",
                                          )}
                                        >
                                          <XCircle className="h-8 w-8" />
                                          <span className="font-bold">TIDAK TAYANG</span>
                                          {validationDecisions[currentItem.id] === false && (
                                            <motion.div
                                              initial={{ scale: 0 }}
                                              animate={{ scale: 1 }}
                                              className="absolute top-2 right-2"
                                            >
                                              <XCircle className="h-5 w-5 text-white" />
                                            </motion.div>
                                          )}
                                        </Button>
                                      </motion.div>
                                    </div>
                                  </div>

                                  {/* Rejection Reason */}
                                  <AnimatePresence>
                                    {validationDecisions[currentItem.id] === false && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0, y: -20 }}
                                        animate={{ opacity: 1, height: "auto", y: 0 }}
                                        exit={{ opacity: 0, height: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-3 p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border border-red-200"
                                      >
                                        <Label className="text-base font-bold text-red-700 flex items-center space-x-2">
                                          <XCircle className="h-4 w-4" />
                                          <span>Alasan Tidak Tayang *</span>
                                        </Label>
                                        <Textarea
                                          placeholder="Jelaskan alasan mengapa konten ini tidak tayang..."
                                          value={rejectionReasons[currentItem.id] || ""}
                                          onChange={(e) => handleRejectionReasonChange(currentItem.id, e.target.value)}
                                          className="min-h-[100px] border-2 border-red-200 focus:border-red-400 focus:ring-red-200 bg-white"
                                        />
                                        {validationDecisions[currentItem.id] === false &&
                                          !rejectionReasons[currentItem.id]?.trim() && (
                                            <motion.p
                                              initial={{ opacity: 0 }}
                                              animate={{ opacity: 1 }}
                                              className="text-red-600 text-sm font-medium flex items-center space-x-1"
                                            >
                                              <AlertTriangle className="h-4 w-4" />
                                              <span>Alasan penolakan wajib diisi</span>
                                            </motion.p>
                                          )}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>

                                  {/* Validation Notes */}
                                  <div className="space-y-3">
                                    <Label className="text-base font-bold text-gray-700 flex items-center space-x-2">
                                      <MessageSquare className="h-4 w-4" />
                                      <span>Catatan Validasi</span>
                                    </Label>
                                    <Textarea
                                      placeholder="Tambahkan catatan atau komentar terkait validasi konten ini..."
                                      value={validationNotes[currentItem.id] || ""}
                                      onChange={(e) => handleValidationNoteChange(currentItem.id, e.target.value)}
                                      className="min-h-[100px] border-2 border-gray-200 focus:border-yellow-400 focus:ring-yellow-200 bg-white"
                                    />
                                  </div>
                                </CardContent>
                              </Card>
                            </TabsContent>
                          </div>
                        </ScrollArea>
                      </div>
                    </Tabs>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation buttons */}
                <div className="flex justify-between mt-4">
                  <Button
                    variant="outline"
                    onClick={goToPreviousItem}
                    disabled={currentStep === 0}
                    className="bg-transparent"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Sebelumnya
                  </Button>

                  {currentStep < contentItems.length - 1 ? (
                    <Button
                      onClick={goToNextItem}
                      className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white"
                    >
                      Selanjutnya
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleValidationSubmit}
                      disabled={!canSubmit || isSubmitting}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                    >
                      {isSubmitting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                            className="mr-2"
                          >
                            <Activity className="h-4 w-4" />
                          </motion.div>
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Konfirmasi Validasi
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

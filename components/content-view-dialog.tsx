"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
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
  User,
  Users,
  Activity,
  Sparkles,
  Building,
  Globe,
  Hash,
  Video,
  Mic,
  ImageIcon,
  FileIcon,
  Play,
  Eye,
  Shield,
  Clock,
  ExternalLink,
  AudioWaveform,
  Layers,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import PreviewModal from "./preview-modal"

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

interface ContentViewDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  submission: Submission | null
  contentItem?: ContentItem | null
  onToast: (message: string, type: "success" | "error" | "info") => void
  readOnly?: boolean
}

// Helper functions
const getContentTypeIcon = (type: string) => {
  switch (type) {
    case "video":
      return <Video className="h-4 w-4 text-red-500" />
    case "audio":
      return <Mic className="h-4 w-4 text-purple-500" />
    case "fotografis":
      return <ImageIcon className="h-4 w-4 text-blue-500" />
    case "infografis":
      return <FileIcon className="h-4 w-4 text-green-500" />
    case "naskah-berita":
      return <FileText className="h-4 w-4 text-orange-500" />
    case "bumper":
      return <Play className="h-4 w-4 text-indigo-500" />
    default:
      return <FileText className="h-4 w-4 text-gray-500" />
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

// Helper function to get file icon based on type
const getFileIcon = (file: any, sourceType?: string) => {
  if (isFileLink(file)) return <ExternalLink className="h-4 w-4 text-blue-500" />

  if (sourceType) {
    switch (sourceType) {
      case "video":
        return <Video className="h-4 w-4 text-red-500" />
      case "foto":
        return <ImageIcon className="h-4 w-4 text-green-500" />
      case "file-audio":
        return <AudioWaveform className="h-4 w-4 text-purple-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  if (file?.type) {
    if (file.type.startsWith("image/")) return <ImageIcon className="h-4 w-4 text-green-500" />
    if (file.type.startsWith("video/")) return <Video className="h-4 w-4 text-red-500" />
    if (file.type.startsWith("audio/")) return <AudioWaveform className="h-4 w-4 text-purple-500" />
  }

  return <FileText className="h-4 w-4 text-gray-500" />
}

// Enhanced helper function to get preview URL from file with better error handling
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
      if (file.url) return file.url
      if (file.base64) {
        const mimeType = file.type || "application/octet-stream"
        return file.base64.startsWith("data:") ? file.base64 : `data:${mimeType};base64,${file.base64}`
      }
      if (file.preview) return file.preview
    }

    return null
  } catch (error) {
    console.error("Error getting preview URL:", error)
    return null
  }
}

// Enhanced helper function to get file type for preview
const getFileType = (file: any): string => {
  if (!file) return "application/octet-stream"

  // Handle File/Blob objects
  if ((file instanceof File || file instanceof Blob) && file.type) {
    return file.type
  }

  // Handle file objects with type property
  if (typeof file === "object" && file.type) {
    return file.type
  }

  // Handle string URLs - determine type from extension
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

export function ContentViewDialog({
  isOpen,
  onOpenChange,
  submission,
  contentItem,
  onToast,
  readOnly = true,
}: ContentViewDialogProps) {
  const [selectedContentIndex, setSelectedContentIndex] = useState(0)

  // Preview modal state - updated to use the new PreviewModal props
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
      setSelectedContentIndex(0)
      setPreviewModal({ isOpen: false, file: null, url: "", type: "", fileName: "", title: "" })
    }
  }, [isOpen])

  if (!submission) return null

  const contentItems = submission.contentItems || []
  const currentItem = contentItem || contentItems[selectedContentIndex]

  if (!currentItem && contentItems.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-gradient-to-br from-orange-50 via-white to-yellow-50 border-0 shadow-2xl">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-12"
          >
            <div className="mx-auto mb-6 p-4 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full shadow-lg">
              <AlertTriangle className="h-12 w-12 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-900 mb-4">Tidak Ada Konten</DialogTitle>
            <p className="text-gray-600 mb-6">Belum ada konten yang tersedia untuk dokumen ini.</p>
            <Button onClick={() => onOpenChange(false)} className="bg-gradient-to-r from-blue-600 to-indigo-600">
              Tutup
            </Button>
          </motion.div>
        </DialogContent>
      </Dialog>
    )
  }

  const reviewItem = contentItems[selectedContentIndex] || contentItems[0]

  // Enhanced handle preview file function with better error handling
  const handlePreviewFile = (file: any, title: string) => {
    try {
      const url = getPreviewUrl(file)
      const fileType = getFileType(file)
      const fileName = getFileDisplayName(file)

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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-7xl h-[95vh] bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-0 shadow-2xl flex flex-col overflow-hidden">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="h-full flex flex-col"
          >
            {/* Fixed Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <DialogHeader className="border-b border-gray-200 pb-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
                      className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg"
                    >
                      <Eye className="h-6 w-6 text-white" />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.3 }}
                    >
                      <DialogTitle className="text-2xl font-bold text-gray-900">
                        Detail Konten - {submission.noComtab}
                      </DialogTitle>
                      <DialogDescription className="text-gray-600 mt-1">
                        Melihat detail konten yang diajukan ({selectedContentIndex + 1} dari {contentItems.length})
                      </DialogDescription>
                    </motion.div>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="flex items-center space-x-3"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, duration: 0.3, type: "spring", stiffness: 200 }}
                    >
                      {reviewItem.status === "approved" && (
                        <Badge
                          variant="outline"
                          className="px-3 py-1 font-medium bg-green-100 text-green-800 border-green-300"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Disetujui
                        </Badge>
                      )}
                      {reviewItem.status === "rejected" && (
                        <Badge
                          variant="outline"
                          className="px-3 py-1 font-medium bg-red-100 text-red-800 border-red-300"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Ditolak
                        </Badge>
                      )}
                      {reviewItem.status === "pending" && (
                        <Badge
                          variant="outline"
                          className="px-3 py-1 font-medium bg-yellow-100 text-yellow-800 border-yellow-300"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          Menunggu Review
                        </Badge>
                      )}
                    </motion.div>
                  </motion.div>
                </div>
              </DialogHeader>
            </motion.div>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="space-y-6 py-6 pr-4"
              >
                {/* Content Navigation */}
                {contentItems.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <Activity className="h-5 w-5 text-purple-600 mr-2" />
                          <span>Navigasi Konten</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {contentItems.map((item, index) => (
                            <motion.button
                              key={item.id}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setSelectedContentIndex(index)}
                              className={cn(
                                "p-4 rounded-xl border-2 text-left transition-all duration-300 shadow-lg",
                                selectedContentIndex === index
                                  ? "border-purple-500 bg-purple-100 shadow-xl"
                                  : "border-gray-200 bg-white hover:border-purple-300 hover:shadow-xl",
                              )}
                            >
                              <div className="flex items-center space-x-3">
                                {getContentTypeIcon(item.jenisKonten)}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold truncate text-gray-900">
                                    {item.nama || item.jenisKonten}
                                  </p>
                                  <p className="text-xs text-gray-500 capitalize">
                                    {item.jenisKonten.replace("-", " ")}
                                  </p>
                                </div>
                                {item.status === "approved" && <CheckCircle className="h-4 w-4 text-green-500" />}
                                {item.status === "rejected" && <XCircle className="h-4 w-4 text-red-500" />}
                                {item.status === "pending" && <Clock className="h-4 w-4 text-yellow-500" />}
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Submission Overview */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Building className="h-5 w-5 text-blue-600" />
                        <span>Informasi Dokumen</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                          { icon: User, label: "Petugas", value: submission.petugasPelaksana, color: "blue" },
                          { icon: Users, label: "Supervisor", value: submission.supervisor, color: "green" },
                          {
                            icon: Clock,
                            label: "Target Selesai",
                            value: formatDate(reviewItem?.tanggalJadi),
                            color: "orange",
                          },
                        ].map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                          >
                            <div className={`p-2 bg-${item.color}-100 rounded-lg`}>
                              <item.icon className={`h-5 w-5 text-${item.color}-600`} />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium">{item.label}</p>
                              <p className="font-semibold text-gray-900">{item.value}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 0.3 }}
                        className="mt-4 p-4 bg-white rounded-lg shadow-md"
                      >
                        <h4 className="font-semibold mb-2 flex items-center space-x-2">
                          <Sparkles className="h-4 w-4 text-indigo-500" />
                          <span>Judul Dokumen</span>
                        </h4>
                        <p className="text-gray-700">{submission.judul}</p>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Content Details */}
                {reviewItem && (
                  <motion.div
                    key={reviewItem.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                  >
                    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          {getContentTypeIcon(reviewItem.jenisKonten)}
                          <span>Detail Konten: {reviewItem.nama || reviewItem.jenisKonten}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Tabs defaultValue="basic" className="space-y-6">
                          <TabsList className="grid w-full grid-cols-4 bg-white shadow-lg">
                            <TabsTrigger
                              value="basic"
                              className="data-[state=active]:bg-green-100 transition-all duration-200"
                            >
                              Informasi Dasar
                            </TabsTrigger>
                            <TabsTrigger
                              value="media"
                              className="data-[state=active]:bg-blue-100 transition-all duration-200"
                            >
                              Target Media
                            </TabsTrigger>
                            <TabsTrigger
                              value="files"
                              className="data-[state=active]:bg-orange-100 transition-all duration-200"
                            >
                              File & Sumber
                            </TabsTrigger>
                            <TabsTrigger
                              value="status"
                              className="data-[state=active]:bg-purple-100 transition-all duration-200"
                            >
                              Status Konten
                            </TabsTrigger>
                          </TabsList>

                          <AnimatePresence mode="wait">
                            <TabsContent value="basic" className="space-y-4">
                              <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                              >
                                {[
                                  {
                                    icon: FileText,
                                    label: "Nama Konten",
                                    value: reviewItem.nama || "Tidak ada nama",
                                    color: "green",
                                  },
                                  {
                                    icon: Activity,
                                    label: "Jenis Konten",
                                    value: reviewItem.jenisKonten.replace("-", " "),
                                    color: "blue",
                                  },
                                  {
                                    icon: FileText,
                                    label: "Nomor Surat",
                                    value: reviewItem.nomorSurat || "Tidak ada nomor surat",
                                    color: "purple",
                                  },
                                  {
                                    icon: Clock,
                                    label: "Status",
                                    value:
                                      reviewItem.status === "approved"
                                        ? "Disetujui"
                                        : reviewItem.status === "rejected"
                                          ? "Ditolak"
                                          : "Menunggu Review",
                                    color:
                                      reviewItem.status === "approved"
                                        ? "green"
                                        : reviewItem.status === "rejected"
                                          ? "red"
                                          : "yellow",
                                  },
                                ].map((item, index) => (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.3 }}
                                    className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                                  >
                                    <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                                      <item.icon className={`h-4 w-4 text-${item.color}-500`} />
                                      <span>{item.label}</span>
                                    </label>
                                    {item.label === "Status" ? (
                                      <div className="mt-2">
                                        <Badge
                                          variant="outline"
                                          className={cn(
                                            "px-3 py-1",
                                            reviewItem.status === "approved" &&
                                              "bg-green-100 text-green-800 border-green-300",
                                            reviewItem.status === "rejected" &&
                                              "bg-red-100 text-red-800 border-red-300",
                                            reviewItem.status === "pending" &&
                                              "bg-yellow-100 text-yellow-800 border-yellow-300",
                                          )}
                                        >
                                          {reviewItem.status === "approved" && <CheckCircle className="h-3 w-3 mr-1" />}
                                          {reviewItem.status === "rejected" && <XCircle className="h-3 w-3 mr-1" />}
                                          {reviewItem.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                                          {item.value}
                                        </Badge>
                                      </div>
                                    ) : item.label === "Jenis Konten" ? (
                                      <div className="mt-2 p-3 bg-gray-50 rounded-lg border flex items-center space-x-2">
                                        {getContentTypeIcon(reviewItem.jenisKonten)}
                                        <span className="capitalize font-medium">{item.value}</span>
                                      </div>
                                    ) : (
                                      <p className="mt-2 p-3 bg-gray-50 rounded-lg border">{item.value}</p>
                                    )}
                                  </motion.div>
                                ))}
                              </motion.div>
                              {reviewItem.narasiText && (
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.4, duration: 0.3 }}
                                  className="p-4 bg-white rounded-lg shadow-md"
                                >
                                  <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                                    <FileText className="h-4 w-4 text-indigo-500" />
                                    <span>Narasi Konten</span>
                                  </label>
                                  <div className="mt-2 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                                    <p className="text-gray-800 leading-relaxed">{reviewItem.narasiText}</p>
                                  </div>
                                </motion.div>
                              )}
                              {reviewItem.keterangan && (
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.5, duration: 0.3 }}
                                  className="p-4 bg-white rounded-lg shadow-md"
                                >
                                  <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                                    <span>Keterangan Tambahan</span>
                                  </label>
                                  <div className="mt-2 p-4 bg-orange-50 rounded-lg border border-orange-200">
                                    <p className="text-gray-800 leading-relaxed">{reviewItem.keterangan}</p>
                                  </div>
                                </motion.div>
                              )}
                            </TabsContent>

                            <TabsContent value="media" className="space-y-4">
                              <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                              >
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.1, duration: 0.3 }}
                                  className="p-4 bg-white rounded-lg shadow-md"
                                >
                                  <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2 mb-3">
                                    <Building className="h-4 w-4 text-blue-500" />
                                    <span>Media Pemerintah</span>
                                  </label>
                                  <div className="space-y-2">
                                    {reviewItem.mediaPemerintah?.length > 0 ? (
                                      reviewItem.mediaPemerintah.map((media, index) => (
                                        <motion.div
                                          key={index}
                                          initial={{ opacity: 0, x: -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: 0.2 + index * 0.1, duration: 0.2 }}
                                          className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg border border-blue-200"
                                        >
                                          {getMediaIcon(media)}
                                          <span className="capitalize font-medium text-blue-800">{media}</span>
                                        </motion.div>
                                      ))
                                    ) : (
                                      <p className="text-gray-500 italic">Tidak ada media pemerintah</p>
                                    )}
                                  </div>
                                </motion.div>

                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.2, duration: 0.3 }}
                                  className="p-4 bg-white rounded-lg shadow-md"
                                >
                                  <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2 mb-3">
                                    <Globe className="h-4 w-4 text-green-500" />
                                    <span>Media Massa</span>
                                  </label>
                                  <div className="space-y-2">
                                    {reviewItem.mediaMassa?.length > 0 ? (
                                      reviewItem.mediaMassa.map((media, index) => (
                                        <motion.div
                                          key={index}
                                          initial={{ opacity: 0, x: -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: 0.3 + index * 0.1, duration: 0.2 }}
                                          className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg border border-green-200"
                                        >
                                          {getMediaIcon(media)}
                                          <span className="capitalize font-medium text-green-800">{media}</span>
                                        </motion.div>
                                      ))
                                    ) : (
                                      <p className="text-gray-500 italic">Tidak ada media massa</p>
                                    )}
                                  </div>
                                </motion.div>
                              </motion.div>
                            </TabsContent>

                            <TabsContent value="files" className="space-y-6">
                              <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                              >
                                {/* Narasi Section */}
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.1, duration: 0.3 }}
                                  className="p-6 bg-gradient-to-r from-blue-50/30 to-cyan-50/30 rounded-xl border border-blue-100/50"
                                >
                                  <h5 className="font-semibold text-gray-800 flex items-center mb-4">
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center mr-3">
                                      <FileText className="h-4 w-4 text-white" />
                                    </div>
                                    Narasi & Konten Teks
                                  </h5>

                                  {reviewItem.narasiSourceType && reviewItem.narasiSourceType.length > 0 && (
                                    <div className="space-y-3 mb-4">
                                      <p className="text-sm font-medium text-gray-700">Sumber yang dipilih:</p>
                                      <div className="flex flex-wrap gap-2">
                                        {reviewItem.narasiSourceType.map((type, index) => (
                                          <Badge
                                            key={index}
                                            variant="outline"
                                            className="bg-blue-100 text-blue-800 border-blue-300"
                                          >
                                            {type === "text"
                                              ? "Teks Manual"
                                              : type === "file"
                                                ? "File Narasi"
                                                : "File Surat"}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {reviewItem.narasiFile && (
                                      <motion.div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                        <Button
                                          variant="ghost"
                                          className="flex items-center space-x-2 w-full justify-start"
                                          onClick={() => handlePreviewFile(reviewItem.narasiFile, "File Narasi")}
                                        >
                                          {getFileIcon(reviewItem.narasiFile)}
                                          <span className="text-sm font-medium text-gray-700">File Narasi</span>
                                        </Button>
                                        <p className="text-sm text-gray-600 truncate mb-3">
                                          {getFileDisplayName(reviewItem.narasiFile)}
                                        </p>
                                      </motion.div>
                                    )}

                                    {reviewItem.suratFile && (
                                      <motion.div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                        <Button
                                          variant="ghost"
                                          className="flex items-center space-x-2 w-full justify-start"
                                          onClick={() => handlePreviewFile(reviewItem.suratFile, "File Surat")}
                                        >
                                          {getFileIcon(reviewItem.suratFile)}
                                          <span className="text-sm font-medium text-gray-700">File Surat</span>
                                        </Button>
                                        <p className="text-sm text-gray-600 truncate mb-3">
                                          {getFileDisplayName(reviewItem.suratFile)}
                                        </p>
                                      </motion.div>
                                    )}
                                  </div>
                                </motion.div>

                                {/* Audio Dubbing Section */}
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.2, duration: 0.3 }}
                                  className="p-6 bg-gradient-to-r from-purple-50/30 to-pink-50/30 rounded-xl border border-purple-100/50"
                                >
                                  <h5 className="font-semibold text-gray-800 flex items-center mb-4">
                                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center mr-3">
                                      <Mic className="h-4 w-4 text-white" />
                                    </div>
                                    Audio Dubbing
                                  </h5>

                                  {reviewItem.audioDubbingSourceType &&
                                    reviewItem.audioDubbingSourceType.length > 0 && (
                                      <div className="space-y-3 mb-4">
                                        <p className="text-sm font-medium text-gray-700">Sumber yang dipilih:</p>
                                        <div className="flex flex-wrap gap-2">
                                          {reviewItem.audioDubbingSourceType.map((type, index) => (
                                            <Badge
                                              key={index}
                                              variant="outline"
                                              className="bg-purple-100 text-purple-800 border-purple-300"
                                            >
                                              {type === "file-audio" ? "File Audio" : "Lain-lain"}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {reviewItem.audioDubbingFile && (
                                      <motion.div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                        <Button
                                          variant="ghost"
                                          className="flex items-center space-x-2 w-full justify-start"
                                          onClick={() =>
                                            handlePreviewFile(reviewItem.audioDubbingFile, "File Audio Dubbing")
                                          }
                                        >
                                          {getFileIcon(reviewItem.audioDubbingFile, "file-audio")}
                                          <span className="text-sm font-medium text-gray-700">File Audio Dubbing</span>
                                        </Button>
                                        <p className="text-sm text-gray-600 truncate mb-3">
                                          {getFileDisplayName(reviewItem.audioDubbingFile)}
                                        </p>
                                      </motion.div>
                                    )}

                                    {reviewItem.audioDubbingLainLainFile && (
                                      <motion.div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                        <Button
                                          variant="ghost"
                                          className="flex items-center space-x-2 w-full justify-start"
                                          onClick={() =>
                                            handlePreviewFile(
                                              reviewItem.audioDubbingLainLainFile,
                                              "File Audio Dubbing Lain-lain",
                                            )
                                          }
                                        >
                                          {getFileIcon(reviewItem.audioDubbingLainLainFile)}
                                          <span className="text-sm font-medium text-gray-700">
                                            File Audio Dubbing Lain-lain
                                          </span>
                                        </Button>
                                        <p className="text-sm text-gray-600 truncate mb-3">
                                          {getFileDisplayName(reviewItem.audioDubbingLainLainFile)}
                                        </p>
                                      </motion.div>
                                    )}
                                  </div>
                                </motion.div>

                                {/* Audio Backsound Section */}
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.3, duration: 0.3 }}
                                  className="p-6 bg-gradient-to-r from-green-50/30 to-emerald-50/30 rounded-xl border border-green-100/50"
                                >
                                  <h5 className="font-semibold text-gray-800 flex items-center mb-4">
                                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg flex items-center justify-center mr-3">
                                      <AudioWaveform className="h-4 w-4 text-white" />
                                    </div>
                                    Audio Backsound
                                  </h5>

                                  {reviewItem.audioBacksoundSourceType &&
                                    reviewItem.audioBacksoundSourceType.length > 0 && (
                                      <div className="space-y-3 mb-4">
                                        <p className="text-sm font-medium text-gray-700">Sumber yang dipilih:</p>
                                        <div className="flex flex-wrap gap-2">
                                          {reviewItem.audioBacksoundSourceType.map((type, index) => (
                                            <Badge
                                              key={index}
                                              variant="outline"
                                              className="bg-green-100 text-green-800 border-green-300"
                                            >
                                              {type === "file-audio" ? "File Audio" : "Lain-lain"}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {reviewItem.audioBacksoundFile && (
                                      <motion.div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                        <Button
                                          variant="ghost"
                                          className="flex items-center space-x-2 w-full justify-start"
                                          onClick={() =>
                                            handlePreviewFile(reviewItem.audioBacksoundFile, "File Audio Backsound")
                                          }
                                        >
                                          {getFileIcon(reviewItem.audioBacksoundFile, "file-audio")}
                                          <span className="text-sm font-medium text-gray-700">
                                            File Audio Backsound
                                          </span>
                                        </Button>
                                        <p className="text-sm text-gray-600 truncate mb-3">
                                          {getFileDisplayName(reviewItem.audioBacksoundFile)}
                                        </p>
                                      </motion.div>
                                    )}

                                    {reviewItem.audioBacksoundLainLainFile && (
                                      <motion.div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                        <Button
                                          variant="ghost"
                                          className="flex items-center space-x-2 w-full justify-start"
                                          onClick={() =>
                                            handlePreviewFile(
                                              reviewItem.audioBacksoundLainLainFile,
                                              "File Audio Backsound Lain-lain",
                                            )
                                          }
                                        >
                                          {getFileIcon(reviewItem.audioBacksoundLainLainFile)}
                                          <span className="text-sm font-medium text-gray-700">
                                            File Audio Backsound Lain-lain
                                          </span>
                                        </Button>
                                        <p className="text-sm text-gray-600 truncate mb-3">
                                          {getFileDisplayName(reviewItem.audioBacksoundLainLainFile)}
                                        </p>
                                      </motion.div>
                                    )}
                                  </div>
                                </motion.div>

                                {/* Pendukung Lainnya Section */}
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.4, duration: 0.3 }}
                                  className="p-6 bg-gradient-to-r from-orange-50/30 to-yellow-50/30 rounded-xl border border-orange-100/50"
                                >
                                  <h5 className="font-semibold text-gray-800 flex items-center mb-4">
                                    <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-lg flex items-center justify-center mr-3">
                                      <Layers className="h-4 w-4 text-white" />
                                    </div>
                                    File Pendukung Lainnya
                                  </h5>

                                  {reviewItem.pendukungLainnyaSourceType &&
                                    reviewItem.pendukungLainnyaSourceType.length > 0 && (
                                      <div className="space-y-3 mb-4">
                                        <p className="text-sm font-medium text-gray-700">Sumber yang dipilih:</p>
                                        <div className="flex flex-wrap gap-2">
                                          {reviewItem.pendukungLainnyaSourceType.map((type, index) => (
                                            <Badge
                                              key={index}
                                              variant="outline"
                                              className="bg-orange-100 text-orange-800 border-orange-300"
                                            >
                                              {type === "video" ? "Video" : type === "foto" ? "Foto" : "Lain-lain"}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {reviewItem.pendukungVideoFile && (
                                      <motion.div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                        <Button
                                          variant="ghost"
                                          className="flex items-center space-x-2 w-full justify-start"
                                          onClick={() =>
                                            handlePreviewFile(reviewItem.pendukungVideoFile, "File Pendukung Video")
                                          }
                                        >
                                          {getFileIcon(reviewItem.pendukungVideoFile, "video")}
                                          <span className="text-sm font-medium text-gray-700">
                                            File Pendukung Video
                                          </span>
                                        </Button>
                                        <p className="text-sm text-gray-600 truncate mb-3">
                                          {getFileDisplayName(reviewItem.pendukungVideoFile)}
                                        </p>
                                      </motion.div>
                                    )}

                                    {reviewItem.pendukungFotoFile && (
                                      <motion.div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                        <Button
                                          variant="ghost"
                                          className="flex items-center space-x-2 w-full justify-start"
                                          onClick={() =>
                                            handlePreviewFile(reviewItem.pendukungFotoFile, "File Pendukung Foto")
                                          }
                                        >
                                          {getFileIcon(reviewItem.pendukungFotoFile, "foto")}
                                          <span className="text-sm font-medium text-gray-700">File Pendukung Foto</span>
                                        </Button>
                                        <p className="text-sm text-gray-600 truncate mb-3">
                                          {getFileDisplayName(reviewItem.pendukungFotoFile)}
                                        </p>
                                      </motion.div>
                                    )}

                                    {reviewItem.pendukungLainLainFile && (
                                      <motion.div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                        <Button
                                          variant="ghost"
                                          className="flex items-center space-x-2 w-full justify-start"
                                          onClick={() =>
                                            handlePreviewFile(
                                              reviewItem.pendukungLainLainFile,
                                              "File Pendukung Lain-lain",
                                            )
                                          }
                                        >
                                          {getFileIcon(reviewItem.pendukungLainLainFile)}
                                          <span className="text-sm font-medium text-gray-700">
                                            File Pendukung Lain-lain
                                          </span>
                                        </Button>
                                        <p className="text-sm text-gray-600 truncate mb-3">
                                          {getFileDisplayName(reviewItem.pendukungLainLainFile)}
                                        </p>
                                      </motion.div>
                                    )}
                                  </div>
                                </motion.div>
                              </motion.div>
                            </TabsContent>

                            <TabsContent value="status" className="space-y-6">
                              <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                              >
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.1, duration: 0.3 }}
                                  className="p-6 bg-white rounded-xl border border-gray-200 shadow-md"
                                >
                                  <h5 className="font-semibold text-gray-800 flex items-center mb-4">
                                    <Shield className="h-5 w-5 text-purple-600 mr-2" />
                                    Status Review
                                  </h5>

                                  <div className="space-y-4">
                                    <div className="flex items-center justify-center">
                                      {reviewItem.status === "approved" && (
                                        <Badge
                                          variant="outline"
                                          className="px-6 py-3 text-lg font-medium bg-green-100 text-green-800 border-green-300"
                                        >
                                          <CheckCircle className="h-5 w-5 mr-2" />
                                          Konten Disetujui
                                        </Badge>
                                      )}
                                      {reviewItem.status === "rejected" && (
                                        <Badge
                                          variant="outline"
                                          className="px-6 py-3 text-lg font-medium bg-red-100 text-red-800 border-red-300"
                                        >
                                          <XCircle className="h-5 w-5 mr-2" />
                                          Konten Ditolak
                                        </Badge>
                                      )}
                                      {reviewItem.status === "pending" && (
                                        <Badge
                                          variant="outline"
                                          className="px-6 py-3 text-lg font-medium bg-yellow-100 text-yellow-800 border-yellow-300"
                                        >
                                          <Clock className="h-5 w-5 mr-2" />
                                          Menunggu Review
                                        </Badge>
                                      )}
                                    </div>

                                    {reviewItem.status === "rejected" && reviewItem.alasanPenolakan && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        transition={{ duration: 0.3 }}
                                        className="p-4 bg-red-50 rounded-lg border border-red-200"
                                      >
                                        <h6 className="font-medium text-red-800 mb-2">Alasan Penolakan:</h6>
                                        <p className="text-red-700">{reviewItem.alasanPenolakan}</p>
                                      </motion.div>
                                    )}

                                    {(reviewItem.tanggalDiproses || reviewItem.diprosesoleh) && (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {reviewItem.tanggalDiproses && (
                                          <div className="p-3 bg-gray-50 rounded-lg">
                                            <p className="text-sm font-medium text-gray-700">Tanggal Diproses</p>
                                            <p className="text-gray-900">{reviewItem.tanggalDiproses}</p>
                                          </div>
                                        )}
                                        {reviewItem.diprosesoleh && (
                                          <div className="p-3 bg-gray-50 rounded-lg">
                                            <p className="text-sm font-medium text-gray-700">Diproses Oleh</p>
                                            <p className="text-gray-900">{reviewItem.diprosesoleh}</p>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              </motion.div>
                            </TabsContent>
                          </AnimatePresence>
                        </Tabs>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            </ScrollArea>

            {/* Fixed Footer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
              <DialogFooter className="border-t border-gray-200 pt-4 mt-4 flex-shrink-0">
                <div className="flex w-full justify-end">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Tutup
                  </Button>
                </div>
              </DialogFooter>
            </motion.div>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={previewModal.isOpen}
        onOpenChange={(open) => setPreviewModal({ ...previewModal, isOpen: open })}
        file={previewModal.file}
        url={previewModal.url}
        type={previewModal.type}
        fileName={previewModal.fileName}
        title={previewModal.title}
      />
    </>
  )
}

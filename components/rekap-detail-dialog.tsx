"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Activity,
  LinkIcon,
  ImageIcon,
  Video,
  Music,
  FileIcon,
  Sparkles,
  Eye,
  Shield,
  Layers,
  User,
  Trash2,
  Ban,
  Edit,
  PlayCircle,
} from "lucide-react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import type { Submission } from "@/lib/utils"
import { saveSubmissionsToStorage, loadSubmissionsFromStorage } from "@/lib/utils"

interface FileData {
  name: string
  size: number
  type: string
  lastModified: number
  base64?: string
  url?: string
}

interface ContentItem {
  id: string
  nama: string
  jenisKonten: string
  tema?: string
  mediaPemerintah: string[]
  mediaMassa: string[]
  nomorSurat: string
  narasiText: string
  tanggalOrderMasuk: Date | string | undefined
  tanggalJadi: Date | string | undefined
  tanggalTayang: Date | string | undefined
  keterangan: string
  status?: "pending" | "approved" | "rejected"
  alasanPenolakan?: string
  tanggalDiproses?: Date | string | undefined
  diprosesoleh?: string
  hasilProdukFile?: FileData | string
  hasilProdukLink?: string
  isTayang?: boolean
  tanggalValidasiTayang?: Date | string | undefined
  validatorTayang?: string
  keteranganValidasi?: string
  isConfirmed?: boolean
  tanggalKonfirmasi?: Date | string | undefined
  // Takedown fields
  isTakedown?: boolean
  tanggalTakedown?: Date | string | undefined
  alasanTakedown?: string
  takedownBy?: string
  // Source files
  narasiFile?: FileData | string
  suratFile?: FileData | string
  audioDubbingFile?: FileData | string
  audioDubbingLainLainFile?: FileData | string
  audioBacksoundFile?: FileData | string
  audioBacksoundLainLainFile?: FileData | string
  pendukungVideoFile?: FileData | string
  pendukungFotoFile?: FileData | string
  pendukungLainLainFile?: FileData | string
  // Validation output fields - these are the ones from validation process
  hasilProdukValidasiFile?: FileData | string
  hasilProdukValidasiLink?: string
  tanggalTayangValidasi?: Date | string | undefined
  alasanTidakTayang?: string
}

interface RekapDetailDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  submission: Submission | null
  onUpdate?: () => void
  onToast?: (message: string, type: "success" | "error" | "info") => void
}

export function RekapDetailDialog({ isOpen, onOpenChange, submission, onUpdate }: RekapDetailDialogProps) {
  const [isTakedownDialogOpen, setIsTakedownDialogOpen] = useState(false)
  const [takedownReason, setTakedownReason] = useState("")
  const [selectedItemId, setSelectedItemId] = useState<string>("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [expandedContent, setExpandedContent] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState<string | null>(null)
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    file: null as any,
    url: "",
    type: "",
    fileName: "",
    title: "",
  })

  if (!submission) return null

  const handleTakedown = (itemId: string) => {
    setSelectedItemId(itemId)
    setTakedownReason("")
    setIsTakedownDialogOpen(true)
  }

  const confirmTakedown = () => {
    if (!takedownReason.trim()) return

    const submissions = loadSubmissionsFromStorage()
    const updatedSubmissions = submissions.map((sub) => {
      if (sub.id === submission.id) {
        const updatedContentItems = sub.contentItems?.map((item) => {
          if (item.id === selectedItemId) {
            return {
              ...item,
              isTakedown: true,
              alasanTakedown: takedownReason.trim(),
              tanggalTakedown: new Date().toISOString(),
              takedownBy: "Admin", // In real app, get from auth context
            }
          }
          return item
        })
        return { ...sub, contentItems: updatedContentItems }
      }
      return sub
    })

    saveSubmissionsToStorage(updatedSubmissions)
    setIsTakedownDialogOpen(false)
    setTakedownReason("")
    setSelectedItemId("")
    onUpdate?.()
  }

  const handleDelete = () => {
    const submissions = loadSubmissionsFromStorage()
    const updatedSubmissions = submissions.filter((sub) => sub.id !== submission.id)
    saveSubmissionsToStorage(updatedSubmissions)
    onOpenChange(false)
    onUpdate?.()
    // Refresh the page to update the list
    window.location.reload()
  }

  // Get real-time data from submission
  const contentItems = submission.contentItems || []
  const approvedItems = contentItems.filter((item) => item.status === "approved")
  const rejectedItems = contentItems.filter((item) => item.status === "rejected")
  const pendingItems = contentItems.filter((item) => !item.status || item.status === "pending")
  const publishedItems = approvedItems.filter((item) => item.isTayang === true)
  const takedownItems = approvedItems.filter((item) => item.isTakedown === true)
  const unpublishedItems = approvedItems.filter((item) => item.isTayang !== true)
  const confirmedItems = contentItems.filter((item) => item.isConfirmed === true)

  // Enhanced date formatting functions with better error handling
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "Belum diisi"

    try {
      let dateObj: Date

      if (typeof date === "string") {
        // Handle ISO string dates
        if (date.includes("T") || date.includes("Z")) {
          dateObj = new Date(date)
        } else {
          // Handle date strings in various formats
          dateObj = new Date(date)
        }
      } else {
        dateObj = date
      }

      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        return "Belum diisi"
      }

      return dateObj.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    } catch (error) {
      console.error("Error formatting date:", error, "Date value:", date)
      return "Belum diisi"
    }
  }

  const formatDateTime = (date: Date | string | undefined) => {
    if (!date) return "Belum diisi"

    try {
      let dateObj: Date

      if (typeof date === "string") {
        // Handle ISO string dates
        if (date.includes("T") || date.includes("Z")) {
          dateObj = new Date(date)
        } else {
          // Handle date strings in various formats
          dateObj = new Date(date)
        }
      } else {
        dateObj = date
      }

      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        return "Belum diisi"
      }

      return dateObj.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      console.error("Error formatting datetime:", error, "Date value:", date)
      return "Belum diisi"
    }
  }

  const getStatusBadge = (status?: string, isTakedown?: boolean) => {
    if (isTakedown) {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center space-x-1">
          <Ban className="h-3 w-3" />
          <span>Takedown</span>
        </Badge>
      )
    }

    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center space-x-1">
            <CheckCircle className="h-3 w-3" />
            <span>Disetujui</span>
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center space-x-1">
            <XCircle className="h-3 w-3" />
            <span>Ditolak</span>
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>Menunggu Review</span>
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200 px-2 py-1">
            <Clock className="h-3 w-3 mr-1" />
            Belum Diproses
          </Badge>
        )
    }
  }

  const getContentTypeIcon = (jenisKonten: string) => {
    const type = jenisKonten.toLowerCase()
    if (type.includes("video")) return <Video className="h-4 w-4 text-blue-600" />
    if (type.includes("foto") || type.includes("gambar") || type.includes("fotografis"))
      return <ImageIcon className="h-4 w-4 text-green-600" />
    if (type.includes("audio") || type.includes("suara")) return <Music className="h-4 w-4 text-purple-600" />
    if (type.includes("teks") || type.includes("artikel") || type.includes("naskah"))
      return <FileText className="h-4 w-4 text-orange-600" />
    if (type.includes("infografis")) return <FileIcon className="h-4 w-4 text-indigo-600" />
    if (type.includes("bumper")) return <Video className="h-4 w-4 text-red-600" />
    return <FileIcon className="h-4 w-4 text-gray-600" />
  }

  const getMediaIcon = (media: string) => {
    const mediaLower = media.toLowerCase()
    if (mediaLower.includes("tv") || mediaLower.includes("televisi")) return "📺"
    if (mediaLower.includes("radio")) return "📻"
    if (mediaLower.includes("website") || mediaLower.includes("web")) return "🌐"
    if (mediaLower.includes("sosial") || mediaLower.includes("social")) return "📱"
    if (mediaLower.includes("cetak") || mediaLower.includes("koran") || mediaLower.includes("surat kabar")) return "📰"
    if (mediaLower.includes("instagram")) return "📷"
    if (mediaLower.includes("youtube")) return "📹"
    if (mediaLower.includes("facebook")) return "👥"
    if (mediaLower.includes("twitter") || mediaLower.includes("x")) return "🐦"
    return "📢"
  }

  // Helper function to get preview URL from file
  const getPreviewUrl = (file: any): string | null => {
    if (!file) return null

    if (typeof file === "string") {
      if (file.startsWith("http://") || file.startsWith("https://")) {
        return file
      }
      if (file.startsWith("data:")) {
        return file
      }
      return file
    }

    if (file && typeof file === "object" && file.url) {
      return file.url
    }

    if (file && typeof file === "object" && file.base64) {
      const base64Data = file.base64
      if (base64Data.startsWith("data:")) {
        return base64Data
      }
      const mimeType = file.type || "application/octet-stream"
      return `data:${mimeType};base64,${base64Data}`
    }

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
      try {
        return URL.createObjectURL(file)
      } catch (error) {
        console.error("Failed to create object URL:", error)
        return null
      }
    }

    if (file && typeof file === "object" && file.preview) {
      return file.preview
    }

    return null
  }

  // Helper function to get file type for preview
  const getFileType = (file: any): string => {
    if (!file) return "application/octet-stream"

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

    if (file && typeof file === "object" && file.type) {
      return file.type
    }

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

  // Helper function to handle file preview
  const handlePreviewFile = (file: any, title: string) => {
    try {
      const url = getPreviewUrl(file)
      const fileType = getFileType(file)
      const fileName = typeof file === "string" ? file.split("/").pop() || file : file?.name || "File"

      setPreviewModal({
        isOpen: true,
        file: file,
        url: url || "",
        type: fileType,
        fileName: fileName,
        title: title,
      })

      if (!file) {
        // onToast("File tidak ditemukan", "error")
      } else if (!url && file) {
        // onToast("File ditemukan tetapi tidak dapat ditampilkan. Mungkin hanya metadata yang tersimpan.", "info")
      }
    } catch (error) {
      console.error("Error opening file preview:", error)
      // onToast("Terjadi kesalahan saat membuka preview file", "error")
    }
  }

  // Helper function to download file
  const downloadFile = (file: any, fileName?: string) => {
    try {
      const url = getPreviewUrl(file)
      if (!url) {
        console.error("Cannot get URL for file download")
        // onToast("Tidak dapat mendownload file", "error")
        return
      }

      const link = document.createElement("a")
      link.href = url

      const downloadName =
        fileName || (typeof file === "string" ? file.split("/").pop() || "download" : file?.name || "download")
      link.download = downloadName

      if (url.startsWith("http://") || url.startsWith("https://")) {
        link.target = "_blank"
        link.rel = "noopener noreferrer"
      }

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // onToast("File berhasil didownload", "success")
    } catch (error) {
      console.error("Error downloading file:", error)
      // onToast("Terjadi kesalahan saat mendownload file", "error")
    }
  }

  const getFileDisplayName = (file: any): string => {
    if (!file) return "Tidak ada file"
    if (typeof file === "string") return file.length > 30 ? file.substring(0, 30) + "..." : file
    return file.name || "File tidak dikenal"
  }

  const handleFileView = (file: any) => {
    if (!file) return

    if (typeof file === "string") {
      window.open(file, "_blank")
    } else if (file.base64) {
      window.open(file.base64, "_blank")
    } else if (file.url) {
      window.open(file.url, "_blank")
    } else {
      alert("File tidak dapat ditampilkan. Hanya metadata yang tersimpan.")
    }
  }

  // Handle takedown content
  const handleTakedownContent = (contentId: string, reason: string) => {
    try {
      const savedSubmissions = localStorage.getItem("submissions")
      if (!savedSubmissions) {
        // onToast("Data submissions tidak ditemukan", "error")
        return
      }

      const submissions: Submission[] = JSON.parse(savedSubmissions)
      const submissionIndex = submissions.findIndex((s) => s.id === submission.id)

      if (submissionIndex === -1) {
        // onToast("Submission tidak ditemukan", "error")
        return
      }

      const contentIndex = submissions[submissionIndex].contentItems?.findIndex((c) => c.id === contentId)

      if (contentIndex === undefined || contentIndex === -1) {
        // onToast("Konten tidak ditemukan", "error")
        return
      }

      // Update content with takedown info
      if (submissions[submissionIndex].contentItems) {
        submissions[submissionIndex].contentItems[contentIndex] = {
          ...submissions[submissionIndex].contentItems[contentIndex],
          isTakedown: true,
          tanggalTakedown: new Date().toISOString(),
          alasanTakedown: reason,
          takedownBy: "Admin", // You can get this from user context
        }
      }

      localStorage.setItem("submissions", JSON.stringify(submissions))

      // Update local state
      if (submission.contentItems) {
        const updatedContentItems = submission.contentItems.map((item) =>
          item.id === contentId
            ? {
                ...item,
                isTakedown: true,
                tanggalTakedown: new Date().toISOString(),
                alasanTakedown: reason,
                takedownBy: "Admin",
              }
            : item,
        )
        submission.contentItems = updatedContentItems
      }

      setTakedownReason("")
      // onToast("Konten berhasil di-takedown", "success")
    } catch (error) {
      console.error("Error taking down content:", error)
      // onToast("Gagal melakukan takedown konten", "error")
    }
  }

  // Handle delete submission
  const handleDeleteSubmission = () => {
    try {
      const savedSubmissions = localStorage.getItem("submissions")
      if (!savedSubmissions) {
        // onToast("Data submissions tidak ditemukan", "error")
        return
      }

      const submissions: Submission[] = JSON.parse(savedSubmissions)
      const filteredSubmissions = submissions.filter((s) => s.id !== submission.id)

      localStorage.setItem("submissions", JSON.stringify(filteredSubmissions))

      // onToast("Dokumen berhasil dihapus", "success")
      onOpenChange(false)

      // Refresh the page or trigger a refresh
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error("Error deleting submission:", error)
      // onToast("Gagal menghapus dokumen", "error")
    }
  }

  const formatFileDisplay = (fileData?: FileData | string, title?: string) => {
    if (!fileData) return null

    const fileName = typeof fileData === "string" ? fileData.split("/").pop() || "Link File" : fileData.name
    const fileSize = typeof fileData === "string" ? null : `${Math.round(fileData.size / 1024)} KB`

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:border-green-300 transition-all duration-200"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <div className="p-1 bg-white rounded shadow-sm flex-shrink-0">
              <FileIcon className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{fileName}</p>
              {fileSize && <p className="text-xs text-gray-500">{fileSize}</p>}
            </div>
          </div>
          <div className="flex items-center space-x-1 flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePreviewFile(fileData, title || "File")}
              className="bg-white hover:bg-green-50 border-green-200 px-2 py-1 h-7 text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              Preview
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => downloadFile(fileData, fileName)}
              className="bg-white hover:bg-green-50 border-green-200 px-2 py-1 h-7 text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              Unduh
            </Button>
          </div>
        </div>

        {typeof fileData === "string" && (fileData.startsWith("http://") || fileData.startsWith("https://")) && (
          <div className="flex items-center space-x-1 text-xs text-green-600">
            <LinkIcon className="h-3 w-3 flex-shrink-0" />
            <span className="truncate text-xs">{fileData}</span>
          </div>
        )}
      </motion.div>
    )
  }

  // Calculate statistics
  const totalItems = submission.contentItems?.length || 0
  const approvedItemsCalc = submission.contentItems?.filter((item) => item.status === "approved").length || 0
  const rejectedItemsCalc = submission.contentItems?.filter((item) => item.status === "rejected").length || 0
  const tayangItems = submission.contentItems?.filter((item) => item.isTayang).length || 0
  const takedownItemsCalc = submission.contentItems?.filter((item) => item.isTakedown).length || 0

  const tabs = [
    { id: "overview", label: "Overview", icon: Activity, count: null },
    {
      id: "files",
      label: "File",
      icon: FileText,
      count: (submission.dokumenPendukung?.length || 0) + (submission.uploadedBuktiMengetahui ? 1 : 0),
    },
    { id: "content", label: "Konten", icon: Layers, count: contentItems.length },
    { id: "approved", label: "Disetujui", icon: CheckCircle, count: approvedItems.length },
    {
      id: "output",
      label: "Output",
      icon: Sparkles,
      count: approvedItems.filter(
        (item) =>
          item.hasilProdukValidasiFile || item.hasilProdukValidasiLink || item.hasilProdukFile || item.hasilProdukLink,
      ).length,
    },
  ]

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <span>{submission.judul}</span>
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-2 flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(submission.tanggalSubmit), "dd MMM yyyy")}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{submission.petugasPelaksana}</span>
                  </span>
                </DialogDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditDialogOpen(true)}
                  className="flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Hapus
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus Dokumen</AlertDialogTitle>
                      <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus dokumen "{submission.judul}"? Tindakan ini tidak dapat
                        dibatalkan.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                        Hapus
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-5 gap-4 mt-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
                <div className="text-xs text-blue-600">Total Item</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{approvedItemsCalc}</div>
                <div className="text-xs text-green-600">Disetujui</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{rejectedItemsCalc}</div>
                <div className="text-xs text-red-600">Ditolak</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{tayangItems}</div>
                <div className="text-xs text-purple-600">Tayang</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{takedownItemsCalc}</div>
                <div className="text-xs text-orange-600">Takedown</div>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Informasi Dasar
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Tema</Label>
                      <p className="text-sm text-gray-900 capitalize">{submission.tema}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">No. Comtab</Label>
                      <p className="text-sm text-gray-900 font-mono">{submission.noComtab}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Petugas Pelaksana</Label>
                      <p className="text-sm text-gray-900">{submission.petugasPelaksana}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Supervisor</Label>
                      <p className="text-sm text-gray-900">{submission.supervisor}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Tanggal Submit</Label>
                      <p className="text-sm text-gray-900">
                        {format(new Date(submission.tanggalSubmit), "dd MMMM yyyy, HH:mm")}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Jumlah Produksi</Label>
                      <p className="text-sm text-gray-900">{submission.jumlahProduksi} item</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Items */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <PlayCircle className="h-5 w-5 mr-2 text-purple-600" />
                  Detail Konten
                </h3>
                <div className="space-y-4">
                  {submission.contentItems?.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className="font-mono">
                            #{index + 1}
                          </Badge>
                          <h4 className="font-semibold text-gray-900">{item.nama}</h4>
                          {getStatusBadge(item.status || "pending", item.isTakedown)}
                          {item.isTayang && !item.isTakedown && (
                            <Badge className="bg-purple-100 text-purple-800 border-purple-200 flex items-center space-x-1">
                              <PlayCircle className="h-3 w-3" />
                              <span>Tayang</span>
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {item.status === "approved" && !item.isTakedown && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTakedown(item.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Ban className="h-4 w-4 mr-1" />
                              Takedown
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Takedown Information */}
                      {item.isTakedown && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <Ban className="h-4 w-4 text-red-600" />
                            <span className="font-semibold text-red-800">Konten di-Takedown</span>
                          </div>
                          <div className="text-sm text-red-700 space-y-1">
                            <p>
                              <strong>Alasan:</strong> {item.alasanTakedown}
                            </p>
                            <p>
                              <strong>Tanggal:</strong>{" "}
                              {item.tanggalTakedown && format(new Date(item.tanggalTakedown), "dd MMM yyyy, HH:mm")}
                            </p>
                            <p>
                              <strong>Oleh:</strong> {item.takedownBy}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-xs font-medium text-gray-600">Jenis Konten</Label>
                          <p className="text-gray-900 capitalize">{item.jenisKonten.replace("-", " ")}</p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-gray-600">Nomor Surat</Label>
                          <p className="text-gray-900">{item.nomorSurat || "-"}</p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-gray-600">Tanggal Order</Label>
                          <p className="text-gray-900">
                            {item.tanggalOrderMasuk ? format(new Date(item.tanggalOrderMasuk), "dd MMM yyyy") : "-"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-gray-600">Tanggal Jadi</Label>
                          <p className="text-gray-900">
                            {item.tanggalJadi ? format(new Date(item.tanggalJadi), "dd MMM yyyy") : "-"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-gray-600">Tanggal Tayang</Label>
                          <p className="text-gray-900">
                            {item.tanggalTayang ? format(new Date(item.tanggalTayang), "dd MMM yyyy") : "-"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-gray-600">Status Validasi</Label>
                          <p className="text-gray-900">
                            {item.isTayang ? (
                              <span className="text-green-600 font-medium">Sudah Tayang</span>
                            ) : (
                              <span className="text-yellow-600 font-medium">Belum Tayang</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Files */}
                      {(item.narasiFile ||
                        item.suratFile ||
                        item.audioDubbingFile ||
                        item.audioBacksoundFile ||
                        item.pendukungVideoFile ||
                        item.pendukungFotoFile ||
                        item.pendukungLainLainFile) && (
                        <div className="mt-4 pt-4 border-t">
                          <Label className="text-xs font-medium text-gray-600 mb-2 block">File Terlampir:</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {item.narasiFile && (
                              <div className="flex items-center justify-between p-2 bg-white rounded border">
                                <div className="flex items-center space-x-2 flex-1 min-w-0">
                                  <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">Narasi</p>
                                    <p className="text-xs text-gray-500 truncate">
                                      {getFileDisplayName(item.narasiFile)}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleFileView(item.narasiFile)}
                                  className="h-7 w-7 p-0"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                            {item.suratFile && (
                              <div className="flex items-center justify-between p-2 bg-white rounded border">
                                <div className="flex items-center space-x-2 flex-1 min-w-0">
                                  <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">Surat</p>
                                    <p className="text-xs text-gray-500 truncate">
                                      {getFileDisplayName(item.suratFile)}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleFileView(item.suratFile)}
                                  className="h-7 w-7 p-0"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                            {/* Add other file types similarly */}
                          </div>
                        </div>
                      )}

                      {/* Rejection reason */}
                      {item.status === "rejected" && item.alasanPenolakan && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="font-semibold text-red-800">Alasan Penolakan</span>
                          </div>
                          <p className="text-sm text-red-700">{item.alasanPenolakan}</p>
                        </div>
                      )}

                      {/* Keterangan */}
                      {item.keterangan && (
                        <div className="mt-4 pt-4 border-t">
                          <Label className="text-xs font-medium text-gray-600">Keterangan:</Label>
                          <p className="text-sm text-gray-900 mt-1">{item.keterangan}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bukti Mengetahui */}
            {submission.uploadedBuktiMengetahui && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-green-600" />
                    Bukti Mengetahui
                  </h3>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          {getFileDisplayName(submission.uploadedBuktiMengetahui)}
                        </p>
                        <p className="text-xs text-green-600">Bukti persetujuan Kepala Bidang</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFileView(submission.uploadedBuktiMengetahui)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-100"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Lihat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Takedown Dialog */}
      <Dialog open={isTakedownDialogOpen} onOpenChange={setIsTakedownDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Ban className="h-5 w-5 text-red-600" />
              <span>Takedown Konten</span>
            </DialogTitle>
            <DialogDescription>
              Masukkan alasan untuk melakukan takedown pada konten ini. Konten akan tetap dianggap tayang namun ditandai
              sebagai takedown.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="takedown-reason">Alasan Takedown *</Label>
              <Textarea
                id="takedown-reason"
                value={takedownReason}
                onChange={(e) => setTakedownReason(e.target.value)}
                placeholder="Masukkan alasan takedown..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTakedownDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={confirmTakedown} disabled={!takedownReason.trim()} className="bg-red-600 hover:bg-red-700">
              <Ban className="h-4 w-4 mr-2" />
              Takedown
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog Placeholder */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="h-5 w-5 text-blue-600" />
              <span>Edit Dokumen</span>
            </DialogTitle>
            <DialogDescription>Fitur edit akan segera tersedia.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsEditDialogOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

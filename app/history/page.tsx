"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Filter,
  Search,
  Eye,
  FileText,
  Users,
  Sparkles,
  Calendar,
  CheckCircle,
  XCircle,
  Edit,
  ArrowLeftIcon,
  X,
  Bell,
  BarChart3,
  TrendingUp,
  Grid3X3,
  List,
  RefreshCw,
  SortAsc,
  SortDesc,
  ChevronRight,
  Star,
  Activity,
  Hash,
  Target,
  Layers,
  Shield,
  Rocket,
  Zap,
  Send,
  CheckCircle2,
  AlertCircle,
  History,
  Video,
  ImageIcon,
  Music,
  Mic,
  FileImage,
  Play,
  Radio,
  Tv,
  Globe,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { loadSubmissionsFromStorage } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useMobile } from "@/hooks/use-mobile"
import MobileHistoryPage from "./mobile-page"

// Local formatDate function
const formatDate = (date: Date | string | undefined): string => {
  if (!date) return "-"

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date
    if (isNaN(dateObj.getTime())) return "-"

    return dateObj.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch (error) {
    return "-"
  }
}

// Local getContentTypeIcon function
const getContentTypeIcon = (jenisKonten: string) => {
  switch (jenisKonten.toLowerCase()) {
    case "video":
    case "video-promosi":
    case "video-edukasi":
      return <Video className="h-4 w-4 text-red-500" />
    case "foto":
    case "foto-kegiatan":
    case "foto-produk":
      return <ImageIcon className="h-4 w-4 text-blue-500" />
    case "audio":
    case "audio-dubbing":
    case "audio-backsound":
      return <Music className="h-4 w-4 text-green-500" />
    case "podcast":
    case "wawancara":
      return <Mic className="h-4 w-4 text-purple-500" />
    case "infografis":
    case "poster":
    case "banner":
      return <FileImage className="h-4 w-4 text-orange-500" />
    case "animasi":
    case "motion-graphics":
      return <Play className="h-4 w-4 text-pink-500" />
    default:
      return <FileText className="h-4 w-4 text-gray-500" />
  }
}

// Local getMediaIcon function
const getMediaIcon = (media: string) => {
  switch (media.toLowerCase()) {
    case "tv":
    case "televisi":
      return <Tv className="h-3 w-3" />
    case "radio":
      return <Radio className="h-3 w-3" />
    case "website":
    case "web":
      return <Globe className="h-3 w-3" />
    case "facebook":
    case "fb":
      return <Facebook className="h-3 w-3" />
    case "instagram":
    case "ig":
      return <Instagram className="h-3 w-3" />
    case "youtube":
    case "yt":
      return <Youtube className="h-3 w-3" />
    case "twitter":
    case "x":
      return <Twitter className="h-3 w-3" />
    default:
      return <Globe className="h-3 w-3" />
  }
}

interface FileData {
  name: string
  size: number
  type: string
  lastModified: number
  base64: string
  url: string
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
  narasiFile?: FileData | string
  suratFile?: FileData | string
  audioDubbingFile?: FileData | string
  audioDubbingLainLainFile?: FileData | string
  audioBacksoundFile?: FileData | string
  audioBacksoundLainLainFile?: FileData | string
  pendukungVideoFile?: FileData | string
  pendukungFotoFile?: FileData | string
  pendukungLainLainFile?: FileData | string
  tanggalOrderMasuk: Date | undefined
  tanggalJadi: Date | undefined
  tanggalTayang: Date | undefined
  keterangan: string
  status?: "pending" | "approved" | "rejected"
  alasanPenolakan?: string
  tanggalDiproses?: string
  diprosesoleh?: string
  hasilProdukFile?: FileData | string
  hasilProdukLink?: string
  isTayang?: boolean
  tanggalValidasiTayang?: string
  validatorTayang?: string
  keteranganValidasi?: string
  alasanTidakTayang?: string
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
  tanggalKonfirmasi?: string
  uploadedBuktiMengetahui?: FileData | string
  isConfirmed?: boolean
  isOutputValidated?: boolean
  tanggalValidasiOutput?: string
  contentItems?: ContentItem[]
  workflowStage?: "submitted" | "review" | "validation" | "completed"
}

interface EditAccessData {
  submissionId: string
  pin: string
}

// Helper function to determine workflow stage
const getWorkflowStage = (submission: Submission): "submitted" | "review" | "validation" | "completed" => {
  if (!submission.isConfirmed) return "submitted"

  const contentItems = submission.contentItems || []
  if (contentItems.length === 0) return "review"

  const allReviewed = contentItems.every((item) => item.status === "approved" || item.status === "rejected")
  if (!allReviewed) return "review"

  const hasApprovedItems = contentItems.some((item) => item.status === "approved")
  if (!hasApprovedItems) return "completed"

  const approvedItems = contentItems.filter((item) => item.status === "approved")
  const allValidated = approvedItems.every((item) => item.isTayang !== undefined)

  if (!allValidated) return "validation"
  return "completed"
}

// Helper function to get workflow stage info
const getWorkflowStageInfo = (stage: string) => {
  switch (stage) {
    case "submitted":
      return {
        label: "Dikirim",
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <Send className="h-3 w-3" />,
        description: "Menunggu konfirmasi admin",
      }
    case "review":
      return {
        label: "Review",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: <Eye className="h-3 w-3" />,
        description: "Sedang direview admin",
      }
    case "validation":
      return {
        label: "Validasi",
        color: "bg-purple-100 text-purple-800 border-purple-200",
        icon: <Shield className="h-3 w-3" />,
        description: "Menunggu validasi output",
      }
    case "completed":
      return {
        label: "Selesai",
        color: "bg-green-100 text-green-800 border-green-200",
        icon: <CheckCircle2 className="h-3 w-3" />,
        description: "Proses workflow selesai",
      }
    default:
      return {
        label: "Unknown",
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: <AlertCircle className="h-3 w-3" />,
        description: "Status tidak diketahui",
      }
  }
}

// Local getStatusBadge function
const getStatusBadge = (status?: "pending" | "approved" | "rejected") => {
  switch (status) {
    case "approved":
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Disetujui
        </Badge>
      )
    case "rejected":
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          Ditolak
        </Badge>
      )
    case "pending":
    default:
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <AlertCircle className="h-3 w-3 mr-1" />
          Menunggu
        </Badge>
      )
  }
}

export default function HistoryPage() {
  // All hooks must be called at the top level, before any conditional returns
  const isMobile = useMobile()
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "submitted" | "review" | "validation" | "completed">("all")
  const [filterTheme, setFilterTheme] = useState<"all" | "sosial" | "ekonomi" | "lingkungan">("all")
  const [sortBy, setSortBy] = useState<"date" | "status" | "title">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards")
  const [viewingSubmission, setViewingSubmission] = useState<Submission | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditAccessDialogOpen, setIsEditAccessDialogOpen] = useState(false)
  const [editAccessData, setEditAccessData] = useState<EditAccessData>({
    submissionId: "",
    pin: "",
  })
  const [toastMessage, setToastMessage] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    setIsLoading(true)
    fetch(`${API_URL}/api/pengajuan`)
      .then((res) => res.json())
      .then((result) => {
        const submissionsFromApi = (result.data || []).map((sub: any) => {
          // Parse stringified arrays if needed
          function parseArrayField(field: any) {
            if (Array.isArray(field)) return field
            if (typeof field === "string") {
              try {
                // Remove extra quotes if present (e.g. "\"[]\"")
                const cleaned = field.replace(/^"+|"+$/g, "")
                return JSON.parse(cleaned)
              } catch {
                return []
              }
            }
            return []
          }

          let mediaPemerintah = parseArrayField(sub.mediaPemerintah)
          let mediaMassa = parseArrayField(sub.mediaMassa)
          let jenisKonten = parseArrayField(sub.jenisKonten)

          // Parse uploadedBuktiMengetahui if it's an object or string
          let uploadedBuktiMengetahui = sub.uploadedBuktiMengetahui
          if (typeof uploadedBuktiMengetahui === "string") {
            try {
              uploadedBuktiMengetahui = JSON.parse(uploadedBuktiMengetahui)
            } catch {
              uploadedBuktiMengetahui = undefined
            }
          }

          // Parse contentItems array fields
          const contentItems = (sub.contentItems || []).map((item: any) => {
            return {
              ...item,
              mediaPemerintah: parseArrayField(item.mediaPemerintah),
              mediaMassa: parseArrayField(item.mediaMassa),
              tanggalOrderMasuk: item.tanggalOrderMasuk ? new Date(item.tanggalOrderMasuk) : undefined,
              tanggalJadi: item.tanggalJadi ? new Date(item.tanggalJadi) : undefined,
              tanggalTayang: item.tanggalTayang ? new Date(item.tanggalTayang) : undefined,
            }
          })

          return {
            ...sub,
            mediaPemerintah,
            mediaMassa,
            jenisKonten,
            uploadedBuktiMengetahui,
            isConfirmed: !!sub.isConfirmed,
            tanggalOrder: sub.tanggalOrder ? new Date(sub.tanggalOrder) : undefined,
            tanggalSubmit: sub.tanggalSubmit ? new Date(sub.tanggalSubmit) : undefined,
            lastModified: sub.lastModified ? new Date(sub.lastModified) : undefined,
            tanggalKonfirmasi: sub.tanggalKonfirmasi || undefined,
            isOutputValidated: !!sub.isOutputValidated,
            tanggalValidasiOutput: sub.tanggalValidasiOutput || undefined,
            contentItems,
            workflowStage: getWorkflowStage({
              ...sub,
              mediaPemerintah,
              mediaMassa,
              jenisKonten,
              contentItems,
              isConfirmed: !!sub.isConfirmed,
            }),
          }
        })
        setSubmissions(submissionsFromApi)
        setIsLoading(false)
      })
      .catch(() => {
        setIsLoading(false)
        showToastMessage("Gagal mengambil data dari server!", "error")
      })
  }, [])

  const showToastMessage = (message: string, type: "success" | "error" | "info" = "info") => {
    setToastMessage({ message, type })
    setTimeout(() => setToastMessage(null), 5000)
  }

  const filteredAndSortedSubmissions = useMemo(() => {
    const filtered = submissions.filter((submission) => {
      const matchesSearch =
        submission.noComtab.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.petugasPelaksana.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.supervisor.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = filterStatus === "all" || submission.workflowStage === filterStatus
      const matchesTheme = filterTheme === "all" || submission.tema === filterTheme

      return matchesSearch && matchesStatus && matchesTheme
    })

    // Sort submissions
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case "date":
          const dateA = a.tanggalSubmit ? new Date(a.tanggalSubmit).getTime() : 0
          const dateB = b.tanggalSubmit ? new Date(b.tanggalSubmit).getTime() : 0
          comparison = dateA - dateB
          break
        case "title":
          comparison = a.judul.localeCompare(b.judul)
          break
        case "status":
          const statusPriority = { completed: 4, validation: 3, review: 2, submitted: 1 }
          comparison =
            (statusPriority[a.workflowStage || "submitted"] || 0) -
            (statusPriority[b.workflowStage || "submitted"] || 0)
          break
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [submissions, searchTerm, filterStatus, filterTheme, sortBy, sortOrder])

  const statistics = useMemo(() => {
    const total = submissions.length
    const submitted = submissions.filter((s) => s.workflowStage === "submitted").length
    const review = submissions.filter((s) => s.workflowStage === "review").length
    const validation = submissions.filter((s) => s.workflowStage === "validation").length
    const completed = submissions.filter((s) => s.workflowStage === "completed").length

    const contentStats = submissions.reduce(
      (acc, sub) => {
        sub.contentItems?.forEach((item) => {
          acc.total++
          if (item.status === "approved") acc.approved++
          else if (item.status === "rejected") acc.rejected++
          else acc.pending++

          if (item.isTayang === true) acc.published++
          else if (item.isTayang === false) acc.notPublished++
        })
        return acc
      },
      { total: 0, approved: 0, rejected: 0, pending: 0, published: 0, notPublished: 0 },
    )

    return {
      submissions: { total, submitted, review, validation, completed },
      content: contentStats,
    }
  }, [submissions])

  const handleViewDetails = (submission: Submission) => {
    setViewingSubmission(submission)
    setIsViewDialogOpen(true)
  }

  const handleExportToExcel = () => {
    const headers = [
      "No Comtab",
      "Judul",
      "Tema",
      "Jenis Media",
      "Media Pemerintah",
      "Media Massa",
      "Jenis Konten",
      "Tanggal Order",
      "Petugas Pelaksana",
      "Supervisor",
      "Durasi",
      "Jumlah Produksi",
      "Tanggal Submit",
      "Workflow Stage",
      "Status Konfirmasi",
      "Tanggal Konfirmasi",
      "Status Validasi Output",
      "Tanggal Validasi Output",
      "Last Modified",
      "Bukti Mengetahui URL",
      "Content Items",
    ]

    const rows = filteredAndSortedSubmissions.map((sub) => [
      sub.noComtab,
      sub.judul,
      sub.tema,
      sub.jenisMedia,
      sub.mediaPemerintah.join(", "),
      sub.mediaMassa.join(", "),
      sub.jenisKonten.join(", "),
      formatDate(sub.tanggalOrder),
      sub.petugasPelaksana,
      sub.supervisor,
      sub.durasi,
      sub.jumlahProduksi,
      formatDate(sub.tanggalSubmit),
      getWorkflowStageInfo(sub.workflowStage || "submitted").label,
      sub.isConfirmed ? "Dikonfirmasi" : "Menunggu",
      sub.tanggalKonfirmasi || "-",
      sub.isOutputValidated ? "Divalidasi" : "Belum",
      sub.tanggalValidasiOutput || "-",
      formatDate(sub.lastModified),
      typeof sub.uploadedBuktiMengetahui === "string"
        ? sub.uploadedBuktiMengetahui
        : sub.uploadedBuktiMengetahui?.url || "-",
      sub.contentItems
        ?.map(
          (item) =>
            `[${item.jenisKonten}: ${item.nama} (Status: ${item.status || "pending"}, Tayang: ${item.isTayang === true ? "Ya" : item.isTayang === false ? "Tidak" : "Belum"}, Order: ${formatDate(item.tanggalOrderMasuk)}, Jadi: ${formatDate(item.tanggalJadi)}, Tayang: ${formatDate(item.tanggalTayang)})]`,
        )
        .join("; "),
    ])

    const csvContent = [headers.join("\t"), ...rows.map((row) => row.join("\t"))].join("\n")

    const blob = new Blob([csvContent], { type: "text/tab-separated-values;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "riwayat_pengajuan_konten.xls")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToastMessage("Data berhasil diekspor ke Excel!", "success")
  }

  const handleEditAccess = () => {
    const submission = submissions.find((sub) => sub.noComtab === editAccessData.submissionId)
    if (submission && submission.pin === editAccessData.pin) {
      router.push(`/?editId=${submission.noComtab}&editPin=${submission.pin}`)
      setIsEditAccessDialogOpen(false)
      showToastMessage("Akses edit berhasil! Mengarahkan ke halaman pengajuan.", "success")
    } else {
      showToastMessage("No Comtab atau PIN salah!", "error")
    }
  }

  const refreshData = () => {
    setIsLoading(true)
    setTimeout(() => {
      const storedSubmissions = loadSubmissionsFromStorage()
      const submissionsWithStage = storedSubmissions.map((sub: Submission) => ({
        ...sub,
        workflowStage: getWorkflowStage(sub),
      }))
      setSubmissions(submissionsWithStage)
      setIsLoading(false)
      showToastMessage("Data berhasil diperbarui!", "success")
    }, 1000)
  }

  const formatFileDisplay = (fileData?: FileData | string) => {
    if (!fileData) return "Tidak ada file"
    if (typeof fileData === "string") {
      return (
        <a href={fileData} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          {fileData.split("/").pop()} (Link)
        </a>
      )
    }
    return (
      <a href={fileData.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
        {fileData.name} ({Math.round(fileData.size / 1024)} KB)
      </a>
    )
  }

  // Now conditionally render based on mobile detection
  if (isMobile) {
    return <MobileHistoryPage />
  }

  // Desktop version components
  const StatCard = ({ title, value, icon, color, trend, delay = 0 }: any) => (
    <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay, duration: 0.5 }}>
      <Card className={cn("border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105", color)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <motion.p
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: delay + 0.2 }}
                className="text-3xl font-bold text-gray-900"
              >
                {value}
              </motion.p>
              {trend && (
                <p className="text-xs text-gray-500 mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {trend}
                </p>
              )}
            </div>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: delay + 0.3, type: "spring", stiffness: 200 }}
              className={cn("p-3 rounded-full", color)}
            >
              {icon}
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const SubmissionCard = ({ submission, index }: { submission: Submission; index: number }) => {
    const approvedContentCount = submission.contentItems?.filter((item) => item.status === "approved").length || 0
    const rejectedContentCount = submission.contentItems?.filter((item) => item.status === "rejected").length || 0
    const totalContentCount = submission.contentItems?.length || 0
    const publishedContentCount = submission.contentItems?.filter((item) => item.isTayang === true).length || 0
    const workflowStageInfo = getWorkflowStageInfo(submission.workflowStage || "submitted")

    return (
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        whileHover={{ y: -8, scale: 1.02 }}
        className="group"
      >
        <Card
          className={cn(
            "border-0 shadow-lg bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-sm",
            "hover:shadow-2xl transition-all duration-500 cursor-pointer",
            "transform hover:rotate-1",
          )}
          onClick={() => handleViewDetails(submission)}
        >
          <CardHeader className="pb-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100/50 to-purple-100/50 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-3 flex-1">
                <div className="flex items-center space-x-3 flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className="bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border-indigo-200 px-3 py-1 font-medium group-hover:scale-110 transition-transform"
                  >
                    <Hash className="h-3 w-3 mr-1" />
                    {submission.noComtab}
                  </Badge>
                  <Badge
                    className={cn(
                      "font-semibold px-3 py-1 group-hover:scale-110 transition-transform",
                      workflowStageInfo.color,
                    )}
                  >
                    {workflowStageInfo.icon}
                    <span className="ml-1">{workflowStageInfo.label}</span>
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="capitalize bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 px-3 py-1 group-hover:scale-110 transition-transform"
                  >
                    <Target className="h-3 w-3 mr-1" />
                    {submission.tema === "sosial" ? "🏥" : submission.tema === "ekonomi" ? "💰" : "🌱"}{" "}
                    {submission.tema}
                  </Badge>
                </div>
                <CardTitle className="text-xl text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">
                  {submission.judul}
                </CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2 p-2 bg-white/70 rounded-lg">
                    <Users className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-500">Petugas</p>
                      <p className="font-medium text-gray-900">{submission.petugasPelaksana}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-white/70 rounded-lg">
                    <Calendar className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-xs text-gray-500">Tanggal Submit</p>
                      <p className="font-medium text-gray-900">{formatDate(submission.tanggalSubmit)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-white/70 rounded-lg">
                    <Layers className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="text-xs text-gray-500">Total Konten</p>
                      <p className="font-medium text-gray-900">{totalContentCount} item</p>
                    </div>
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-indigo-500" />
                <span className="text-sm font-medium text-gray-700">
                  Progress: {approvedContentCount + rejectedContentCount}/{totalContentCount} Diproses
                </span>
              </div>
              <div className="flex space-x-1">
                {submission.contentItems?.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="p-1 bg-white rounded shadow-sm">
                    {getContentTypeIcon(item.jenisKonten)}
                  </div>
                ))}
                {(submission.contentItems?.length || 0) > 3 && (
                  <div className="p-1 bg-gray-100 rounded text-xs text-gray-600 flex items-center justify-center w-6 h-6">
                    +{(submission.contentItems?.length || 0) - 3}
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Progress Workflow</span>
                <span>{Math.round(((approvedContentCount + rejectedContentCount) / totalContentCount) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${((approvedContentCount + rejectedContentCount) / totalContentCount) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Workflow Stage Description */}
            <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
              <div className="flex items-center space-x-2">
                {workflowStageInfo.icon}
                <span className="text-sm font-medium text-gray-700">{workflowStageInfo.description}</span>
              </div>
              {publishedContentCount > 0 && (
                <Badge className="bg-green-100 text-green-800 text-xs">
                  <Rocket className="h-3 w-3 mr-1" />
                  {publishedContentCount} Tayang
                </Badge>
              )}
            </div>

            {/* Media Platforms Preview */}
            <div className="flex flex-wrap gap-1">
              {[...submission.mediaPemerintah, ...submission.mediaMassa].slice(0, 4).map((media, idx) => (
                <Badge key={idx} variant="outline" className="text-xs bg-white/70 hover:bg-white transition-colors">
                  {getMediaIcon(media)}
                  <span className="ml-1 capitalize">{media.replace("-", " ")}</span>
                </Badge>
              ))}
              {[...submission.mediaPemerintah, ...submission.mediaMassa].length > 4 && (
                <Badge variant="outline" className="text-xs bg-gray-100">
                  +{[...submission.mediaPemerintah, ...submission.mediaMassa].length - 4}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-indigo-700">Memuat riwayat pengajuan...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
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
              className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0"
            >
              <motion.div
                whileHover={{ rotate: 15 }}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
              >
                <History className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </motion.div>
              <div className="flex-1 min-w-0 flex items-center justify-between">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Riwayat Pengajuan
                </h1>
                <div className="sm:hidden flex-shrink-0 ml-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-gray-50 transition-all duration-300 bg-transparent"
                      >
                        <Menu className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={refreshData} disabled={isLoading} className="cursor-pointer">
                        <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                        Refresh
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setIsEditAccessDialogOpen(true)} className="cursor-pointer">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Pengajuan
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push("/")} className="cursor-pointer">
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        Kembali
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="hidden sm:flex items-center space-x-3"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={isLoading}
                className="hover:bg-green-50 hover:border-green-200 transition-all duration-300 bg-transparent"
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditAccessDialogOpen(true)}
                className="hover:bg-blue-50 hover:border-blue-200 transition-all duration-300"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Pengajuan
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/")}
                className="hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-300"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Kembali
              </Button>
            </motion.div>
          </div>
          <p className="text-gray-600 mt-2 text-sm sm:hidden">Kelola dan pantau semua pengajuan konten Anda</p>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Pengajuan"
            value={statistics.submissions.total}
            icon={<FileText className="h-6 w-6 text-blue-600" />}
            color="bg-blue-50"
            trend="Total keseluruhan"
            delay={0.1}
          />
          <StatCard
            title="Selesai"
            value={statistics.submissions.completed}
            icon={<CheckCircle2 className="h-6 w-6 text-green-600" />}
            color="bg-green-50"
            trend={`${Math.round((statistics.submissions.completed / statistics.submissions.total) * 100) || 0}% dari total`}
            delay={0.2}
          />
          <StatCard
            title="Dalam Proses"
            value={statistics.submissions.review + statistics.submissions.validation}
            icon={<Zap className="h-6 w-6 text-yellow-600" />}
            color="bg-yellow-50"
            trend="Sedang diproses"
            delay={0.3}
          />
          <StatCard
            title="Konten Tayang"
            value={statistics.content.published}
            icon={<Rocket className="h-6 w-6 text-purple-600" />}
            color="bg-purple-50"
            trend={`${statistics.content.total} total konten`}
            delay={0.4}
          />
        </div>

        {/* Enhanced Workflow Stage Statistics */}
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-indigo-600" />
                <span>Status Workflow</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { stage: "submitted", count: statistics.submissions.submitted, label: "Dikirim" },
                  { stage: "review", count: statistics.submissions.review, label: "Review" },
                  { stage: "validation", count: statistics.submissions.validation, label: "Validasi" },
                  { stage: "completed", count: statistics.submissions.completed, label: "Selesai" },
                ].map((item, index) => {
                  const stageInfo = getWorkflowStageInfo(item.stage)
                  return (
                    <motion.div
                      key={item.stage}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="text-center p-4 rounded-lg bg-gradient-to-br from-gray-50 to-white border"
                    >
                      <div
                        className={cn(
                          "w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center",
                          stageInfo.color,
                        )}
                      >
                        {stageInfo.icon}
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{item.count}</p>
                      <p className="text-sm text-gray-600">{item.label}</p>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Controls */}
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <Tabs defaultValue="filters" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="filters" className="flex items-center space-x-2">
                    <Filter className="h-4 w-4" />
                    <span>Filter & Pencarian</span>
                  </TabsTrigger>
                  <TabsTrigger value="view" className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Tampilan & Urutan</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="filters" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Cari pengajuan..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-gray-200 focus:border-indigo-500 bg-white/70 backdrop-blur-sm h-12"
                      />
                    </div>

                    <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                      <SelectTrigger className="bg-white/70 backdrop-blur-sm h-12">
                        <SelectValue placeholder="Filter Status Workflow" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">📋 Semua Status</SelectItem>
                        <SelectItem value="submitted">📤 Dikirim</SelectItem>
                        <SelectItem value="review">👁️ Review</SelectItem>
                        <SelectItem value="validation">🛡️ Validasi</SelectItem>
                        <SelectItem value="completed">✅ Selesai</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filterTheme} onValueChange={(value: any) => setFilterTheme(value)}>
                      <SelectTrigger className="bg-white/70 backdrop-blur-sm h-12">
                        <SelectValue placeholder="Filter Tema" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">🌟 Semua Tema</SelectItem>
                        <SelectItem value="sosial">🏥 Sosial</SelectItem>
                        <SelectItem value="ekonomi">💰 Ekonomi</SelectItem>
                        <SelectItem value="lingkungan">🌱 Lingkungan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="view" className="space-y-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Label className="text-sm font-medium">Tampilan:</Label>
                        <div className="flex border rounded-lg p-1 bg-gray-50">
                          <Button
                            variant={viewMode === "cards" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("cards")}
                            className="h-8"
                          >
                            <Grid3X3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={viewMode === "table" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("table")}
                            className="h-8"
                          >
                            <List className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Label className="text-sm font-medium">Urutkan:</Label>
                        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="date">Tanggal</SelectItem>
                            <SelectItem value="title">Judul</SelectItem>
                            <SelectItem value="status">Status</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                          className="h-10"
                        >
                          {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Hasil Pencarian ({filteredAndSortedSubmissions.length})
            </h2>
            {filteredAndSortedSubmissions.length > 0 && (
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700">
                <Star className="h-3 w-3 mr-1" />
                {filteredAndSortedSubmissions.length} pengajuan ditemukan
              </Badge>
            )}
          </div>

          {filteredAndSortedSubmissions.length === 0 ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <div className="animate-bounce">
                    <div className="mx-auto w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-6">
                      <FileText className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Tidak ada pengajuan ditemukan</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Coba ubah kriteria pencarian atau filter untuk menemukan pengajuan yang Anda cari.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : viewMode === "cards" ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedSubmissions.map((submission, index) => (
                <SubmissionCard key={submission.id} submission={submission} index={index} />
              ))}
            </div>
          ) : (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}>
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100">
                          <TableHead className="w-[120px] font-semibold">No Comtab</TableHead>
                          <TableHead className="font-semibold">Judul</TableHead>
                          <TableHead className="font-semibold">Petugas</TableHead>
                          <TableHead className="font-semibold">Workflow</TableHead>
                          <TableHead className="font-semibold">Konten</TableHead>
                          <TableHead className="font-semibold">Tayang</TableHead>
                          <TableHead className="text-right font-semibold">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAndSortedSubmissions.map((submission, index) => {
                          const workflowStageInfo = getWorkflowStageInfo(submission.workflowStage || "submitted")
                          const publishedCount =
                            submission.contentItems?.filter((item) => item.isTayang === true).length || 0

                          return (
                            <motion.tr
                              key={submission.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 cursor-pointer"
                              onClick={() => handleViewDetails(submission)}
                            >
                              <TableCell className="font-medium">
                                <Badge variant="outline" className="bg-indigo-50 text-indigo-700">
                                  {submission.noComtab}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">{submission.judul}</TableCell>
                              <TableCell>{submission.petugasPelaksana}</TableCell>
                              <TableCell>
                                <Badge className={cn("text-xs", workflowStageInfo.color)}>
                                  {workflowStageInfo.icon}
                                  <span className="ml-1">{workflowStageInfo.label}</span>
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm">{submission.contentItems?.length || 0}</span>
                                  <div className="flex space-x-1">
                                    {submission.contentItems?.slice(0, 2).map((item, idx) => (
                                      <div key={idx} className="w-4 h-4">
                                        {getContentTypeIcon(item.jenisKonten)}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {publishedCount > 0 ? (
                                  <Badge className="bg-green-100 text-green-800 text-xs">
                                    <Rocket className="h-3 w-3 mr-1" />
                                    {publishedCount}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">
                                    Belum
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleViewDetails(submission)
                                  }}
                                  className="hover:bg-indigo-50 hover:border-indigo-200"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Lihat
                                </Button>
                              </TableCell>
                            </motion.tr>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center">
              <FileText className="h-6 w-6 mr-2 text-indigo-600" />
              Detail Pengajuan
            </DialogTitle>
            <DialogDescription>Informasi lengkap mengenai pengajuan konten ini.</DialogDescription>
          </DialogHeader>
          {viewingSubmission && (
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="space-y-6 py-4">
                {/* Workflow Stage Info */}
                <div className="p-4 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getWorkflowStageInfo(viewingSubmission.workflowStage || "submitted").icon}
                      <div>
                        <h3 className="font-semibold text-indigo-900">
                          Status: {getWorkflowStageInfo(viewingSubmission.workflowStage || "submitted").label}
                        </h3>
                        <p className="text-sm text-indigo-700">
                          {getWorkflowStageInfo(viewingSubmission.workflowStage || "submitted").description}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        "px-3 py-1",
                        getWorkflowStageInfo(viewingSubmission.workflowStage || "submitted").color,
                      )}
                    >
                      {getWorkflowStageInfo(viewingSubmission.workflowStage || "submitted").label}
                    </Badge>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center text-gray-600">
                      <Hash className="h-4 w-4 mr-2 text-gray-500" />
                      No Comtab
                    </Label>
                    <p className="font-semibold text-lg">{viewingSubmission.noComtab}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center text-gray-600">
                      <Sparkles className="h-4 w-4 mr-2 text-gray-500" />
                      Judul
                    </Label>
                    <p className="font-semibold">{viewingSubmission.judul}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center text-gray-600">
                      <Target className="h-4 w-4 mr-2 text-gray-500" />
                      Tema
                    </Label>
                    <Badge className="bg-green-100 text-green-800 capitalize">
                      {viewingSubmission.tema === "sosial" ? "🏥" : viewingSubmission.tema === "ekonomi" ? "💰" : "🌱"}{" "}
                      {viewingSubmission.tema}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-2 text-gray-500" />
                      Petugas Pelaksana
                    </Label>
                    <p className="font-semibold">{viewingSubmission.petugasPelaksana}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-2 text-gray-500" />
                      Supervisor
                    </Label>
                    <p className="font-semibold">{viewingSubmission.supervisor}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      Tanggal Submit
                    </Label>
                    <p className="font-semibold">{formatDate(viewingSubmission.tanggalSubmit)}</p>
                  </div>
                </div>

                <Separator />

                {/* Content Items */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Layers className="h-5 w-5 mr-2 text-indigo-600" />
                    Item Konten ({viewingSubmission.contentItems?.length || 0})
                  </h3>
                  {viewingSubmission.contentItems && viewingSubmission.contentItems.length > 0 ? (
                    <div className="space-y-4">
                      {viewingSubmission.contentItems.map((item, index) => (
                        <Card key={index} className="border border-gray-200">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                {getContentTypeIcon(item.jenisKonten)}
                                <div>
                                  <h4 className="font-semibold">{item.nama}</h4>
                                  <p className="text-sm text-gray-600 capitalize">{item.jenisKonten}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getStatusBadge(item.status)}
                                {item.isTayang === true && (
                                  <Badge className="bg-green-100 text-green-800">
                                    <Rocket className="h-3 w-3 mr-1" />
                                    Tayang
                                  </Badge>
                                )}
                                {item.isTayang === false && (
                                  <Badge variant="outline" className="text-red-600">
                                    Tidak Tayang
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <Label className="text-xs text-gray-500">Tanggal Order</Label>
                                <p className="font-medium">{formatDate(item.tanggalOrderMasuk)}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-gray-500">Tanggal Jadi</Label>
                                <p className="font-medium">{formatDate(item.tanggalJadi)}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-gray-500">Tanggal Tayang</Label>
                                <p className="font-medium">{formatDate(item.tanggalTayang)}</p>
                              </div>
                            </div>

                            {item.keterangan && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <Label className="text-xs text-gray-500">Keterangan</Label>
                                <p className="text-sm mt-1">{item.keterangan}</p>
                              </div>
                            )}

                            {item.alasanPenolakan && (
                              <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                <Label className="text-xs text-red-600">Alasan Penolakan</Label>
                                <p className="text-sm mt-1 text-red-700">{item.alasanPenolakan}</p>
                              </div>
                            )}

                            {item.hasilProdukFile && (
                              <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                <Label className="text-xs text-green-600">Hasil Produksi</Label>
                                <div className="mt-1">{formatFileDisplay(item.hasilProdukFile)}</div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Layers className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>Belum ada item konten</p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Media Platforms */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Platform Media</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Media Pemerintah</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {viewingSubmission.mediaPemerintah.map((media, index) => (
                          <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                            {getMediaIcon(media)}
                            <span className="ml-1 capitalize">{media.replace("-", " ")}</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Media Massa</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {viewingSubmission.mediaMassa.map((media, index) => (
                          <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700">
                            {getMediaIcon(media)}
                            <span className="ml-1 capitalize">{media.replace("-", " ")}</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Durasi</Label>
                    <p className="font-semibold">{viewingSubmission.durasi}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Jumlah Produksi</Label>
                    <p className="font-semibold">{viewingSubmission.jumlahProduksi}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Status Konfirmasi</Label>
                    <Badge
                      className={
                        viewingSubmission.isConfirmed ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {viewingSubmission.isConfirmed ? "Dikonfirmasi" : "Menunggu"}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Status Validasi Output</Label>
                    <Badge
                      className={
                        viewingSubmission.isOutputValidated
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {viewingSubmission.isOutputValidated ? "Divalidasi" : "Belum"}
                    </Badge>
                  </div>
                </div>

                {/* Bukti Mengetahui */}
                {viewingSubmission.uploadedBuktiMengetahui && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Bukti Mengetahui</Label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {formatFileDisplay(viewingSubmission.uploadedBuktiMengetahui)}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Access Dialog */}
      <Dialog open={isEditAccessDialogOpen} onOpenChange={setIsEditAccessDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Edit className="h-5 w-5 mr-2 text-indigo-600" />
              Akses Edit Pengajuan
            </DialogTitle>
            <DialogDescription>Masukkan No Comtab dan PIN untuk mengedit pengajuan yang sudah ada.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="submissionId">No Comtab</Label>
              <Input
                id="submissionId"
                placeholder="Masukkan No Comtab"
                value={editAccessData.submissionId}
                onChange={(e) => setEditAccessData({ ...editAccessData, submissionId: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pin">PIN</Label>
              <Input
                id="pin"
                type="password"
                placeholder="Masukkan PIN"
                value={editAccessData.pin}
                onChange={(e) => setEditAccessData({ ...editAccessData, pin: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditAccessDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleEditAccess} disabled={!editAccessData.submissionId || !editAccessData.pin}>
              <Edit className="h-4 w-4 mr-2" />
              Akses Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast Message */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.5 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <div
              className={cn(
                "px-6 py-4 rounded-lg shadow-lg backdrop-blur-sm border",
                toastMessage.type === "success" && "bg-green-50/90 text-green-800 border-green-200",
                toastMessage.type === "error" && "bg-red-50/90 text-red-800 border-red-200",
                toastMessage.type === "info" && "bg-blue-50/90 text-blue-800 border-blue-200",
              )}
            >
              <div className="flex items-center space-x-2">
                {toastMessage.type === "success" && <CheckCircle className="h-5 w-5" />}
                {toastMessage.type === "error" && <XCircle className="h-5 w-5" />}
                {toastMessage.type === "info" && <Bell className="h-5 w-5" />}
                <span className="font-medium">{toastMessage.message}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

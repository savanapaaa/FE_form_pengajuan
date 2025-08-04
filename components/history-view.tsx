"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  FileText,
  Calendar,
  User,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  RefreshCw,
  ArrowLeft,
  Hash,
  Target,
  Activity,
  Layers,
  ChevronRight,
  Info,
} from "lucide-react"
import { cn, formatDate, getStatusBadge, getTayangStatusBadge } from "@/lib/utils"
import { ContentViewDialog } from "@/components/content-view-dialog"
import PreviewModal from "@/components/preview-modal"
import FileDisplayCard from "@/components/file-display-card"
import { useRouter } from "next/navigation"

// Define interfaces
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
  uploadedBuktiMengetahui?: FileData | string
  isConfirmed?: boolean
  tanggalKonfirmasi?: string
  isOutputValidated?: boolean
  tanggalValidasiOutput?: string
  contentItems?: ContentItem[]
}

interface HistoryViewProps {
  submissions: Submission[]
  onEdit: (submission: Submission) => void
}

const HistoryView: React.FC<HistoryViewProps> = ({ submissions, onEdit }) => {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [themeFilter, setThemeFilter] = useState<string>("all")
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [selectedContentItem, setSelectedContentItem] = useState<ContentItem | null>(null)
  const [isContentViewOpen, setIsContentViewOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState("")
  const [previewType, setPreviewType] = useState("")
  const [previewFileName, setPreviewFileName] = useState("")
  const [expandedSubmissions, setExpandedSubmissions] = useState<Set<number>>(new Set())

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((submission) => {
      const searchLower = searchTerm.toLowerCase()
      const searchMatches =
        searchTerm === "" ||
        submission.judul.toLowerCase().includes(searchLower) ||
        submission.noComtab.toLowerCase().includes(searchLower) ||
        submission.petugasPelaksana.toLowerCase().includes(searchLower) ||
        submission.tema.toLowerCase().includes(searchLower)

      const statusMatches = statusFilter === "all" || getSubmissionStatus(submission) === statusFilter
      const themeMatches = themeFilter === "all" || submission.tema.toLowerCase() === themeFilter.toLowerCase()

      return searchMatches && statusMatches && themeMatches
    })
  }, [submissions, searchTerm, statusFilter, themeFilter])

  const getSubmissionStatus = (submission: Submission): string => {
    if (submission.isOutputValidated) return "completed"
    if (submission.isConfirmed) return "confirmed"
    if (submission.contentItems?.every((item) => item.status === "approved" || item.status === "rejected"))
      return "reviewed"
    if (submission.contentItems?.some((item) => item.status === "pending")) return "pending"
    return "submitted"
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "reviewed":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "submitted":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = (status: string): string => {
    switch (status) {
      case "completed":
        return "Selesai"
      case "confirmed":
        return "Dikonfirmasi"
      case "reviewed":
        return "Direview"
      case "pending":
        return "Menunggu"
      case "submitted":
        return "Dikirim"
      default:
        return "Unknown"
    }
  }

  const handleOpenPreview = (url: string, type: string, fileName?: string) => {
    setPreviewUrl(url)
    setPreviewType(type)
    setPreviewFileName(fileName || "")
    setIsPreviewModalOpen(true)
  }

  const handleViewContent = (item: ContentItem, submission: Submission) => {
    setSelectedContentItem(item)
    setSelectedSubmission(submission)
    setIsContentViewOpen(true)
  }

  const toggleExpanded = (submissionId: number) => {
    setExpandedSubmissions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(submissionId)) {
        newSet.delete(submissionId)
      } else {
        newSet.add(submissionId)
      }
      return newSet
    })
  }

  const getContentTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "infografis":
        return "📊"
      case "video":
        return "🎬"
      case "audio":
        return "🎵"
      case "fotografis":
        return "📸"
      case "artikel":
      case "naskah-berita":
        return "📰"
      case "bumper":
        return "🎭"
      default:
        return "📄"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.push("/")} className="hover:bg-gray-50 bg-transparent">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Riwayat Pengajuan</h1>
            <p className="text-gray-600">Kelola dan pantau status pengajuan Anda</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari pengajuan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 focus:border-indigo-500 bg-white/70"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border-gray-200 focus:border-indigo-500 bg-white/70">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="submitted">Dikirim</SelectItem>
                <SelectItem value="pending">Menunggu Review</SelectItem>
                <SelectItem value="reviewed">Direview</SelectItem>
                <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
                <SelectItem value="completed">Selesai</SelectItem>
              </SelectContent>
            </Select>
            <Select value={themeFilter} onValueChange={setThemeFilter}>
              <SelectTrigger className="border-gray-200 focus:border-indigo-500 bg-white/70">
                <SelectValue placeholder="Filter tema" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tema</SelectItem>
                <SelectItem value="sosial">Sosial</SelectItem>
                <SelectItem value="ekonomi">Ekonomi</SelectItem>
                <SelectItem value="lingkungan">Lingkungan</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  setThemeFilter("all")
                }}
                className="hover:bg-gray-50 bg-transparent"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada pengajuan ditemukan</h3>
              <p className="text-gray-600">Coba ubah filter pencarian atau buat pengajuan baru</p>
            </CardContent>
          </Card>
        ) : (
          filteredSubmissions.map((submission) => {
            const isExpanded = expandedSubmissions.has(submission.id)
            const submissionStatus = getSubmissionStatus(submission)
            const statusColor = getStatusColor(submissionStatus)
            const statusText = getStatusText(submissionStatus)

            return (
              <Card
                key={submission.id}
                className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center space-x-3 flex-wrap gap-2">
                        <Badge className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border-indigo-200 font-semibold px-3 py-1">
                          <Hash className="h-3 w-3 mr-1" />
                          {submission.noComtab}
                        </Badge>
                        <Badge className={cn("font-semibold px-3 py-1", statusColor)}>
                          {submissionStatus === "completed" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {submissionStatus === "pending" && <Clock className="h-3 w-3 mr-1" />}
                          {submissionStatus === "confirmed" && <Activity className="h-3 w-3 mr-1" />}
                          {statusText}
                        </Badge>
                        <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 font-semibold px-3 py-1 capitalize">
                          <Target className="h-3 w-3 mr-1" />
                          {submission.tema}
                        </Badge>
                      </div>

                      <CardTitle className="text-xl font-bold text-gray-900">{submission.judul}</CardTitle>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2 p-2 bg-white/70 rounded-lg">
                          <User className="h-4 w-4 text-blue-500" />
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
                            <p className="font-medium text-gray-900">{submission.contentItems?.length || 0} item</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(submission)}
                        className="hover:bg-blue-50 hover:border-blue-200 bg-transparent"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(submission.id)}
                        className="hover:bg-gray-100"
                      >
                        <ChevronRight className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-90")} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="grid w-full grid-cols-4 bg-gray-100/50">
                        <TabsTrigger value="overview" className="text-xs">
                          <Info className="h-3 w-3 mr-1" />
                          Overview
                        </TabsTrigger>
                        <TabsTrigger value="content" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          Konten
                        </TabsTrigger>
                        <TabsTrigger value="files" className="text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          Files
                        </TabsTrigger>
                        <TabsTrigger value="timeline" className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          Timeline
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="space-y-4 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium text-gray-700">Supervisor</p>
                              <p className="text-gray-900">{submission.supervisor}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Durasi</p>
                              <p className="text-gray-900">{submission.durasi}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Jumlah Produksi</p>
                              <p className="text-gray-900">{submission.jumlahProduksi} item</p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium text-gray-700">Jenis Konten</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {submission.jenisKonten.map((jenis) => (
                                  <Badge key={jenis} variant="outline" className="text-xs capitalize">
                                    {getContentTypeIcon(jenis)} {jenis.replace("-", " ")}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Status Validasi</p>
                              <div className="space-y-1">
                                <p className="text-sm">Konfirmasi: {submission.isConfirmed ? "✅ Ya" : "❌ Belum"}</p>
                                <p className="text-sm">
                                  Output: {submission.isOutputValidated ? "✅ Divalidasi" : "❌ Belum"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="content" className="space-y-4 mt-4">
                        {submission.contentItems && submission.contentItems.length > 0 ? (
                          <div className="space-y-3">
                            {submission.contentItems.map((item, idx) => (
                              <div
                                key={item.id}
                                className="p-4 border border-gray-200 rounded-lg bg-white/50 hover:bg-white/80 transition-colors cursor-pointer"
                                onClick={() => handleViewContent(item, submission)}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <span className="text-lg">{getContentTypeIcon(item.jenisKonten)}</span>
                                      <h4 className="font-medium text-gray-900">
                                        {item.nama || `${item.jenisKonten.replace("-", " ")} ${idx + 1}`}
                                      </h4>
                                      {getStatusBadge(item.status)}
                                      {getTayangStatusBadge(item.isTayang)}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      <p>Jenis: {item.jenisKonten.replace("-", " ")}</p>
                                      <p>
                                        Timeline: {formatDate(item.tanggalOrderMasuk)} -{" "}
                                        {formatDate(item.tanggalTayang)}
                                      </p>
                                    </div>
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-gray-400" />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-600 text-center py-8">Tidak ada konten yang ditambahkan</p>
                        )}
                      </TabsContent>

                      <TabsContent value="files" className="space-y-4 mt-4">
                        <div className="space-y-4">
                          {/* Bukti Mengetahui */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Bukti Mengetahui</h4>
                            {submission.uploadedBuktiMengetahui ? (
                              <FileDisplayCard
                                fileData={submission.uploadedBuktiMengetahui}
                                label="bukti-mengetahui"
                                onOpenPreview={handleOpenPreview}
                              />
                            ) : (
                              <p className="text-gray-500 text-sm">Tidak ada file bukti mengetahui</p>
                            )}
                          </div>

                          {/* Content Files */}
                          {submission.contentItems && submission.contentItems.length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">File Konten</h4>
                              <div className="space-y-4">
                                {submission.contentItems.map((item, idx) => (
                                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-white/50">
                                    <h5 className="font-medium text-gray-800 mb-3">
                                      {item.nama || `${item.jenisKonten.replace("-", " ")} ${idx + 1}`}
                                    </h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {/* Show all available files for this content item */}
                                      {item.narasiFile && (
                                        <div>
                                          <p className="text-sm font-medium text-gray-600 mb-1">File Narasi</p>
                                          <FileDisplayCard
                                            fileData={item.narasiFile}
                                            label="narasi"
                                            onOpenPreview={handleOpenPreview}
                                          />
                                        </div>
                                      )}
                                      {item.suratFile && (
                                        <div>
                                          <p className="text-sm font-medium text-gray-600 mb-1">File Surat</p>
                                          <FileDisplayCard
                                            fileData={item.suratFile}
                                            label="surat"
                                            onOpenPreview={handleOpenPreview}
                                          />
                                        </div>
                                      )}
                                      {item.audioDubbingFile && (
                                        <div>
                                          <p className="text-sm font-medium text-gray-600 mb-1">Audio Dubbing</p>
                                          <FileDisplayCard
                                            fileData={item.audioDubbingFile}
                                            label="audio-dubbing"
                                            onOpenPreview={handleOpenPreview}
                                          />
                                        </div>
                                      )}
                                      {item.audioBacksoundFile && (
                                        <div>
                                          <p className="text-sm font-medium text-gray-600 mb-1">Audio Backsound</p>
                                          <FileDisplayCard
                                            fileData={item.audioBacksoundFile}
                                            label="audio-backsound"
                                            onOpenPreview={handleOpenPreview}
                                          />
                                        </div>
                                      )}
                                      {item.pendukungVideoFile && (
                                        <div>
                                          <p className="text-sm font-medium text-gray-600 mb-1">Video Pendukung</p>
                                          <FileDisplayCard
                                            fileData={item.pendukungVideoFile}
                                            label="video-pendukung"
                                            onOpenPreview={handleOpenPreview}
                                          />
                                        </div>
                                      )}
                                      {item.pendukungFotoFile && (
                                        <div>
                                          <p className="text-sm font-medium text-gray-600 mb-1">Foto Pendukung</p>
                                          <FileDisplayCard
                                            fileData={item.pendukungFotoFile}
                                            label="foto-pendukung"
                                            onOpenPreview={handleOpenPreview}
                                          />
                                        </div>
                                      )}
                                      {item.hasilProdukFile && (
                                        <div>
                                          <p className="text-sm font-medium text-gray-600 mb-1">Hasil Produk</p>
                                          <FileDisplayCard
                                            fileData={item.hasilProdukFile}
                                            label="hasil-produk"
                                            onOpenPreview={handleOpenPreview}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="timeline" className="space-y-4 mt-4">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-medium text-blue-900">Tanggal Submit</p>
                              <p className="text-sm text-blue-700">{formatDate(submission.tanggalSubmit)}</p>
                            </div>
                          </div>
                          {submission.tanggalKonfirmasi && (
                            <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <div>
                                <p className="font-medium text-green-900">Tanggal Konfirmasi</p>
                                <p className="text-sm text-green-700">{submission.tanggalKonfirmasi}</p>
                              </div>
                            </div>
                          )}
                          {submission.tanggalValidasiOutput && (
                            <div className="flex items-center space-x-4 p-3 bg-purple-50 rounded-lg">
                              <Activity className="h-5 w-5 text-purple-600" />
                              <div>
                                <p className="font-medium text-purple-900">Tanggal Validasi Output</p>
                                <p className="text-sm text-purple-700">{submission.tanggalValidasiOutput}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                )}
              </Card>
            )
          })
        )}
      </div>

      {/* Content View Dialog */}
      <ContentViewDialog
        isOpen={isContentViewOpen}
        onOpenChange={setIsContentViewOpen}
        contentItem={selectedContentItem}
        parentSubmission={selectedSubmission}
        onOpenPreview={handleOpenPreview}
        getContentTypeIcon={getContentTypeIcon}
        getStatusBadge={getStatusBadge}
        getTayangStatusBadge={getTayangStatusBadge}
      />

      {/* Preview Modal */}
      <PreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        url={previewUrl}
        type={previewType}
        fileName={previewFileName}
      />
    </div>
  )
}

export default HistoryView

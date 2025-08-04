"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Search,
  Filter,
  Calendar,
  User,
  FileText,
  Eye,
  Download,
  RefreshCw,
  ChevronDown,
  X,
  Settings,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Tv,
  MoreVertical,
  SlidersHorizontal,
  TrendingUp,
} from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { RekapDetailDialog } from "./rekap-detail-dialog"

interface RekapDataProps {
  submissions?: Submission[]
  onRefresh?: () => void
}

interface FilterState {
  search: string
  status: string
  period: string
  petugas: string
  jenisMedia: string
}

interface Submission {
  id: number
  noComtab: string
  pin: string
  judul: string
  tema?: string
  jenisMedia: string
  tanggalOrder: Date | string | undefined
  petugasPelaksana: string
  supervisor: string
  jumlahProduksi: string
  tanggalSubmit: Date | string | undefined
  lastModified?: Date | string | undefined
  uploadedBuktiMengetahui?: FileData | string
  isOutputValidated?: boolean
  tanggalValidasiOutput?: Date | string | undefined
  contentItems?: ContentItem[]
  dokumenPendukung?: (FileData | string)[]
  suratPermohonan?: FileData | string
  proposalKegiatan?: FileData | string
  tanggalReview?: string
  workflowStage?: string
  jenisKonten?: string[]
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
}

interface FileData {
  name: string
  size: number
  type: string
  lastModified: number
  base64?: string
  url?: string
}

const statusOptions = [
  { value: "all", label: "Semua Status", color: "bg-gray-500", count: 0 },
  { value: "submitted", label: "Diajukan", color: "bg-blue-500", count: 0 },
  { value: "review", label: "Review", color: "bg-yellow-500", count: 0 },
  { value: "validation", label: "Validasi", color: "bg-purple-500", count: 0 },
  { value: "completed", label: "Selesai", color: "bg-green-500", count: 0 },
]

const periodOptions = [
  { value: "all", label: "Semua Periode" },
  { value: "today", label: "Hari Ini" },
  { value: "7days", label: "7 Hari Terakhir" },
  { value: "30days", label: "30 Hari Terakhir" },
  { value: "3months", label: "3 Bulan Terakhir" },
]

export function RekapData({ submissions = [], onRefresh }: RekapDataProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    period: "all",
    petugas: "all",
    jenisMedia: "all",
  })

  // Get unique values for filter options
  const uniquePetugas = useMemo(() => {
    if (!submissions || submissions.length === 0) return []
    const petugasList = [...new Set(submissions.map((sub) => sub.petugasPelaksana).filter(Boolean))]
    return petugasList
  }, [submissions])

  const uniqueJenisMedia = useMemo(() => {
    if (!submissions || submissions.length === 0) return []
    const mediaList = [...new Set(submissions.flatMap((sub) => sub.jenisKonten || []))]
    return mediaList
  }, [submissions])

  // Filter submissions based on current filters
  const filteredSubmissions = useMemo(() => {
    if (!submissions || submissions.length === 0) return []

    return submissions.filter((submission) => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const matchesSearch =
          submission.tema?.toLowerCase().includes(searchTerm) ||
          submission.judul?.toLowerCase().includes(searchTerm) ||
          submission.noComtab?.toLowerCase().includes(searchTerm) ||
          submission.petugasPelaksana?.toLowerCase().includes(searchTerm)

        if (!matchesSearch) return false
      }

      // Status filter
      if (filters.status !== "all" && submission.workflowStage !== filters.status) {
        return false
      }

      // Period filter
      if (filters.period !== "all" && submission.tanggalSubmit) {
        const submissionDate = new Date(submission.tanggalSubmit)
        const now = new Date()
        const diffTime = now.getTime() - submissionDate.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        switch (filters.period) {
          case "today":
            if (diffDays > 1) return false
            break
          case "7days":
            if (diffDays > 7) return false
            break
          case "30days":
            if (diffDays > 30) return false
            break
          case "3months":
            if (diffDays > 90) return false
            break
        }
      }

      // Petugas filter
      if (filters.petugas !== "all" && submission.petugasPelaksana !== filters.petugas) {
        return false
      }

      // Jenis Media filter
      if (filters.jenisMedia !== "all") {
        const hasMedia = submission.jenisKonten?.includes(filters.jenisMedia)
        if (!hasMedia) return false
      }

      return true
    })
  }, [submissions, filters])

  // Update status counts
  const statusCounts = useMemo(() => {
    const counts = statusOptions.map((option) => ({
      ...option,
      count:
        option.value === "all"
          ? filteredSubmissions.length
          : filteredSubmissions.filter((sub) => sub.workflowStage === option.value).length,
    }))
    return counts
  }, [filteredSubmissions])

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.search) count++
    if (filters.status !== "all") count++
    if (filters.period !== "all") count++
    if (filters.petugas !== "all") count++
    if (filters.jenisMedia !== "all") count++
    return count
  }, [filters])

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearAllFilters = () => {
    setFilters({
      search: "",
      status: "all",
      period: "all",
      petugas: "all",
      jenisMedia: "all",
    })
  }

  const clearFilter = (key: keyof FilterState) => {
    setFilters((prev) => ({ ...prev, [key]: key === "search" ? "" : "all" }))
  }

  const handleViewDetail = (submission: Submission) => {
    setSelectedSubmission(submission)
    setIsDetailOpen(true)
  }

  const getStatusBadge = (stage: string) => {
    const statusConfig = {
      submitted: { label: "Diajukan", color: "bg-blue-100 text-blue-800 border-blue-200" },
      review: { label: "Review", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      validation: { label: "Validasi", color: "bg-purple-100 text-purple-800 border-purple-200" },
      completed: { label: "Selesai", color: "bg-green-100 text-green-800 border-green-200" },
    }

    const config = statusConfig[stage as keyof typeof statusConfig] || statusConfig.submitted
    return <Badge className={cn("text-xs font-medium border", config.color)}>{config.label}</Badge>
  }

  const getStatusIcon = (stage: string) => {
    switch (stage) {
      case "submitted":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "review":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "validation":
        return <CheckCircle className="h-4 w-4 text-purple-500" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Filter Section */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative">
        <Card className="bg-gradient-to-r from-white via-blue-50/30 to-indigo-50/30 border-white/50 shadow-xl backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <SlidersHorizontal className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">Filter & Pencarian</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Temukan data pengajuan dengan mudah</p>
                </div>
              </div>

              {/* Active Filter Count */}
              {activeFilterCount > 0 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center space-x-2">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">{activeFilterCount} Filter Aktif</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Hapus Semua
                  </Button>
                </motion.div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Cari berdasarkan tema, judul, No Comtab, atau petugas..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-12 pr-12 h-12 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl text-sm"
              />
              {filters.search && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter("search")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Status
                </label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                  <SelectTrigger className="h-11 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-500 rounded-lg">
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-xl border-white/50 shadow-2xl">
                    {statusCounts.map((status) => (
                      <SelectItem key={status.value} value={status.value} className="hover:bg-blue-50">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-2">
                            <div className={cn("w-2 h-2 rounded-full", status.color)}></div>
                            <span>{status.label}</span>
                          </div>
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {status.count}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Period Filter */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-green-500" />
                  Periode
                </label>
                <Select value={filters.period} onValueChange={(value) => handleFilterChange("period", value)}>
                  <SelectTrigger className="h-11 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-green-500 rounded-lg">
                    <SelectValue placeholder="Pilih Periode" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-xl border-white/50 shadow-2xl">
                    {periodOptions.map((period) => (
                      <SelectItem key={period.value} value={period.value} className="hover:bg-green-50">
                        {period.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center">
                  <Settings className="w-4 h-4 mr-2 text-purple-500" />
                  Aksi Cepat
                </label>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={onRefresh}
                    className="flex-1 h-11 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-purple-50 hover:border-purple-300 rounded-lg"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-11 px-3 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gray-50 rounded-lg"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-white/95 backdrop-blur-xl border-white/50 shadow-2xl"
                    >
                      <DropdownMenuItem className="hover:bg-blue-50">
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-green-50">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Lihat Statistik
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Advanced Filters Toggle */}
            <Collapsible open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between h-12 bg-gradient-to-r from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 border border-gray-200 rounded-xl"
                >
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-gray-700">Filter Lanjutan</span>
                    {(filters.petugas !== "all" || filters.jenisMedia !== "all") && (
                      <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
                        {(filters.petugas !== "all" ? 1 : 0) + (filters.jenisMedia !== "all" ? 1 : 0)} Aktif
                      </Badge>
                    )}
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-gray-600 transition-transform duration-200",
                      showAdvancedFilters && "rotate-180",
                    )}
                  />
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="space-y-4 pt-4">
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gradient-to-r from-orange-50/50 to-amber-50/50 rounded-xl border border-orange-100/50"
                >
                  {/* Petugas Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center">
                      <Users className="w-4 h-4 mr-2 text-orange-500" />
                      Petugas Pelaksana
                    </label>
                    <Select value={filters.petugas} onValueChange={(value) => handleFilterChange("petugas", value)}>
                      <SelectTrigger className="h-11 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-orange-500 rounded-lg">
                        <SelectValue placeholder="Pilih Petugas" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur-xl border-white/50 shadow-2xl">
                        <SelectItem value="all" className="hover:bg-orange-50">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                              All
                            </div>
                            <span>Semua Petugas</span>
                          </div>
                        </SelectItem>
                        {uniquePetugas.map((petugas) => (
                          <SelectItem key={petugas} value={petugas} className="hover:bg-orange-50">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full flex items-center justify-center text-xs font-medium text-white">
                                {petugas.charAt(0).toUpperCase()}
                              </div>
                              <span>{petugas}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Jenis Media Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center">
                      <Tv className="w-4 h-4 mr-2 text-amber-500" />
                      Jenis Konten
                    </label>
                    <Select
                      value={filters.jenisMedia}
                      onValueChange={(value) => handleFilterChange("jenisMedia", value)}
                    >
                      <SelectTrigger className="h-11 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-amber-500 rounded-lg">
                        <SelectValue placeholder="Pilih Jenis Konten" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur-xl border-white/50 shadow-2xl">
                        <SelectItem value="all" className="hover:bg-amber-50">
                          Semua Jenis Konten
                        </SelectItem>
                        {uniqueJenisMedia.map((jenis) => (
                          <SelectItem key={jenis} value={jenis} className="hover:bg-amber-50">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                              <span className="capitalize">{jenis.replace("-", " ")}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              </CollapsibleContent>
            </Collapsible>

            {/* Filter Summary */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl border border-blue-100/50">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {filteredSubmissions.length} dari {submissions.length} pengajuan
                    </p>
                    <p className="text-xs text-gray-600">Hasil pencarian dan filter</p>
                  </div>
                </div>
              </div>

              {/* Active Filter Tags */}
              {activeFilterCount > 0 && (
                <div className="flex items-center space-x-2 flex-wrap">
                  {filters.search && (
                    <Badge className="bg-white/80 text-gray-700 border-gray-200 text-xs">
                      Pencarian: "{filters.search}"
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => clearFilter("search")}
                        className="ml-1 h-4 w-4 p-0 hover:bg-gray-200"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  {filters.status !== "all" && (
                    <Badge className="bg-white/80 text-gray-700 border-gray-200 text-xs">
                      Status: {statusOptions.find((s) => s.value === filters.status)?.label}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => clearFilter("status")}
                        className="ml-1 h-4 w-4 p-0 hover:bg-gray-200"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  {filters.period !== "all" && (
                    <Badge className="bg-white/80 text-gray-700 border-gray-200 text-xs">
                      Periode: {periodOptions.find((p) => p.value === filters.period)?.label}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => clearFilter("period")}
                        className="ml-1 h-4 w-4 p-0 hover:bg-gray-200"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results Section */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada data ditemukan</h3>
            <p className="text-gray-600 mb-4">
              {activeFilterCount > 0
                ? "Coba ubah filter atau kata kunci pencarian Anda"
                : "Belum ada pengajuan yang tersedia"}
            </p>
            {activeFilterCount > 0 && (
              <Button onClick={clearAllFilters} className="bg-blue-600 hover:bg-blue-700">
                Hapus Semua Filter
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {filteredSubmissions.map((submission, index) => (
              <motion.div
                key={submission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(submission.workflowStage || "submitted")}
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">{submission.judul}</h3>
                            <p className="text-sm text-gray-600">{submission.tema}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">No Comtab:</span>
                            <span className="font-medium">{submission.noComtab}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">Tanggal:</span>
                            <span className="font-medium">
                              {submission.tanggalSubmit
                                ? format(new Date(submission.tanggalSubmit), "dd MMM yyyy", { locale: id })
                                : "-"}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">Petugas:</span>
                            <span className="font-medium">{submission.petugasPelaksana}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {getStatusBadge(submission.workflowStage || "submitted")}
                          {submission.jenisKonten && submission.jenisKonten.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {submission.jenisKonten.length} Jenis Konten
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetail(submission)}
                          className="bg-white/80 backdrop-blur-sm hover:bg-blue-50 hover:border-blue-300"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Detail
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      {selectedSubmission && (
        <RekapDetailDialog
          isOpen={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          submission={selectedSubmission}
          onToast={(message, type) => {
            // Handle toast notifications
            console.log(`${type}: ${message}`)
          }}
        />
      )}
    </div>
  )
}

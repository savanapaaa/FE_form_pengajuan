"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Activity,
  Eye,
  Search,
  Filter,
  BarChart3,
  CalendarDays,
  Globe,
  X,
  TrendingUp,
  TrendingDown,
  Users,
  RefreshCw,
  MoreVertical,
  FileSpreadsheet,
  FileDown,
  ArrowLeft,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { RekapDetailDialog } from "./rekap-detail-dialog"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Separator } from "@/components/ui/separator"

interface MobileRekapViewProps {
  data: any[]
  searchTerm: string
  setSearchTerm: (term: string) => void
  statusFilter: string
  setStatusFilter: (status: string) => void
  priorityFilter: string
  setPriorityFilter: (priority: string) => void
  onViewDetail: (document: any) => void
  onExportCSV: () => void
  onExportExcel: () => void
  totalDocuments: number
  publishedCount: number
  inReviewCount: number
  approvedCount: number
  selectedDocument: any
  isDetailOpen: boolean
  setIsDetailOpen: (open: boolean) => void
}

// Helper function to get workflow stage badge
const getWorkflowStageBadge = (stage: string) => {
  switch (stage) {
    case "Draft":
      return (
        <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-xs">
          <FileText className="h-3 w-3 mr-1" />
          Draft
        </Badge>
      )
    case "In Review":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
          <Eye className="h-3 w-3 mr-1" />
          Review
        </Badge>
      )
    case "Approved":
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
          <CheckCircle className="h-3 w-3 mr-1" />
          Approved
        </Badge>
      )
    case "Published":
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
          <Globe className="h-3 w-3 mr-1" />
          Published
        </Badge>
      )
    case "Rejected":
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
          <XCircle className="h-3 w-3 mr-1" />
          Rejected
        </Badge>
      )
    default:
      return (
        <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-xs">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Unknown
        </Badge>
      )
  }
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

function MobileRekapView({
  data,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  onViewDetail,
  onExportCSV,
  onExportExcel,
  totalDocuments,
  publishedCount,
  inReviewCount,
  approvedCount,
  selectedDocument,
  isDetailOpen,
  setIsDetailOpen,
}: MobileRekapViewProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [showStats, setShowStats] = useState(true)
  const router = useRouter()

  const showToast = (message: string, type: "success" | "error" | "info") => {
    console.log(`${type.toUpperCase()}: ${message}`)
  }

  const statisticsCards = [
    {
      title: "Total",
      value: totalDocuments,
      icon: FileText,
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
      change: "+12%",
      trend: "up",
    },
    {
      title: "Review",
      value: inReviewCount,
      icon: Eye,
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-purple-100",
      change: "+8%",
      trend: "up",
    },
    {
      title: "Approved",
      value: approvedCount,
      icon: CheckCircle,
      color: "from-yellow-500 to-yellow-600",
      bgColor: "from-yellow-50 to-yellow-100",
      change: "-5%",
      trend: "down",
    },
    {
      title: "Published",
      value: publishedCount,
      icon: Globe,
      color: "from-green-500 to-green-600",
      bgColor: "from-green-50 to-green-100",
      change: "+15%",
      trend: "up",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-green-50">
      {/* Mobile Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-2 sm:space-x-4 flex-1"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard/admin")}
                className="text-green-600 hover:text-green-700 hover:bg-green-100 p-1 sm:p-2"
              >
                <ArrowLeft className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Kembali</span>
              </Button>
              <Separator orientation="vertical" className="h-4 sm:h-6 bg-green-300 hidden sm:block" />
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg"
              >
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </motion.div>
              <div className="flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-green-900">Rekap Data</h1>
                <p className="text-xs sm:text-sm text-green-600 hidden sm:block">Lihat ringkasan dan laporan data</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center space-x-2"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStats(!showStats)}
                className="border-green-200 text-green-600 hover:bg-green-50 p-1 sm:p-2"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>

              {/* Dropdown Menu for Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-200 text-green-600 hover:bg-green-50 p-1 sm:p-2 bg-transparent"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => window.location.reload()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Data
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onExportCSV}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Export CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onExportExcel}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <div className="space-y-4 pb-20">
        {/* Mobile Statistics - Collapsible */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 space-y-4 pt-4"
            >
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Activity className="h-4 w-4 mr-2" />
                  Status Dokumen
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {statisticsCards.map((card, index) => {
                    const Icon = card.icon
                    return (
                      <motion.div
                        key={card.title}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Card className={cn("bg-gradient-to-br border-0 shadow-md", card.bgColor)}>
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div
                                className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r",
                                  card.color,
                                )}
                              >
                                <Icon className="h-4 w-4 text-white" />
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-bold text-gray-800">{card.value}</p>
                                <div className="flex items-center space-x-1">
                                  {card.trend === "up" ? (
                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <TrendingDown className="h-3 w-3 text-red-500" />
                                  )}
                                  <span
                                    className={cn(
                                      "text-xs font-semibold",
                                      card.trend === "up" ? "text-green-600" : "text-red-600",
                                    )}
                                  >
                                    {card.change}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="text-xs font-semibold text-gray-700">{card.title}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Search */}
        <div className="px-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari berdasarkan No. Dokumen, pengaju..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-12 bg-white border-gray-200 focus:border-green-500"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 p-2"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Filters - Collapsible */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 space-y-3"
            >
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="p-4 space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="In Review">In Review</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Published">Published</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Prioritas</label>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Pilih prioritas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Prioritas</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                    className="w-full border-gray-300"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Tutup Filter
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Count */}
        <div className="px-4">
          <p className="text-sm text-gray-600">Menampilkan {data.length} dokumen</p>
        </div>

        {/* Mobile Documents List */}
        <div className="px-4 space-y-3">
          <AnimatePresence>
            {data.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-12"
              >
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardContent className="p-8">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada dokumen</h3>
                    <p className="text-gray-600">Tidak ada dokumen yang sesuai dengan filter atau pencarian.</p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              data.map((document, index) => (
                <motion.div
                  key={document.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <CardTitle className="text-base font-bold text-gray-900 truncate">
                              {document.docNumber}
                            </CardTitle>
                            {getWorkflowStageBadge(document.status)}
                          </div>
                          <p className="text-sm text-gray-700 line-clamp-2 mb-2">Dokumen {document.category}</p>
                          <div className="flex items-center space-x-3 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Users className="h-3 w-3" />
                              <span className="truncate max-w-20">{document.submitter}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <CalendarDays className="h-3 w-3" />
                              <span>{formatDate(document.submissionDate)}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewDetail(document)}
                          className="border-green-300 text-green-700 hover:bg-green-50 ml-2 flex-shrink-0"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      {/* Content Summary */}
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <p className="text-xs font-semibold text-gray-900">{document.totalContent}</p>
                          <p className="text-xs text-gray-600">Total</p>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <p className="text-xs font-semibold text-green-900">{document.approvedContent}</p>
                          <p className="text-xs text-green-600">Disetujui</p>
                        </div>
                        <div className="text-center p-2 bg-red-50 rounded">
                          <p className="text-xs font-semibold text-red-900">{document.rejectedContent}</p>
                          <p className="text-xs text-red-600">Ditolak</p>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <p className="text-xs font-semibold text-blue-900">{document.publishedContent}</p>
                          <p className="text-xs text-blue-600">Tayang</p>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex flex-wrap gap-1">
                        <Badge
                          className={`text-xs ${document.priority === "High" ? "bg-red-100 text-red-800 border-red-200" : document.priority === "Medium" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : "bg-green-100 text-green-800 border-green-200"}`}
                        >
                          {document.priority} Priority
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">{document.category}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Detail Dialog */}
        <RekapDetailDialog document={selectedDocument} isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} />
      </div>
    </div>
  )
}

export default MobileRekapView
export { MobileRekapView }

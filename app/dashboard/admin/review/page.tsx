"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  FileText,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  Search,
  RefreshCw,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import ContentReviewDialog from "@/components/content-review-dialog"
import { useToast } from "@/hooks/use-toast"

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
  status?: "pending" | "approved" | "rejected"
  tanggalDiproses?: string
  catatan?: string
  alasanPenolakan?: string
  diprosesoleh?: string
}

interface Submission {
  id: number
  noComtab: string
  tema: string
  judul: string
  tanggalSubmit: Date | undefined
  isConfirmed?: boolean
  contentItems?: ContentItem[]
  buktiMengetahui?: FileData | string
  dokumenPendukung?: (FileData | string)[]
  workflowStage?: "submitted" | "review" | "validation" | "completed"
  lastModified?: Date
  tanggalReview?: string // Add review date tracking
}

// Helper function to determine workflow stage
const getWorkflowStage = (submission: Submission) => {
  if (!submission.isConfirmed) return "submitted"

  const contentItems = submission.contentItems || []
  if (contentItems.length === 0) return "review"

  const allReviewed = contentItems.every(
    (item: ContentItem) => item.status === "approved" || item.status === "rejected",
  )
  if (!allReviewed) return "review"

  const hasApprovedItems = contentItems.some((item: ContentItem) => item.status === "approved")
  if (!hasApprovedItems) return "completed"

  const approvedItems = contentItems.filter((item: ContentItem) => item.status === "approved")
  const allValidated = approvedItems.every((item: any) => item.isTayang !== undefined)

  if (!allValidated) return "validation"
  return "completed"
}

export default function ReviewPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")

  const router = useRouter()

  // Load submissions from localStorage - only those that need review
  useEffect(() => {
    const loadSubmissions = () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("submissions")
        if (stored) {
          const parsedSubmissions = JSON.parse(stored)

          // Filter submissions that need review:
          // 1. Must be confirmed
          // 2. Must have content items that are pending review
          const reviewSubmissions = parsedSubmissions.filter((sub: Submission) => {
            if (!sub.isConfirmed) return false

            const contentItems = sub.contentItems || []
            if (contentItems.length === 0) return false

            // Check if any content items are still pending review
            const hasPendingItems = contentItems.some((item: ContentItem) => !item.status || item.status === "pending")

            return hasPendingItems
          })

          setSubmissions(reviewSubmissions)
        }
      }
      setIsLoading(false)
    }

    setTimeout(() => loadSubmissions(), 800) // Simulate loading
  }, [])

  // Filter submissions based on status and search
  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch =
      submission.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.noComtab.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.tema.toLowerCase().includes(searchTerm.toLowerCase())

    if (filterStatus === "all") return matchesSearch

    const contentItems = submission.contentItems || []
    const hasStatus = contentItems.some((item) => item.status === filterStatus)
    const hasPending = contentItems.some((item) => !item.status || item.status === "pending")

    if (filterStatus === "pending") {
      return matchesSearch && hasPending
    }

    return matchesSearch && hasStatus
  })

  // Calculate statistics
  const totalSubmissions = submissions.length
  const pendingReview = submissions.filter((sub) => {
    const contentItems = sub.contentItems || []
    return contentItems.some((item) => !item.status || item.status === "pending")
  }).length

  const handleReviewSubmission = (submission: Submission) => {
    setSelectedSubmission(submission)
    setIsDialogOpen(true)
  }

  // Called by ContentReviewDialog when the review is finished
  const handleUpdate = (updatedSubmissions: Submission[]) => {
    // Update workflow stages and add review timestamp for all submissions
    const submissionsWithStages = updatedSubmissions.map((sub) => {
      const workflowStage = getWorkflowStage(sub)

      // Add review timestamp if all content items have been reviewed
      const contentItems = sub.contentItems || []
      const allReviewed = contentItems.every(
        (item: ContentItem) => item.status === "approved" || item.status === "rejected",
      )

      const updatedSub = {
        ...sub,
        workflowStage,
        // Add review timestamp if this submission was just fully reviewed
        tanggalReview: allReviewed && !sub.tanggalReview ? new Date().toISOString() : sub.tanggalReview,
      }

      return updatedSub
    })

    // Persist to localStorage
    localStorage.setItem("submissions", JSON.stringify(submissionsWithStages))

    // Filter only submissions that still need review
    const reviewSubmissions = submissionsWithStages.filter((sub: Submission) => {
      if (!sub.isConfirmed) return false

      const contentItems = sub.contentItems || []
      if (contentItems.length === 0) return false

      // Check if any content items are still pending review
      const hasPendingItems = contentItems.some((item: ContentItem) => !item.status || item.status === "pending")

      return hasPendingItems
    })

    setSubmissions(reviewSubmissions)

    // Show success message
    toast({
      title: "Review berhasil disimpan",
      description: "Dokumen yang sudah direview akan pindah ke tahap berikutnya",
      variant: "default",
    })
  }

  // Keep dialog & selection in-sync
  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) setSelectedSubmission(null)
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Disetujui</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Ditolak</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
    }
  }

  const getSubmissionStatus = (submission: Submission) => {
    const contentItems = submission.contentItems || []
    const hasPending = contentItems.some((item) => !item.status || item.status === "pending")
    const hasApproved = contentItems.some((item) => item.status === "approved")
    const hasRejected = contentItems.some((item) => item.status === "rejected")

    if (hasPending) return "pending"
    if (hasApproved && !hasRejected) return "approved"
    if (hasRejected) return "rejected"
    return "pending"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 flex items-center justify-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-blue-700">Memuat Data Review...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50">
      {/* Header */}
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
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 p-1 sm:p-2"
              >
                <ArrowLeft className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Kembali</span>
              </Button>
              <Separator orientation="vertical" className="h-4 sm:h-6 bg-blue-300 hidden sm:block" />
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg"
              >
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </motion.div>
              <div className="flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-blue-900">Review Dokumen</h1>
                <p className="text-xs sm:text-sm text-blue-600 hidden sm:block">Kelola dan review dokumen yang masuk</p>
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
                onClick={() => window.location.reload()}
                className="border-blue-200 text-blue-600 hover:bg-blue-50 p-1 sm:p-2"
              >
                <RefreshCw className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4 sm:space-y-6">
        {/* Statistics Cards */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Dokumen Perlu Review</p>
                  <motion.p
                    key={totalSubmissions}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl font-bold text-blue-900"
                  >
                    {totalSubmissions}
                  </motion.p>
                </div>
                <motion.div
                  whileHover={{ rotate: 15 }}
                  className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg"
                >
                  <FileText className="h-6 w-6 text-white" />
                </motion.div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Konten Pending</p>
                  <motion.p
                    key={pendingReview}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl font-bold text-orange-900"
                  >
                    {submissions.reduce((total, sub) => {
                      const pendingItems =
                        sub.contentItems?.filter((item) => !item.status || item.status === "pending") || []
                      return total + pendingItems.length
                    }, 0)}
                  </motion.p>
                </div>
                <motion.div
                  whileHover={{ rotate: 15 }}
                  className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg"
                >
                  <Clock className="h-6 w-6 text-white" />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search Card */}
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-5 w-5" />
                <Input
                  placeholder="Cari berdasarkan No. Comtab, tema, atau judul..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-blue-200 focus:ring-blue-500 focus:border-blue-500 bg-white/80"
                />
              </div>
              <p className="text-sm text-blue-600 mt-2">
                Menampilkan {filteredSubmissions.length} dari {totalSubmissions} dokumen
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Submissions List */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <AnimatePresence>
            {filteredSubmissions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-12"
              >
                <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg">
                  <CardContent className="p-8">
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      {searchTerm || filterStatus !== "all"
                        ? "Tidak ada dokumen yang sesuai"
                        : "Semua dokumen sudah direview!"}
                    </h3>
                    <p className="text-blue-600">
                      {searchTerm || filterStatus !== "all"
                        ? "Tidak ada dokumen yang sesuai dengan filter atau pencarian."
                        : "Tidak ada dokumen yang perlu direview saat ini. Dokumen yang sudah direview akan otomatis pindah ke tahap validasi."}
                    </p>
                    {!searchTerm && filterStatus === "all" && (
                      <div className="mt-4">
                        <Button
                          onClick={() => router.push("/dashboard/admin")}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                        >
                          Kembali ke Dashboard
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              filteredSubmissions.map((submission, index) => {
                const submissionStatus = getSubmissionStatus(submission)
                const contentItems = submission.contentItems || []
                const pendingCount = contentItems.filter((item) => !item.status || item.status === "pending").length

                return (
                  <motion.div
                    key={submission.id}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="group"
                  >
                    <Card className="bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200 p-3 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between space-y-2 sm:space-y-0">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <CardTitle className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-blue-800 transition-colors">
                                {submission.judul}
                              </CardTitle>
                              {getStatusBadge(submissionStatus)}
                              {pendingCount > 0 && (
                                <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
                                  {pendingCount} Pending Review
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span>{submission.noComtab}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span>{submission.tema}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span>
                                  {submission.tanggalSubmit
                                    ? new Date(submission.tanggalSubmit).toLocaleDateString("id-ID")
                                    : "Tidak diketahui"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <Button
                            onClick={() => handleReviewSubmission(submission)}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2"
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                            Review
                          </Button>
                        </div>
                      </CardHeader>

                      <CardContent className="p-3 sm:p-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Konten Items:</h4>
                            <div className="grid gap-2 sm:gap-3">
                              {contentItems.map((item, itemIndex) => (
                                <div
                                  key={itemIndex}
                                  className="flex items-center justify-between p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200"
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                    <div>
                                      <p className="font-medium text-blue-900">{item.nama}</p>
                                      <p className="text-sm text-blue-600">{item.jenisKonten}</p>
                                    </div>
                                  </div>
                                  {getStatusBadge(item.status)}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Action Summary */}
                          <div className="flex flex-wrap items-center gap-2 sm:space-x-2 text-xs text-gray-600">
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>{contentItems.filter((item) => item.status === "approved").length} Disetujui</span>
                            <XCircle className="h-3 w-3 sm:h-4 sm:w-4 ml-4" />
                            <span>{contentItems.filter((item) => item.status === "rejected").length} Ditolak</span>
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 ml-4" />
                            <span>{pendingCount} Pending</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            {submission.buktiMengetahui && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Bukti
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Review Dialog */}
      {selectedSubmission && (
        <ContentReviewDialog
          isOpen={isDialogOpen}
          onOpenChange={handleDialogOpenChange}
          submission={selectedSubmission}
          onUpdate={handleUpdate}
          onToast={(message, type) => toast({ title: message, variant: type === "error" ? "destructive" : "default" })}
        />
      )}
    </div>
  )
}

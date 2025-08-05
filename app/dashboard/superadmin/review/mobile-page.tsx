"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  Search,
  RefreshCw,
  TrendingUp,
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
  tanggalReview?: string
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

export default function MobileReviewPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showStats, setShowStats] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Load submissions from localStorage - only those that need review
  useEffect(() => {
    const loadSubmissions = () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("submissions")
        if (stored) {
          const parsedSubmissions = JSON.parse(stored)

          // Filter submissions that need review
          const reviewSubmissions = parsedSubmissions.filter((sub: Submission) => {
            if (!sub.isConfirmed) return false

            const contentItems = sub.contentItems || []
            if (contentItems.length === 0) return false

            const hasPendingItems = contentItems.some((item: ContentItem) => !item.status || item.status === "pending")
            return hasPendingItems
          })

          setSubmissions(reviewSubmissions)
        }
      }
      setIsLoading(false)
    }

    setTimeout(() => loadSubmissions(), 800)
  }, [])

  // Filter submissions based on search
  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch =
      submission.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.noComtab.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.tema.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
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

      const contentItems = sub.contentItems || []
      const allReviewed = contentItems.every(
        (item: ContentItem) => item.status === "approved" || item.status === "rejected",
      )

      const updatedSub = {
        ...sub,
        workflowStage,
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

      const hasPendingItems = contentItems.some((item: ContentItem) => !item.status || item.status === "pending")
      return hasPendingItems
    })

    setSubmissions(reviewSubmissions)

    toast({
      title: "Review berhasil disimpan",
      description: "Dokumen yang sudah direview akan pindah ke tahap berikutnya",
      variant: "default",
    })
  }

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) setSelectedSubmission(null)
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Disetujui</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">Ditolak</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">Pending</Badge>
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
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-base font-semibold text-blue-700">Memuat Data Review...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50">
      {/* Mobile Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm sticky top-0 z-50"
      >
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-3"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard/superadmin")}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg"
              >
                <FileText className="h-4 w-4 text-white" />
              </motion.div>
              <div>
                <h1 className="text-lg font-bold text-blue-900">Review Dokumen</h1>
                <p className="text-xs text-blue-600">Kelola dan review dokumen</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center space-x-2"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStats(!showStats)}
                className="text-blue-600 hover:bg-blue-50 p-2"
              >
                <TrendingUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.reload()}
                className="text-blue-600 hover:bg-blue-50 p-2"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
            <Input
              placeholder="Cari dokumen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-blue-200 focus:ring-blue-500 focus:border-blue-500 bg-white/80 text-sm"
            />
          </div>
        </div>
      </motion.header>

      {/* Statistics - Collapsible */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 bg-white/50">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-white border-blue-200 shadow-sm rounded-xl overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-600 mb-1">Dokumen Perlu Review</p>
                        <motion.p
                          key={pendingReview}
                          initial={{ scale: 1.2, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-2xl font-bold text-blue-900"
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
                        className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg"
                      >
                        <FileText className="h-6 w-6 text-white" />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-orange-200 shadow-sm rounded-xl overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-orange-600 mb-1">Konten Pending</p>
                        <motion.p
                          key={totalSubmissions}
                          initial={{ scale: 1.2, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-2xl font-bold text-orange-900"
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
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="px-4 py-4 space-y-4 pb-20">
        {/* Results Info */}
        <div className="flex items-center justify-between text-sm text-blue-600">
          <span>Menampilkan {filteredSubmissions.length} dokumen</span>
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="text-blue-600 hover:bg-blue-50 p-1"
            >
              <XCircle className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Submissions List */}
        <AnimatePresence>
          {filteredSubmissions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-12"
            >
              <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg">
                <CardContent className="p-6">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    {searchTerm ? "Tidak ada dokumen yang sesuai" : "Semua dokumen sudah direview!"}
                  </h3>
                  <p className="text-blue-600 text-sm">
                    {searchTerm
                      ? "Tidak ada dokumen yang sesuai dengan pencarian."
                      : "Tidak ada dokumen yang perlu direview saat ini."}
                  </p>
                  {!searchTerm && (
                    <div className="mt-4">
                      <Button
                        onClick={() => router.push("/dashboard/superadmin")}
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
            <div className="space-y-3">
              {filteredSubmissions.map((submission, index) => {
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
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="group"
                  >
                    <Card className="bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200 p-4">
                        <div className="flex items-start justify-between space-y-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <CardTitle className="text-base font-bold text-gray-900 group-hover:text-blue-800 transition-colors truncate">
                                {submission.judul}
                              </CardTitle>
                              {getStatusBadge(submissionStatus)}
                            </div>
                            {pendingCount > 0 && (
                              <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs mb-2">
                                {pendingCount} Pending Review
                              </Badge>
                            )}
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                              <div className="flex items-center space-x-1">
                                <FileText className="h-3 w-3" />
                                <span className="truncate">{submission.noComtab}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <User className="h-3 w-3" />
                                <span className="truncate">{submission.tema}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {submission.tanggalSubmit
                                    ? new Date(submission.tanggalSubmit).toLocaleDateString("id-ID")
                                    : "Tidak diketahui"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2 text-sm">Konten Items:</h4>
                            <div className="space-y-2">
                              {contentItems.slice(0, 2).map((item, itemIndex) => (
                                <div
                                  key={itemIndex}
                                  className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-200"
                                >
                                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                                    <div className="min-w-0 flex-1">
                                      <p className="font-medium text-blue-900 text-sm truncate">{item.nama}</p>
                                      <p className="text-xs text-blue-600 truncate">{item.jenisKonten}</p>
                                    </div>
                                  </div>
                                  {getStatusBadge(item.status)}
                                </div>
                              ))}
                              {contentItems.length > 2 && (
                                <div className="text-center">
                                  <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs">
                                    +{contentItems.length - 2} konten lainnya
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Summary */}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 pt-2 border-t border-gray-100">
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span>{contentItems.filter((item) => item.status === "approved").length} Disetujui</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <XCircle className="h-3 w-3 text-red-500" />
                              <span>{contentItems.filter((item) => item.status === "rejected").length} Ditolak</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3 text-orange-500" />
                              <span>{pendingCount} Pending</span>
                            </div>
                          </div>

                          <div className="pt-2">
                            <Button
                              onClick={() => handleReviewSubmission(submission)}
                              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                              size="sm"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Mulai Review
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </AnimatePresence>
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

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, Shield, CheckCircle, Clock, FileText, RefreshCw, Calendar, User, Hash } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ValidasiOutputDialog } from "@/components/validasi-output-dialog"
import { useToast } from "@/components/ui/use-toast"

// Define interfaces for type safety
interface ContentItem {
  id: string
  nama: string
  jenisKonten: string
  status?: "pending" | "approved" | "rejected"
  isTayang?: boolean
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
  tanggalReview?: string // Review timestamp
}

export default function ValidasiOutputPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Load submissions from localStorage
  useEffect(() => {
    const loadSubmissions = () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("submissions")
        if (stored) {
          const parsedSubmissions = JSON.parse(stored).map((sub: any) => ({
            ...sub,
            tanggalSubmit: sub.tanggalSubmit ? new Date(sub.tanggalSubmit) : undefined,
          }))

          // Filter only submissions that have been reviewed and have approved items but not yet validated
          const validationSubmissions = parsedSubmissions.filter((sub: Submission) => {
            // Must have been reviewed (has tanggalReview)
            if (!sub.tanggalReview) return false

            // Must not be already validated
            if (sub.isOutputValidated) return false

            // Must have approved content items
            const hasApprovedItems = sub.contentItems?.some((item) => item.status === "approved")
            return hasApprovedItems
          })

          setSubmissions(validationSubmissions)
          setFilteredSubmissions(validationSubmissions)
        }
      }
      setIsLoading(false)
    }

    setTimeout(() => loadSubmissions(), 500) // Simulate loading
  }, [])

  // Filter submissions based on search term
  useEffect(() => {
    const filtered = submissions.filter(
      (submission) =>
        submission.noComtab.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.tema.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.judul.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredSubmissions(filtered)
  }, [searchTerm, submissions])

  const handleValidateSubmission = (submissionId: number) => {
    const updatedSubmissions = submissions.map((sub) =>
      sub.id === submissionId
        ? {
            ...sub,
            isOutputValidated: true,
            tanggalValidasiOutput: new Date().toISOString(),
          }
        : sub,
    )

    // Remove validated submission from current view
    const stillNeedValidation = updatedSubmissions.filter((sub) => {
      if (!sub.tanggalReview) return false
      if (sub.isOutputValidated) return false
      const hasApprovedItems = sub.contentItems?.some((item) => item.status === "approved")
      return hasApprovedItems
    })

    setSubmissions(stillNeedValidation)
    setFilteredSubmissions(
      stillNeedValidation.filter(
        (sub) =>
          sub.noComtab.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.tema.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.judul.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    )

    // Update localStorage with all submissions
    if (typeof window !== "undefined") {
      const allSubmissions = JSON.parse(localStorage.getItem("submissions") || "[]")
      const updatedAllSubmissions = allSubmissions.map((sub: Submission) =>
        sub.id === submissionId
          ? {
              ...sub,
              isOutputValidated: true,
              tanggalValidasiOutput: new Date().toISOString(),
              workflowStage: "completed", // Mark as completed after validation
            }
          : sub,
      )
      localStorage.setItem("submissions", JSON.stringify(updatedAllSubmissions))
    }
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return "Tanggal tidak tersedia"
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  // Calculate statistics
  const totalSubmissions = submissions.length
  const needValidation = submissions.filter((sub) => !sub.isOutputValidated).length

  // Handle toast notifications
  const handleToast = (message: string, type: "success" | "error" | "info") => {
    toast({
      title: type === "success" ? "Berhasil" : type === "error" ? "Error" : "Informasi",
      description: message,
      variant: type === "success" ? "default" : type === "error" ? "destructive" : "default",
    })
  }

  // Handle submission update
  const handleSubmissionUpdate = (updatedSubmissions: any[]) => {
    // Update localStorage
    localStorage.setItem("submissions", JSON.stringify(updatedSubmissions))

    // Update current view - only show submissions that still need validation
    const validationSubmissions = updatedSubmissions.filter((sub: Submission) => {
      if (!sub.tanggalReview) return false
      if (sub.isOutputValidated) return false
      const hasApprovedItems = sub.contentItems?.some((item) => item.status === "approved")
      return hasApprovedItems
    })

    setSubmissions(validationSubmissions)
    setFilteredSubmissions(
      validationSubmissions.filter(
        (sub) =>
          sub.noComtab.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.tema.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.judul.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-yellow-50 flex items-center justify-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-yellow-700">Memuat data validasi...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-yellow-50">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm sticky top-0 z-40"
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
                onClick={() => router.back()}
                className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100 p-1 sm:p-2"
              >
                <ArrowLeft className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Kembali</span>
              </Button>
              <div className="h-4 sm:h-6 w-px bg-yellow-300 hidden sm:block"></div>
              <motion.div
                whileHover={{ rotate: 15 }}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-xl flex items-center justify-center shadow-lg"
              >
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </motion.div>
              <div className="flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-yellow-900">Validasi Output</h1>
                <p className="text-xs sm:text-sm text-yellow-600 hidden sm:block">
                  Validasi hasil produksi dan publikasi
                </p>
              </div>
            </motion.div>

            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="border-yellow-200 text-yellow-600 hover:bg-yellow-50 p-1 sm:p-2"
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
          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-yellow-900">Total Dokumen</h3>
                    <p className="text-yellow-700">Dokumen yang direview</p>
                  </div>
                </div>
                <motion.p
                  key={totalSubmissions}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-bold text-yellow-800"
                >
                  {totalSubmissions}
                </motion.p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-orange-900">Perlu Validasi</h3>
                    <p className="text-orange-700">Menunggu validasi output</p>
                  </div>
                </div>
                <motion.p
                  key={needValidation}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-bold text-orange-800"
                >
                  {needValidation}
                </motion.p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search Bar */}
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
          <Card className="shadow-lg border-yellow-100">
            <CardContent className="p-4 sm:p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-400 h-5 w-5" />
                <Input
                  placeholder="Cari berdasarkan No. Comtab, tema, atau judul..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-yellow-200 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
              <p className="text-sm text-yellow-600 mt-2">
                Menampilkan {filteredSubmissions.length} dari {totalSubmissions} dokumen
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Submissions List */}
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
          {filteredSubmissions.length === 0 ? (
            <Card className="border-yellow-200 shadow-lg">
              <CardContent className="p-12 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <CheckCircle className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-yellow-900 mb-2">Semua Dokumen Sudah Divalidasi!</h3>
                  <p className="text-yellow-600 mb-6">
                    Tidak ada dokumen yang perlu divalidasi saat ini. Semua konten yang disetujui sudah divalidasi.
                  </p>
                  <Button
                    onClick={() => router.push("/dashboard/admin/rekap")}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    Lihat Rekap Data
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredSubmissions.map((submission, index) => (
                <motion.div
                  key={submission.id}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-yellow-100 group">
                    <CardHeader className="bg-gradient-to-r from-yellow-50 to-yellow-50 border-b border-yellow-100 p-4 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-md">
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-yellow-800 transition-colors">
                              {submission.judul}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Hash className="h-3 w-3" />
                                <span>{submission.noComtab}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(submission.tanggalSubmit)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {submission.isOutputValidated ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Tervalidasi
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                              <Clock className="h-3 w-3 mr-1" />
                              Perlu Validasi
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Tema:</strong> {submission.tema}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 sm:space-x-4 text-xs sm:text-sm text-gray-600">
                            <div className="flex flex-wrap items-center gap-1 sm:space-x-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-xs sm:text-sm text-gray-600">
                                Konten: {submission.contentItems?.length || 0} item
                              </span>
                            </div>
                            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                            <span className="text-xs sm:text-sm text-gray-600">
                              Approved:{" "}
                              {submission.contentItems?.filter((item) => item.status === "approved").length || 0} item
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          {!submission.isOutputValidated && (
                            <Button
                              size="sm"
                              onClick={() => setSelectedSubmission(submission)}
                              className="bg-yellow-600 hover:bg-yellow-700 text-white"
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Mulai Validasi
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* Validasi Output Dialog */}
      {selectedSubmission && (
        <ValidasiOutputDialog
          isOpen={!!selectedSubmission}
          onOpenChange={(open) => {
            if (!open) setSelectedSubmission(null)
          }}
          submission={selectedSubmission}
          contentItem={null}
          onUpdate={handleSubmissionUpdate}
          onToast={handleToast}
        />
      )}
    </div>
  )
}

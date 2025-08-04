"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  Search,
  Shield,
  CheckCircle,
  Clock,
  FileText,
  RefreshCw,
  Calendar,
  User,
  Hash,
  TrendingUp,
  XCircle,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
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
  tanggalReview?: string
}

export default function MobileValidasiPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showStats, setShowStats] = useState(false)
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

          // Filter only confirmed submissions that need validation and haven't been validated yet
          const confirmedSubmissions = parsedSubmissions.filter(
            (sub: Submission) => sub.isConfirmed && !sub.isOutputValidated,
          )
          setSubmissions(confirmedSubmissions)
          setFilteredSubmissions(confirmedSubmissions)
        }
      }
      setIsLoading(false)
    }

    setTimeout(() => loadSubmissions(), 500)
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
    const stillNeedValidation = updatedSubmissions.filter((sub) => sub.isConfirmed && !sub.isOutputValidated)
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
  const validated = submissions.filter((sub) => sub.isOutputValidated).length

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

    // Update current view
    const confirmedSubmissions = updatedSubmissions.filter(
      (sub: Submission) => sub.isConfirmed && !sub.isOutputValidated,
    )
    setSubmissions(confirmedSubmissions)
    setFilteredSubmissions(
      confirmedSubmissions.filter(
        (sub) =>
          sub.noComtab.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.tema.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.judul.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-yellow-50 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-base font-semibold text-yellow-700">Memuat data validasi...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-yellow-50">
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
                onClick={() => router.back()}
                className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100 p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <motion.div
                whileHover={{ rotate: 15 }}
                className="w-8 h-8 bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-xl flex items-center justify-center shadow-lg"
              >
                <Shield className="h-4 w-4 text-white" />
              </motion.div>
              <div>
                <h1 className="text-lg font-bold text-yellow-900">Validasi Output</h1>
                <p className="text-xs text-yellow-600">Validasi hasil produksi</p>
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
                className="text-yellow-600 hover:bg-yellow-50 p-2"
              >
                <TrendingUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.reload()}
                className="text-yellow-600 hover:bg-yellow-50 p-2"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-400 h-4 w-4" />
            <Input
              placeholder="Cari dokumen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-yellow-200 focus:ring-yellow-500 focus:border-yellow-500 bg-white/80 text-sm"
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
                        <p className="text-sm font-medium text-blue-600 mb-1">Total Dokumen</p>
                        <motion.p
                          key={totalSubmissions}
                          initial={{ scale: 1.2, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-2xl font-bold text-blue-900"
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

                <Card className="bg-white border-orange-200 shadow-sm rounded-xl overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-orange-600 mb-1">Perlu Validasi</p>
                        <motion.p
                          key={needValidation}
                          initial={{ scale: 1.2, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-2xl font-bold text-orange-900"
                        >
                          {needValidation}
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
        <div className="flex items-center justify-between text-sm text-yellow-600">
          <span>Menampilkan {filteredSubmissions.length} dokumen</span>
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="text-yellow-600 hover:bg-yellow-50 p-1"
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
              <Card className="bg-white/80 backdrop-blur-sm border-yellow-200 shadow-lg">
                <CardContent className="p-6">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                    {searchTerm ? "Tidak ada dokumen yang sesuai" : "Semua Dokumen Sudah Divalidasi!"}
                  </h3>
                  <p className="text-yellow-600 text-sm">
                    {searchTerm
                      ? "Tidak ada dokumen yang sesuai dengan pencarian."
                      : "Tidak ada dokumen yang perlu divalidasi saat ini."}
                  </p>
                  {!searchTerm && (
                    <div className="mt-4">
                      <Button
                        onClick={() => router.push("/dashboard/admin/rekap")}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                      >
                        Lihat Rekap Data
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filteredSubmissions.map((submission, index) => (
                <motion.div
                  key={submission.id}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -50, opacity: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="group"
                >
                  <Card className="bg-white/90 backdrop-blur-sm border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-yellow-50 to-yellow-50 border-b border-yellow-100 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-md">
                              <FileText className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-bold text-gray-900 group-hover:text-yellow-800 transition-colors truncate">
                                {submission.judul}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 mt-1">
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
                        </div>
                        <div className="flex items-center space-x-2 ml-2">
                          {submission.isOutputValidated ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Tervalidasi
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              Perlu Validasi
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Tema:</strong> {submission.tema}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3 text-gray-400" />
                              <span>Konten: {submission.contentItems?.length || 0} item</span>
                            </div>
                            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                            <span>Status: {submission.isOutputValidated ? "Tervalidasi" : "Menunggu Validasi"}</span>
                          </div>
                        </div>
                        <div className="pt-2">
                          {!submission.isOutputValidated && (
                            <Button
                              size="sm"
                              onClick={() => setSelectedSubmission(submission)}
                              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
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
        </AnimatePresence>
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

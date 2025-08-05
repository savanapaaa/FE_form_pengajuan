"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  Activity,
  BarChart3,
  Eye,
  Shield,
  Database,
  ArrowRight,
  Zap,
  Rocket,
  Star,
  Award,
  Globe,
  CheckCircle2,
  RefreshCw,
  Home,
  LogOut,
  History,
  ClipboardPlus
} from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { loadSubmissionsFromStorage } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useMobile } from "@/hooks/use-mobile"
import MobileAdminPage from "./mobile-page"

// Types
interface ContentItem {
  id: string
  nama: string
  jenisKonten: string
  status?: "pending" | "approved" | "rejected"
  isTayang?: boolean
  tanggalOrderMasuk?: Date
  tanggalJadi?: Date
  tanggalTayang?: Date
  hasilProdukFile?: any
  hasilProdukLink?: string
}

interface Submission {
  id: number
  noComtab: string
  judul: string
  tema: string
  petugasPelaksana: string
  tanggalSubmit: Date
  isConfirmed?: boolean
  isOutputValidated?: boolean
  contentItems?: ContentItem[]
}

export default function AdminDashboard() {
  const isMobile = useMobile()
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminUser, setAdminUser] = useState<any>(null)

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem("adminLoggedIn")
      const adminUserData = localStorage.getItem("adminUser")

      if (isLoggedIn === "true" && adminUserData) {
        try {
          const userData = JSON.parse(adminUserData)
          if (userData.loginTime) {
            const loginTime = new Date(userData.loginTime)
            const now = new Date()
            const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60)

            // Check session validity (30 days if remember me, 24 hours otherwise)
            const sessionDuration = userData.rememberMe ? 24 * 30 : 24

            if (hoursDiff < sessionDuration) {
              setIsAuthenticated(true)
              setAdminUser(userData)
              return
            }
          }
        } catch (error) {
          console.error("Error parsing admin user data:", error)
        }
      }

      // Clear invalid session and redirect to login
      handleLogout()
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    if (!isAuthenticated) return

    const loadData = () => {
      try {
        const data = loadSubmissionsFromStorage()
        setSubmissions(data)
      } catch (error) {
        console.error("Error loading submissions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
    const interval = setInterval(loadData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [isAuthenticated])

  // Handle logout with confirmation
  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem("adminLoggedIn")
    localStorage.removeItem("adminUser")

    // Reset state
    setIsAuthenticated(false)
    setAdminUser(null)

    // Redirect to login page
    router.push("/")
  }

  // Confirm logout
  const confirmLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin logout dari dashboard superadmin?")) {
      handleLogout()
    }
  }

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalSubmissions = submissions.length
    const confirmedSubmissions = submissions.filter((s) => s.isConfirmed).length
    const validatedSubmissions = submissions.filter((s) => s.isOutputValidated).length

    const allContent = submissions.flatMap((s) => s.contentItems || [])
    const totalContent = allContent.length
    const approvedContent = allContent.filter((c) => c.status === "approved").length
    const rejectedContent = allContent.filter((c) => c.status === "rejected").length
    const pendingContent = allContent.filter((c) => c.status === "pending" || !c.status).length
    const publishedContent = allContent.filter((c) => c.isTayang === true).length

    const pendingReview = submissions.filter(
      (s) => s.isConfirmed && s.contentItems?.some((c) => c.status === "pending" || !c.status),
    ).length

    const pendingValidation = submissions.filter(
      (s) =>
        s.isConfirmed &&
        s.contentItems?.every((c) => c.status === "approved" || c.status === "rejected") &&
        s.contentItems?.some((c) => c.status === "approved" && c.isTayang === undefined),
    ).length

    return {
      totalSubmissions,
      confirmedSubmissions,
      validatedSubmissions,
      totalContent,
      approvedContent,
      rejectedContent,
      pendingContent,
      publishedContent,
      pendingReview,
      pendingValidation,
      completionRate: totalSubmissions > 0 ? Math.round((validatedSubmissions / totalSubmissions) * 100) : 0,
      approvalRate: totalContent > 0 ? Math.round((approvedContent / totalContent) * 100) : 0,
    }
  }, [submissions])

  // Recent activity
  const recentActivity = useMemo(() => {
    const activities: any[] = []

    submissions.forEach((submission) => {
      if (submission.isConfirmed) {
        activities.push({
          type: "confirmed",
          submission,
          timestamp: new Date(submission.tanggalSubmit),
        })
      }

      submission.contentItems?.forEach((item) => {
        if (item.status === "approved") {
          activities.push({
            type: "approved",
            submission,
            item,
            timestamp: new Date(),
          })
        }
        if (item.isTayang === true) {
          activities.push({
            type: "published",
            submission,
            item,
            timestamp: new Date(),
          })
        }
      })
    })

    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5)
  }, [submissions])

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-indigo-700">Memverifikasi akses...</p>
        </motion.div>
      </div>
    )
  }

  if (isMobile) {
    return <MobileAdminPage />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-indigo-700">Memuat dashboard...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm sticky top-0"
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-4"
            >
              <motion.div
                whileHover={{ rotate: 15 }}
                className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
              >
                <Shield className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Super Admin Dashboard
                </h1>
                <p className="text-gray-600">
                  Selamat datang, {adminUser?.fullName || adminUser?.username || "Administrator"}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center space-x-3"
            >
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="hover:bg-green-50 hover:border-green-200 transition-all duration-300"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/history")}
              className="h-9 hover:bg-blue-50 transition-all flex items-center justify-center space-x-2"
            >
              <History className="h-4 w-4" />
              <span>Lihat Riwayat</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/superadmin/pengajuan")}
              className="hover:bg-blue-50 hover:border-blue-200 transition-all duration-300"
            >
              <ClipboardPlus className="h-4 w-4 mr-2" />
              Pengajuan
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={confirmLogout}
              className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-300"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Overview Statistics Card */}
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-6 w-6 text-indigo-600" />
                <span>Overview Statistik</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                  <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-900">{statistics.totalSubmissions}</p>
                  <p className="text-sm text-blue-700">Total Pengajuan</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                  <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-900">{statistics.approvedContent}</p>
                  <p className="text-sm text-green-700">Konten Disetujui</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                  <Globe className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-900">{statistics.publishedContent}</p>
                  <p className="text-sm text-purple-700">Konten Tayang</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                  <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-orange-900">{statistics.completionRate}%</p>
                  <p className="text-sm text-orange-700">Tingkat Selesai</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content Analytics Card */}
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-6 w-6 text-green-600" />
                <span>Analisis Konten</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Progress Chart */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Status Konten</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Disetujui</span>
                      <span className="text-sm font-medium">{statistics.approvedContent}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                        style={{
                          width: `${statistics.totalContent > 0 ? (statistics.approvedContent / statistics.totalContent) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Menunggu</span>
                      <span className="text-sm font-medium">{statistics.pendingContent}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full transition-all duration-1000"
                        style={{
                          width: `${statistics.totalContent > 0 ? (statistics.pendingContent / statistics.totalContent) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Ditolak</span>
                      <span className="text-sm font-medium">{statistics.rejectedContent}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full transition-all duration-1000"
                        style={{
                          width: `${statistics.totalContent > 0 ? (statistics.rejectedContent / statistics.totalContent) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl">
                    <Award className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
                    <p className="text-xl font-bold text-indigo-900">{statistics.approvalRate}%</p>
                    <p className="text-xs text-indigo-700">Tingkat Persetujuan</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl">
                    <Star className="h-6 w-6 text-pink-600 mx-auto mb-2" />
                    <p className="text-xl font-bold text-pink-900">{statistics.totalContent}</p>
                    <p className="text-xs text-pink-700">Total Konten</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl">
                    <Rocket className="h-6 w-6 text-cyan-600 mx-auto mb-2" />
                    <p className="text-xl font-bold text-cyan-900">{statistics.publishedContent}</p>
                    <p className="text-xs text-cyan-700">Sudah Tayang</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
                    <Zap className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                    <p className="text-xl font-bold text-emerald-900">{statistics.confirmedSubmissions}</p>
                    <p className="text-xs text-emerald-700">Dikonfirmasi</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Workflow Management Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Review Dokumen */}
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <Card
              className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-100 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
              onClick={() => router.push("/dashboard/superadmin/review")}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                      <Eye className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-blue-900">Review Dokumen</CardTitle>
                      <p className="text-sm text-blue-700">Tinjau pengajuan masuk</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">Menunggu Review</span>
                    <Badge className="bg-blue-500 text-white">{statistics.pendingReview}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">Total Konten</span>
                    <span className="text-sm font-medium text-blue-900">{statistics.totalContent}</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                      style={{
                        width: `${statistics.totalContent > 0 ? ((statistics.totalContent - statistics.pendingContent) / statistics.totalContent) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Validasi Output */}
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
            <Card
              className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-violet-100 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
              onClick={() => router.push("/dashboard/superadmin/validasi")}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-purple-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-purple-900">Validasi Output</CardTitle>
                      <p className="text-sm text-purple-700">Validasi hasil produksi</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-700">Menunggu Validasi</span>
                    <Badge className="bg-purple-500 text-white">{statistics.pendingValidation}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-700">Sudah Tayang</span>
                    <span className="text-sm font-medium text-purple-900">{statistics.publishedContent}</span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all duration-1000"
                      style={{
                        width: `${statistics.approvedContent > 0 ? (statistics.publishedContent / statistics.approvedContent) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Rekap Data */}
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
            <Card
              className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-100 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
              onClick={() => router.push("/dashboard/superadmin/rekap")}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-green-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                      <Database className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-green-900">Rekap Data</CardTitle>
                      <p className="text-sm text-green-700">Laporan dan statistik</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-green-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-700">Total Pengajuan</span>
                    <Badge className="bg-green-500 text-white">{statistics.totalSubmissions}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-700">Selesai</span>
                    <span className="text-sm font-medium text-green-900">{statistics.validatedSubmissions}</span>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${statistics.completionRate}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-6 w-6 text-orange-600" />
                <span>Aktivitas Terbaru</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div
                        className={cn(
                          "p-2 rounded-full",
                          activity.type === "confirmed" && "bg-blue-100",
                          activity.type === "approved" && "bg-green-100",
                          activity.type === "published" && "bg-purple-100",
                        )}
                      >
                        {activity.type === "confirmed" && <CheckCircle className="h-4 w-4 text-blue-600" />}
                        {activity.type === "approved" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                        {activity.type === "published" && <Globe className="h-4 w-4 text-purple-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.type === "confirmed" && `Pengajuan ${activity.submission.noComtab} dikonfirmasi`}
                          {activity.type === "approved" && `Konten "${activity.item.nama}" disetujui`}
                          {activity.type === "published" && `Konten "${activity.item.nama}" sudah tayang`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.submission.judul} • {activity.submission.petugasPelaksana}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {activity.timestamp.toLocaleDateString("id-ID")}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Belum ada aktivitas terbaru</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}


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
  BarChart3,
  Eye,
  Shield,
  Database,
  Globe,
  CheckCircle2,
  RefreshCw,
  Home,
  ChevronRight,
  LogOut,
  ClipboardPlus,
} from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { loadSubmissionsFromStorage } from "@/lib/utils"
import { useRouter } from "next/navigation"

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

export default function MobileAdminPage() {
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
    const interval = setInterval(loadData, 30000)
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
    router.push("/admin/login")
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

    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 3)
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Mobile Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm sticky top-0 z-50"
      >
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-3"
            >
              <motion.div
                whileHover={{ rotate: 15 }}
                className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
              >
                <Shield className="h-4 w-4 text-white" />
              </motion.div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Super Admin Dashboard
                </h1>
                <p className="text-xs text-gray-600">{adminUser?.fullName || adminUser?.username || "Administrator"}</p>
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
                className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 p-2"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard/superadmin/pengajuan")}
                className="border-blue-200 text-blue-600 hover:bg-blue-50 p-2"
              >
                <ClipboardPlus className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={confirmLogout}
                className="border-red-200 text-red-600 hover:bg-red-50 p-2 bg-transparent"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <div className="space-y-4 p-4 pb-20">
        {/* Overview Statistics */}
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
                Overview & Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Main Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-blue-900">{statistics.totalSubmissions}</p>
                  <p className="text-xs text-blue-700">Total Pengajuan</p>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-green-900">{statistics.approvedContent}</p>
                  <p className="text-xs text-green-700">Konten Disetujui</p>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                  <Globe className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-purple-900">{statistics.publishedContent}</p>
                  <p className="text-xs text-purple-700">Konten Tayang</p>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-orange-900">{statistics.completionRate}%</p>
                  <p className="text-xs text-orange-700">Tingkat Selesai</p>
                </div>
              </div>

              {/* Content Progress */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800 text-sm">Progress Konten</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Disetujui</span>
                    <span className="font-medium">
                      {statistics.approvedContent}/{statistics.totalContent}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-green-500 h-1.5 rounded-full transition-all duration-1000"
                      style={{
                        width: `${statistics.totalContent > 0 ? (statistics.approvedContent / statistics.totalContent) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Workflow Cards */}
        <div className="space-y-3">
          {/* Review Dokumen */}
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            <Card
              className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-lg cursor-pointer"
              onClick={() => router.push("/dashboard/superadmin/review")}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Eye className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900">Review Dokumen</h3>
                      <p className="text-xs text-blue-700">Tinjau pengajuan masuk</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-blue-500 text-white text-xs">{statistics.pendingReview}</Badge>
                    <ChevronRight className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Validasi Output */}
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <Card
              className="bg-gradient-to-br from-purple-50 to-violet-100 border-0 shadow-lg cursor-pointer"
              onClick={() => router.push("/dashboard/superadmin/validasi")}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-purple-900">Validasi Output</h3>
                      <p className="text-xs text-purple-700">Validasi hasil produksi</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-purple-500 text-white text-xs">{statistics.pendingValidation}</Badge>
                    <ChevronRight className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Rekap Data */}
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
            <Card
              className="bg-gradient-to-br from-green-50 to-emerald-100 border-0 shadow-lg cursor-pointer"
              onClick={() => router.push("/dashboard/superadmin/rekap")}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <Database className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-900">Rekap Data</h3>
                      <p className="text-xs text-green-700">Laporan dan statistik</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-500 text-white text-xs">{statistics.totalSubmissions}</Badge>
                    <ChevronRight className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <Clock className="h-5 w-5 mr-2 text-orange-600" />
                Aktivitas Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg"
                    >
                      <div
                        className={cn(
                          "p-1.5 rounded-full",
                          activity.type === "confirmed" && "bg-blue-100",
                          activity.type === "approved" && "bg-green-100",
                          activity.type === "published" && "bg-purple-100",
                        )}
                      >
                        {activity.type === "confirmed" && <CheckCircle className="h-3 w-3 text-blue-600" />}
                        {activity.type === "approved" && <CheckCircle2 className="h-3 w-3 text-green-600" />}
                        {activity.type === "published" && <Globe className="h-3 w-3 text-purple-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {activity.type === "confirmed" && `${activity.submission.noComtab} dikonfirmasi`}
                          {activity.type === "approved" && `"${activity.item.nama}" disetujui`}
                          {activity.type === "published" && `"${activity.item.nama}" tayang`}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{activity.submission.judul}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {activity.timestamp.toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Belum ada aktivitas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

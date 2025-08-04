"use client"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  History,
  Crown,
  Plus,
  Clock,
  Sparkles,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  ArrowRight,
  Star,
  Calendar,
  CheckCircle,
  Edit,
  Eye,
  Search,
  Filter,
  MoreVertical,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { loadSubmissionsFromStorage } from "@/lib/utils"
import { useResponsiveRedirect } from "@/hooks/use-responsive-redirect"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Import types
import type { Submission } from "@/lib/utils"

// Time-based greeting function
const getTimeBasedGreeting = () => {
  const hour = new Date().getHours()

  if (hour >= 5 && hour < 11) {
    return {
      greeting: "Selamat Pagi",
      icon: Sunrise,
      color: "from-orange-400 to-yellow-400",
      bgGradient: "from-orange-50 to-yellow-50",
    }
  } else if (hour >= 11 && hour < 15) {
    return {
      greeting: "Selamat Siang",
      icon: Sun,
      color: "from-yellow-400 to-orange-400",
      bgGradient: "from-yellow-50 to-orange-50",
    }
  } else if (hour >= 15 && hour < 18) {
    return {
      greeting: "Selamat Sore",
      icon: Sunset,
      color: "from-orange-400 to-red-400",
      bgGradient: "from-orange-50 to-red-50",
    }
  } else {
    return {
      greeting: "Selamat Malam",
      icon: Moon,
      color: "from-indigo-400 to-purple-400",
      bgGradient: "from-indigo-50 to-purple-50",
    }
  }
}

// Get current date in Indonesian format
const getCurrentDate = () => {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ]

  const now = new Date()
  const dayName = days[now.getDay()]
  const day = now.getDate()
  const month = months[now.getMonth()]
  const year = now.getFullYear()

  return `${dayName}, ${day} ${month} ${year}`
}

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "approved":
      return "bg-green-100 text-green-800 border-green-200"
    case "rejected":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

// Helper function to get status text
const getStatusText = (status: string) => {
  switch (status) {
    case "pending":
      return "Menunggu Review"
    case "approved":
      return "Disetujui"
    case "rejected":
      return "Ditolak"
    default:
      return "Tidak Diketahui"
  }
}

// Helper function to get workflow stage text
const getWorkflowStageText = (stage: string) => {
  switch (stage) {
    case "submitted":
      return "Terkirim"
    case "review":
      return "Review"
    case "validation":
      return "Validasi"
    case "completed":
      return "Selesai"
    default:
      return "Tidak Diketahui"
  }
}

export default function MobileHomePage() {
  const router = useRouter()
  const [timeGreeting, setTimeGreeting] = useState(getTimeBasedGreeting())
  const [currentDate, setCurrentDate] = useState(getCurrentDate())
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showSubmissions, setShowSubmissions] = useState(false)
  const [isHistoryMode, setIsHistoryMode] = useState(false)
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    pendingReview: 0,
    completed: 0,
  })

  // Long press handling
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const [isLongPressing, setIsLongPressing] = useState(false)

  // Use responsive redirect hook
  const { isMobile, isInitialized } = useResponsiveRedirect({
    enableAutoRedirect: true,
    mobileBreakpoint: 768,
    preserveSearchParams: true,
  })

  // Update greeting every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeGreeting(getTimeBasedGreeting())
      setCurrentDate(getCurrentDate())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  // Load submissions and statistics
  useEffect(() => {
    const loadedSubmissions = loadSubmissionsFromStorage()
    setSubmissions(loadedSubmissions)
    setFilteredSubmissions(loadedSubmissions)

    const pendingCount = loadedSubmissions.filter((sub) =>
      sub.contentItems?.some((item) => item.status === "pending"),
    ).length
    const completedCount = loadedSubmissions.filter((sub) =>
      sub.contentItems?.every((item) => item.status === "approved" || item.status === "rejected"),
    ).length

    setStats({
      totalSubmissions: loadedSubmissions.length,
      pendingReview: pendingCount,
      completed: completedCount,
    })
  }, [])

  // Filter submissions based on search and status
  useEffect(() => {
    let filtered = submissions

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (submission) =>
          submission.judul?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          submission.noComtab?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          submission.tema?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((submission) => {
        if (statusFilter === "pending") {
          return submission.contentItems?.some((item) => item.status === "pending")
        } else if (statusFilter === "approved") {
          return submission.contentItems?.some((item) => item.status === "approved")
        } else if (statusFilter === "rejected") {
          return submission.contentItems?.some((item) => item.status === "rejected")
        }
        return true
      })
    }

    setFilteredSubmissions(filtered)
  }, [submissions, searchQuery, statusFilter])

  // Handle edit submission
  const handleEditSubmission = (submission: Submission) => {
    router.push(`/mobile/form?editId=${submission.noComtab}&editPin=${submission.pin}`)
  }

  // Handle view submission details
  const handleViewSubmission = (submission: Submission) => {
    // Navigate to history page with specific submission
    router.push(`/history?id=${submission.noComtab}`)
  }

  // Handle long press start
  const handleLongPressStart = () => {
    setIsLongPressing(true)
    longPressTimer.current = setTimeout(() => {
      setIsHistoryMode(!isHistoryMode)
      // Haptic feedback simulation
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    }, 800) // 800ms for long press
  }

  // Handle long press end
  const handleLongPressEnd = () => {
    setIsLongPressing(false)
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  // Handle card click
  const handleCardClick = () => {
    if (!isLongPressing) {
      if (isHistoryMode) {
        router.push("/history")
      } else {
        setShowSubmissions(!showSubmissions)
      }
    }
  }

  // Format date for display
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return format(dateObj, "dd MMM yyyy", { locale: id })
  }

  // Don't render anything if not initialized
  if (!isInitialized) {
    return null
  }

  const GreetingIcon = timeGreeting.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-r from-blue-300/20 to-purple-300/20 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -25, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-r from-green-300/20 to-teal-300/20 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 25, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Header with Greeting */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 px-4 pt-8 pb-6"
      >
        <Card className={cn("border-0 shadow-xl bg-gradient-to-r", timeGreeting.bgGradient, "overflow-hidden")}>
          <CardContent className="p-6 relative">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <GreetingIcon className="w-full h-full" />
              </motion.div>
            </div>

            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-r",
                  timeGreeting.color,
                  "shadow-lg",
                )}
              >
                <GreetingIcon className="h-8 w-8 text-white" />
              </motion.div>

              <motion.h1
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-gray-800 mb-2"
              >
                {timeGreeting.greeting}! 👋
              </motion.h1>

              <motion.p
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 mb-1 flex items-center"
              >
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                {currentDate}
              </motion.p>

              <motion.p
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-gray-500 flex items-center"
              >
                <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                Selamat datang di Sistem Pelayanan Publik
              </motion.p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="px-4 mb-6"
      >
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-2"
              >
                <FileText className="h-5 w-5 text-white" />
              </motion.div>
              <p className="text-lg font-bold text-gray-800">{stats.totalSubmissions}</p>
              <p className="text-xs text-gray-600">Total Pengajuan</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-2"
              >
                <Clock className="h-5 w-5 text-white" />
              </motion.div>
              <p className="text-lg font-bold text-gray-800">{stats.pendingReview}</p>
              <p className="text-xs text-gray-600">Menunggu Review</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-2"
              >
                <CheckCircle className="h-5 w-5 text-white" />
              </motion.div>
              <p className="text-lg font-bold text-gray-800">{stats.completed}</p>
              <p className="text-xs text-gray-600">Selesai</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Main Navigation Buttons */}
      <div className="px-4 space-y-4">
        {/* Buat Pengajuan Konten */}
        <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
          <Card
            className="border-0 shadow-xl bg-gradient-to-r from-indigo-500 to-purple-600 overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 active:scale-95"
            onClick={() => router.push("/mobile/form")}
          >
            <CardContent className="p-6 relative">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <Plus className="w-full h-full text-white" />
                </motion.div>
              </div>

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <motion.div
                    whileHover={{ rotate: 90 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                  >
                    <Plus className="h-7 w-7 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Buat Pengajuan</h3>
                    <p className="text-white/80 text-sm">Ajukan konten komunikasi publik</p>
                  </div>
                </div>
                <ArrowRight className="h-6 w-6 text-white/80" />
              </div>

              {/* Floating elements */}
              <motion.div
                className="absolute top-4 right-16 w-2 h-2 bg-white/40 rounded-full"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              />
              <motion.div
                className="absolute bottom-6 right-8 w-1 h-1 bg-white/60 rounded-full"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Pengajuan Saya / Histori - with long press functionality */}
        <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.8 }}>
          <motion.div
            animate={{
              scale: isLongPressing ? 1.02 : 1,
              boxShadow: isLongPressing
                ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className={cn(
                "border-0 shadow-xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 active:scale-95",
                isHistoryMode
                  ? "bg-gradient-to-r from-purple-500 to-pink-600"
                  : "bg-gradient-to-r from-emerald-500 to-teal-600",
              )}
              onClick={handleCardClick}
              onTouchStart={handleLongPressStart}
              onTouchEnd={handleLongPressEnd}
              onMouseDown={handleLongPressStart}
              onMouseUp={handleLongPressEnd}
              onMouseLeave={handleLongPressEnd}
            >
              <CardContent className="p-6 relative">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
                  <motion.div
                    animate={isHistoryMode ? { rotate: [0, 360] } : { scale: [1, 1.1, 1] }}
                    transition={
                      isHistoryMode
                        ? { duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }
                        : { duration: 3, repeat: Number.POSITIVE_INFINITY }
                    }
                  >
                    <History className="w-full h-full text-white" />
                  </motion.div>
                </div>

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <motion.div
                      whileHover={isHistoryMode ? { scale: 1.1 } : { rotateY: 180 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                    >
                      <History className="h-7 w-7 text-white" />
                    </motion.div>
                    <div>
                      <motion.h3
                        key={isHistoryMode ? "history" : "submissions"}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xl font-bold text-white mb-1"
                      >
                        {isHistoryMode ? "Histori" : "Pengajuan Saya"}
                      </motion.h3>
                      <motion.p
                        key={isHistoryMode ? "history-desc" : "submissions-desc"}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-white/80 text-sm"
                      >
                        {isHistoryMode ? "Lihat riwayat lengkap pengajuan" : "Lihat dan kelola pengajuan Anda"}
                      </motion.p>
                    </div>
                  </div>
                  <ArrowRight className="h-6 w-6 text-white/80" />
                </div>

                {/* Badge for pending items */}
                {stats.pendingReview > 0 && !isHistoryMode && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-4 right-4">
                    <Badge className="bg-orange-500 text-white border-0 shadow-lg">{stats.pendingReview} pending</Badge>
                  </motion.div>
                )}

                {/* Mode indicator */}
                <motion.div
                  className="absolute bottom-4 right-4"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  {isHistoryMode ? (
                    <div className="flex items-center space-x-1 text-white/60 text-xs">
                      <Clock className="h-3 w-3" />
                      <span>Mode Histori</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-white/60 text-xs">
                      <FileText className="h-3 w-3" />
                      <span>Tahan untuk Histori</span>
                    </div>
                  )}
                </motion.div>

                {/* Long press progress indicator */}
                {isLongPressing && (
                  <motion.div
                    className="absolute bottom-0 left-0 h-1 bg-white/40 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.8 }}
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Admin */}
        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }}>
          <Card
            className="border-0 shadow-xl bg-gradient-to-r from-amber-500 to-orange-600 overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 active:scale-95"
            onClick={() => router.push("/admin/login")}
          >
            <CardContent className="p-6 relative">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
                >
                  <Crown className="w-full h-full text-white" />
                </motion.div>
              </div>

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                  >
                    <Crown className="h-7 w-7 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Admin Panel</h3>
                    <p className="text-white/80 text-sm">Kelola dan review pengajuan</p>
                  </div>
                </div>
                <ArrowRight className="h-6 w-6 text-white/80" />
              </div>

              {/* VIP indicator */}
              <motion.div
                className="absolute top-2 left-2"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                <Star className="h-4 w-4 text-yellow-300" />
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Submissions List - only show when not in history mode */}
      <AnimatePresence>
        {showSubmissions && !isHistoryMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="px-4 mt-6 space-y-4"
          >
            {/* Search and Filter */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Cari berdasarkan judul, No Comtab, atau tema..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0 bg-transparent focus:ring-0 text-sm"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full border-0 bg-transparent focus:ring-0 text-sm">
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="pending">Menunggu Review</SelectItem>
                      <SelectItem value="approved">Disetujui</SelectItem>
                      <SelectItem value="rejected">Ditolak</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Submissions List */}
            <div className="space-y-3">
              {filteredSubmissions.length === 0 ? (
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
                  <CardContent className="p-8 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Tidak Ada Pengajuan</h3>
                    <p className="text-sm text-gray-500">
                      {searchQuery || statusFilter !== "all"
                        ? "Tidak ada pengajuan yang sesuai dengan filter Anda."
                        : "Anda belum memiliki pengajuan. Buat pengajuan pertama Anda!"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredSubmissions.map((submission, index) => (
                  <motion.div
                    key={submission.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-0">
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg truncate">{submission.judul}</h3>
                              <p className="text-white/80 text-sm">No: {submission.noComtab}</p>
                            </div>
                            <Badge className="bg-white/20 text-white border-0">
                              {getWorkflowStageText(submission.workflowStage || "submitted")}
                            </Badge>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Tema:</span>
                            <span className="font-medium text-gray-800 capitalize">{submission.tema}</span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Tanggal Submit:</span>
                            <span className="font-medium text-gray-800">{formatDate(submission.tanggalSubmit)}</span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Jumlah Konten:</span>
                            <span className="font-medium text-gray-800">
                              {submission.contentItems?.length || 0} item
                            </span>
                          </div>

                          {/* Content Status */}
                          {submission.contentItems && submission.contentItems.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-gray-700">Status Konten:</p>
                              <div className="flex flex-wrap gap-2">
                                {submission.contentItems.map((item, itemIndex) => (
                                  <Badge
                                    key={itemIndex}
                                    className={cn("text-xs border", getStatusColor(item.status || "pending"))}
                                  >
                                    {item.nama}: {getStatusText(item.status || "pending")}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center space-x-2">
                              <motion.button
                                onClick={() => handleEditSubmission(submission)}
                                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Edit className="h-4 w-4" />
                                <span>Edit</span>
                              </motion.button>
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditSubmission(submission)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Pengajuan
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleViewSubmission(submission)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Lihat Detail
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="px-4 pb-8 pt-8 text-center"
      >
        <p className="text-xs text-gray-500">© 2024 Sistem Pelayanan Publik Mobile</p>
      </motion.div>
    </div>
  )
}
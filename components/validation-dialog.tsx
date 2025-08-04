"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Clock,
  Shield,
  Sparkles,
  Star,
  Zap,
  ArrowRight,
  Eye,
  Users,
  Calendar,
  Target,
  Activity,
  Layers,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface ContentItem {
  id: string
  nama: string
  jenisKonten: string
  mediaPemerintah: string[]
  mediaMassa: string[]
  nomorSurat: string
  narasiText: string
  tanggalOrderMasuk: Date | undefined
  tanggalJadi: Date | undefined
  tanggalTayang: Date | undefined
  keterangan: string
  status?: "pending" | "approved" | "rejected"
  alasanPenolakan?: string
  tanggalDiproses?: string
  diprosesoleh?: string
  hasilProdukFile?: any
  hasilProdukLink?: string
  isTayang?: boolean
  tanggalValidasiTayang?: string
  validatorTayang?: string
  keteranganValidasi?: string
  isConfirmed?: boolean
  tanggalKonfirmasi?: string
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
  tanggalOrder: Date
  petugasPelaksana: string
  supervisor: string
  durasi: string
  jumlahProduksi: string
  tanggalSubmit: Date
  uploadedBuktiMengetahui?: any
  isConfirmed?: boolean
  tanggalKonfirmasi?: string
  contentItems?: ContentItem[]
  workflowStage?: "submitted" | "review" | "validation" | "completed"
}

interface ValidationDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  submission: Submission | null
  onConfirm: () => void
  isSubmitting: boolean
}

// Floating particles component
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-60"
          initial={{
            x: Math.random() * 400,
            y: Math.random() * 600,
          }}
          animate={{
            x: Math.random() * 400,
            y: Math.random() * 600,
            scale: [1, 1.5, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

// Enhanced validation item component
const ValidationItem = ({ item, index }: { item: ContentItem; index: number }) => {
  const getStatusIcon = () => {
    switch (item.status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-orange-600" />
    }
  }

  const getStatusColor = () => {
    switch (item.status) {
      case "approved":
        return "from-green-50 to-emerald-50 border-green-200"
      case "rejected":
        return "from-red-50 to-rose-50 border-red-200"
      default:
        return "from-orange-50 to-yellow-50 border-orange-200"
    }
  }

  const getContentTypeIcon = () => {
    switch (item.jenisKonten.toLowerCase()) {
      case "video":
        return "🎬"
      case "audio":
        return "🎵"
      case "fotografis":
        return "📸"
      case "infografis":
        return "📊"
      case "naskah-berita":
        return "📰"
      case "bumper":
        return "⚡"
      default:
        return "📄"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={cn(
        "p-4 rounded-xl border-2 bg-gradient-to-r shadow-md hover:shadow-lg transition-all duration-300",
        getStatusColor(),
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{getContentTypeIcon()}</div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 text-sm">{item.nama}</h4>
            <p className="text-xs text-gray-600 capitalize">{item.jenisKonten.replace("-", " ")}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <Badge
            className={cn(
              "text-xs font-medium",
              item.status === "approved"
                ? "bg-green-100 text-green-800 border-green-200"
                : item.status === "rejected"
                  ? "bg-red-100 text-red-800 border-red-200"
                  : "bg-orange-100 text-orange-800 border-orange-200",
            )}
          >
            {item.status === "approved" ? "Disetujui" : item.status === "rejected" ? "Ditolak" : "Pending"}
          </Badge>
        </div>
      </div>

      {/* Additional info for approved/rejected items */}
      {(item.status === "approved" || item.status === "rejected") && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-3 pt-3 border-t border-gray-200"
        >
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Diproses oleh:</span>
              <p className="font-medium text-gray-900">{item.diprosesoleh || "Admin"}</p>
            </div>
            <div>
              <span className="text-gray-500">Tanggal:</span>
              <p className="font-medium text-gray-900">
                {item.tanggalDiproses ? new Date(item.tanggalDiproses).toLocaleDateString("id-ID") : "Hari ini"}
              </p>
            </div>
          </div>
          {item.status === "rejected" && item.alasanPenolakan && (
            <div className="mt-2">
              <span className="text-gray-500 text-xs">Alasan penolakan:</span>
              <p className="text-xs text-red-700 bg-red-50 p-2 rounded mt-1">{item.alasanPenolakan}</p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

export function ValidationDialog({ isOpen, onOpenChange, submission, onConfirm, isSubmitting }: ValidationDialogProps) {
  const [showDetails, setShowDetails] = useState(false)

  if (!submission) return null

  const contentItems = submission.contentItems || []
  const approvedItems = contentItems.filter((item) => item.status === "approved")
  const rejectedItems = contentItems.filter((item) => item.status === "rejected")
  const pendingItems = contentItems.filter((item) => !item.status || item.status === "pending")

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-0 shadow-2xl">
        <div className="relative">
          <FloatingParticles />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative z-10"
          >
            {/* Enhanced Header */}
            <DialogHeader className="text-center pb-6 border-b border-gradient-to-r from-blue-200 to-indigo-200">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto mb-4 relative"
              >
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                {/* Rotating rings */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="absolute inset-0 border-2 border-blue-300 rounded-full opacity-30"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="absolute inset-2 border-2 border-indigo-300 rounded-full opacity-20"
                />
                {/* Sparkle effects */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                    style={{
                      top: "50%",
                      left: "50%",
                      transformOrigin: "0 0",
                    }}
                    animate={{
                      rotate: [0, 360],
                      scale: [0, 1, 0],
                      x: [0, 40 * Math.cos((i * 60 * Math.PI) / 180)],
                      y: [0, 40 * Math.sin((i * 60 * Math.PI) / 180)],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 0.3,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </motion.div>

              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Validasi Pengajuan
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-2 text-lg">
                Periksa detail pengajuan sebelum mengirim
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[60vh] px-6 py-6">
              <div className="space-y-6">
                {/* Document Summary Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-blue-900 flex items-center">
                          <FileText className="h-6 w-6 mr-3 text-blue-600" />
                          Informasi Dokumen
                        </h3>
                        <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200 px-4 py-2">
                          <Star className="h-4 w-4 mr-2" />
                          {submission.noComtab}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="p-4 bg-white rounded-lg border border-blue-100 shadow-sm">
                            <div className="flex items-center space-x-3 mb-2">
                              <Target className="h-5 w-5 text-blue-600" />
                              <span className="font-semibold text-gray-700">Tema</span>
                            </div>
                            <p className="text-gray-900 font-medium">{submission.tema}</p>
                          </div>

                          <div className="p-4 bg-white rounded-lg border border-blue-100 shadow-sm">
                            <div className="flex items-center space-x-3 mb-2">
                              <Users className="h-5 w-5 text-blue-600" />
                              <span className="font-semibold text-gray-700">Petugas Pelaksana</span>
                            </div>
                            <p className="text-gray-900 font-medium">{submission.petugasPelaksana}</p>
                          </div>

                          <div className="p-4 bg-white rounded-lg border border-blue-100 shadow-sm">
                            <div className="flex items-center space-x-3 mb-2">
                              <Calendar className="h-5 w-5 text-blue-600" />
                              <span className="font-semibold text-gray-700">Tanggal Order</span>
                            </div>
                            <p className="text-gray-900 font-medium">{formatDate(submission.tanggalOrder)}</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="p-4 bg-white rounded-lg border border-blue-100 shadow-sm">
                            <div className="flex items-center space-x-3 mb-2">
                              <Activity className="h-5 w-5 text-blue-600" />
                              <span className="font-semibold text-gray-700">Jenis Media</span>
                            </div>
                            <p className="text-gray-900 font-medium capitalize">{submission.jenisMedia}</p>
                          </div>

                          <div className="p-4 bg-white rounded-lg border border-blue-100 shadow-sm">
                            <div className="flex items-center space-x-3 mb-2">
                              <Eye className="h-5 w-5 text-blue-600" />
                              <span className="font-semibold text-gray-700">Supervisor</span>
                            </div>
                            <p className="text-gray-900 font-medium">{submission.supervisor}</p>
                          </div>

                          <div className="p-4 bg-white rounded-lg border border-blue-100 shadow-sm">
                            <div className="flex items-center space-x-3 mb-2">
                              <Layers className="h-5 w-5 text-blue-600" />
                              <span className="font-semibold text-gray-700">Total Konten</span>
                            </div>
                            <p className="text-gray-900 font-medium">{contentItems.length} item</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Content Statistics */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
                      <CardContent className="p-6 text-center">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg"
                        >
                          <CheckCircle className="h-6 w-6 text-white" />
                        </motion.div>
                        <p className="text-3xl font-bold text-green-800 mb-1">{approvedItems.length}</p>
                        <p className="text-green-700 font-medium">Disetujui</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200 shadow-lg">
                      <CardContent className="p-6 text-center">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: -5 }}
                          className="w-12 h-12 bg-gradient-to-r from-red-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg"
                        >
                          <XCircle className="h-6 w-6 text-white" />
                        </motion.div>
                        <p className="text-3xl font-bold text-red-800 mb-1">{rejectedItems.length}</p>
                        <p className="text-red-700 font-medium">Ditolak</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200 shadow-lg">
                      <CardContent className="p-6 text-center">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg"
                        >
                          <Clock className="h-6 w-6 text-white" />
                        </motion.div>
                        <p className="text-3xl font-bold text-orange-800 mb-1">{pendingItems.length}</p>
                        <p className="text-orange-700 font-medium">Pending</p>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>

                {/* Content Items List */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                  <Card className="bg-white border-gray-200 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                          <Layers className="h-6 w-6 mr-3 text-indigo-600" />
                          Daftar Konten ({contentItems.length})
                        </h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowDetails(!showDetails)}
                          className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                        >
                          {showDetails ? "Sembunyikan" : "Tampilkan"} Detail
                          <ArrowRight className={cn("h-4 w-4 ml-2 transition-transform", showDetails && "rotate-90")} />
                        </Button>
                      </div>

                      <AnimatePresence>
                        {showDetails && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4"
                          >
                            {contentItems.map((item, index) => (
                              <ValidationItem key={item.id} item={item} index={index} />
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {!showDetails && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {contentItems.slice(0, 6).map((item, index) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                              className="p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200"
                            >
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">
                                  {item.jenisKonten === "video"
                                    ? "🎬"
                                    : item.jenisKonten === "audio"
                                      ? "🎵"
                                      : item.jenisKonten === "fotografis"
                                        ? "📸"
                                        : "📄"}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 text-sm truncate">{item.nama}</p>
                                  <p className="text-xs text-gray-600 capitalize">
                                    {item.jenisKonten.replace("-", " ")}
                                  </p>
                                </div>
                                {item.status === "approved" && <CheckCircle className="h-4 w-4 text-green-600" />}
                                {item.status === "rejected" && <XCircle className="h-4 w-4 text-red-600" />}
                                {(!item.status || item.status === "pending") && (
                                  <Clock className="h-4 w-4 text-orange-600" />
                                )}
                              </div>
                            </motion.div>
                          ))}
                          {contentItems.length > 6 && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 flex items-center justify-center"
                            >
                              <p className="text-indigo-600 font-medium text-sm">
                                +{contentItems.length - 6} konten lainnya
                              </p>
                            </motion.div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Enhanced Warning Notice */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                  <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                          className="flex-shrink-0"
                        >
                          <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                            <AlertTriangle className="h-6 w-6 text-white" />
                          </div>
                        </motion.div>
                        <div className="flex-1">
                          <h4 className="font-bold text-amber-800 text-lg mb-2">Perhatian Penting!</h4>
                          <div className="space-y-2 text-amber-700">
                            <p className="flex items-center">
                              <Zap className="h-4 w-4 mr-2 text-amber-600" />
                              Pastikan semua informasi sudah benar sebelum mengirim
                            </p>
                            <p className="flex items-center">
                              <Zap className="h-4 w-4 mr-2 text-amber-600" />
                              Dokumen yang sudah dikirim tidak dapat diubah
                            </p>
                            <p className="flex items-center">
                              <Zap className="h-4 w-4 mr-2 text-amber-600" />
                              Proses review akan dimulai setelah pengajuan dikirim
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </ScrollArea>

            {/* Enhanced Action Buttons */}
            <div className="flex items-center justify-center space-x-4 pt-6 border-t border-gray-200">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                  className="px-8 py-3 border-2 border-gray-300 hover:border-gray-400 bg-transparent"
                >
                  Batal
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={onConfirm}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Lanjutkan ke Konfirmasi
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

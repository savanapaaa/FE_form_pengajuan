"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  CheckCircle,
  FileText,
  Calendar,
  User,
  Clock,
  Eye,
  Target,
  Activity,
  Layers,
  Sparkles,
  Star,
  Crown,
  Heart,
  Diamond,
  Zap,
  Send,
  Rocket,
  ArrowRight,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

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

interface DocumentSentDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  submission: Submission | null
  onClose: () => void
}

// Enhanced confetti with multiple shapes and colors
const EnhancedConfetti = () => {
  const shapes = [
    { component: Star, color: "text-yellow-400" },
    { component: Crown, color: "text-purple-400" },
    { component: Heart, color: "text-pink-400" },
    { component: Diamond, color: "text-blue-400" },
    { component: Sparkles, color: "text-green-400" },
    { component: Zap, color: "text-orange-400" },
  ]

  const circles = ["●", "◆", "▲", "■", "♦", "★"]
  const colors = [
    "text-red-400",
    "text-blue-400",
    "text-green-400",
    "text-yellow-400",
    "text-purple-400",
    "text-pink-400",
    "text-indigo-400",
    "text-cyan-400",
  ]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Icon confetti */}
      {[...Array(30)].map((_, i) => {
        const shape = shapes[i % shapes.length]
        const ShapeComponent = shape.component
        return (
          <motion.div
            key={`icon-${i}`}
            className={`absolute ${shape.color}`}
            initial={{
              x: Math.random() * 600,
              y: -50,
              rotate: 0,
              scale: 0,
            }}
            animate={{
              y: 800,
              rotate: Math.random() * 720 - 360,
              scale: [0, 1, 0.8, 1, 0],
              x: Math.random() * 600,
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              ease: "easeOut",
              delay: Math.random() * 2,
            }}
          >
            <ShapeComponent className="h-6 w-6" />
          </motion.div>
        )
      })}

      {/* Circle confetti */}
      {[...Array(40)].map((_, i) => (
        <motion.div
          key={`circle-${i}`}
          className={`absolute text-2xl ${colors[i % colors.length]} opacity-80`}
          initial={{
            x: Math.random() * 600,
            y: -50,
            rotate: 0,
            scale: 0,
          }}
          animate={{
            y: 800,
            rotate: Math.random() * 720 - 360,
            scale: [0, 1.2, 0.8, 1, 0],
            x: Math.random() * 600,
          }}
          transition={{
            duration: Math.random() * 4 + 2,
            ease: "easeOut",
            delay: Math.random() * 2,
          }}
        >
          {circles[i % circles.length]}
        </motion.div>
      ))}
    </div>
  )
}

// Flying papers animation
const FlyingPapers = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{
            x: -100,
            y: Math.random() * 400 + 100,
            rotate: -45,
            scale: 0,
          }}
          animate={{
            x: 700,
            y: Math.random() * 400 + 100,
            rotate: 45,
            scale: [0, 1, 1, 0],
          }}
          transition={{
            duration: 3,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        >
          <div className="relative">
            <FileText className="h-8 w-8 text-blue-500" />
            {/* Trail effect */}
            <motion.div
              className="absolute inset-0 bg-blue-400 rounded opacity-30"
              animate={{
                scale: [1, 1.5, 2],
                opacity: [0.3, 0.1, 0],
              }}
              transition={{
                duration: 0.5,
                repeat: Number.POSITIVE_INFINITY,
              }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Orbiting elements around main icon
const OrbitingElements = () => {
  const elements = [
    { icon: FileText, color: "from-blue-400 to-blue-500" },
    { icon: CheckCircle, color: "from-green-400 to-green-500" },
    { icon: Star, color: "from-yellow-400 to-yellow-500" },
    { icon: Crown, color: "from-purple-400 to-purple-500" },
    { icon: Heart, color: "from-pink-400 to-pink-500" },
    { icon: Sparkles, color: "from-cyan-400 to-cyan-500" },
  ]

  return (
    <div className="absolute inset-0">
      {elements.map((element, i) => {
        const Icon = element.icon
        return (
          <motion.div
            key={i}
            className={`absolute w-10 h-10 bg-gradient-to-r ${element.color} rounded-full flex items-center justify-center shadow-lg`}
            style={{
              top: "50%",
              left: "50%",
              transformOrigin: "0 0",
            }}
            animate={{
              rotate: [0, 360],
              x: [0, 80 * Math.cos((i * 60 * Math.PI) / 180)],
              y: [0, 80 * Math.sin((i * 60 * Math.PI) / 180)],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 6,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
              delay: i * 0.3,
            }}
          >
            <Icon className="h-5 w-5 text-white" />
          </motion.div>
        )
      })}
    </div>
  )
}

export function DocumentSentDialog({ isOpen, onOpenChange, submission, onClose }: DocumentSentDialogProps) {
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Show sending animation first
      setShowSuccess(false)
      // Then show success after 3 seconds
      const timer = setTimeout(() => {
        setShowSuccess(true)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!submission) return null

  const contentItems = submission.contentItems || []
  const approvedItems = contentItems.filter((item) => item.status === "approved")

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-green-50 via-white to-blue-50 border-0 shadow-2xl">
        <div className="relative">
          <EnhancedConfetti />
          {!showSuccess && <FlyingPapers />}

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative z-10"
          >
            <AnimatePresence mode="wait">
              {!showSuccess ? (
                <motion.div
                  key="sending"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  {/* Sending Animation */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="mx-auto mb-6 relative"
                  >
                    <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl">
                      <motion.div
                        animate={{ x: [0, 10, 0], y: [0, -5, 0] }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                      >
                        <Send className="h-12 w-12 text-white" />
                      </motion.div>
                    </div>
                    {/* Pulsing rings */}
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                      className="absolute inset-0 border-4 border-blue-400 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
                      className="absolute inset-0 border-4 border-green-400 rounded-full"
                    />
                  </motion.div>

                  <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4">
                    Mengirim Dokumen...
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 text-lg mb-8">
                    Dokumen Anda sedang dikirim ke sistem. Mohon tunggu sebentar...
                  </DialogDescription>

                  {/* Progress indicators */}
                  <div className="flex justify-center space-x-2 mb-8">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-3 h-3 bg-blue-500 rounded-full"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Number.POSITIVE_INFINITY,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>

                  <p className="text-gray-500">
                    Memproses dokumen <span className="font-semibold text-blue-600">{submission.noComtab}</span>
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative"
                >
                  {/* Success Header */}
                  <DialogHeader className="text-center pb-6 border-b border-gradient-to-r from-green-200 to-blue-200">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="mx-auto mb-4 relative"
                    >
                      <div className="w-28 h-28 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl">
                        <CheckCircle className="h-14 w-14 text-white" />
                      </div>
                      <OrbitingElements />
                      {/* Multiple rings with different animations */}
                      <motion.div
                        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        className="absolute inset-0 border-4 border-green-300 rounded-full opacity-40"
                      />
                      <motion.div
                        animate={{ rotate: -360, scale: [1, 1.2, 1] }}
                        transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        className="absolute inset-2 border-4 border-blue-300 rounded-full opacity-30"
                      />
                      <motion.div
                        animate={{ rotate: 360, scale: [1, 1.3, 1] }}
                        transition={{ duration: 16, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        className="absolute inset-4 border-4 border-purple-300 rounded-full opacity-20"
                      />
                      {/* Floating sparkles */}
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-3 h-3 bg-yellow-400 rounded-full"
                          style={{
                            top: "50%",
                            left: "50%",
                            transformOrigin: "0 0",
                          }}
                          animate={{
                            rotate: [0, 360],
                            scale: [0, 1, 0],
                            x: [0, 60 * Math.cos((i * 45 * Math.PI) / 180)],
                            y: [0, 60 * Math.sin((i * 45 * Math.PI) / 180)],
                            opacity: [0, 1, 0],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: i * 0.2,
                            ease: "easeInOut",
                          }}
                        />
                      ))}
                    </motion.div>

                    <DialogTitle className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                      Dokumen Berhasil Dikirim!
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 mt-2 text-lg">
                      Pengajuan Anda telah berhasil dikirim dan akan segera diproses
                    </DialogDescription>
                  </DialogHeader>

                  <div className="px-6 py-6 space-y-6">
                    {/* Enhanced Document Info Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 shadow-lg">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-green-900 flex items-center">
                              <FileText className="h-6 w-6 mr-3 text-green-600" />
                              Detail Dokumen
                            </h3>
                            <Badge className="bg-gradient-to-r from-green-100 to-blue-100 text-green-800 border-green-200 px-4 py-2">
                              <Star className="h-4 w-4 mr-2" />
                              {submission.noComtab}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div className="p-4 bg-white rounded-lg border border-green-100 shadow-sm">
                                <div className="flex items-center space-x-3 mb-2">
                                  <Target className="h-5 w-5 text-green-600" />
                                  <span className="font-semibold text-gray-700">Tema</span>
                                </div>
                                <p className="text-gray-900 font-medium">{submission.tema}</p>
                              </div>

                              <div className="p-4 bg-white rounded-lg border border-green-100 shadow-sm">
                                <div className="flex items-center space-x-3 mb-2">
                                  <User className="h-5 w-5 text-green-600" />
                                  <span className="font-semibold text-gray-700">Petugas</span>
                                </div>
                                <p className="text-gray-900 font-medium">{submission.petugasPelaksana}</p>
                              </div>

                              <div className="p-4 bg-white rounded-lg border border-green-100 shadow-sm">
                                <div className="flex items-center space-x-3 mb-2">
                                  <Calendar className="h-5 w-5 text-green-600" />
                                  <span className="font-semibold text-gray-700">Tanggal Submit</span>
                                </div>
                                <p className="text-gray-900 font-medium">{formatDate(submission.tanggalSubmit)}</p>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="p-4 bg-white rounded-lg border border-green-100 shadow-sm">
                                <div className="flex items-center space-x-3 mb-2">
                                  <Activity className="h-5 w-5 text-green-600" />
                                  <span className="font-semibold text-gray-700">Jenis Media</span>
                                </div>
                                <p className="text-gray-900 font-medium capitalize">{submission.jenisMedia}</p>
                              </div>

                              <div className="p-4 bg-white rounded-lg border border-green-100 shadow-sm">
                                <div className="flex items-center space-x-3 mb-2">
                                  <Eye className="h-5 w-5 text-green-600" />
                                  <span className="font-semibold text-gray-700">Supervisor</span>
                                </div>
                                <p className="text-gray-900 font-medium">{submission.supervisor}</p>
                              </div>

                              <div className="p-4 bg-white rounded-lg border border-green-100 shadow-sm">
                                <div className="flex items-center space-x-3 mb-2">
                                  <Layers className="h-5 w-5 text-green-600" />
                                  <span className="font-semibold text-gray-700">Total Konten</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                  <span className="text-gray-900 font-medium">{contentItems.length} item</span>
                                  {approvedItems.length > 0 && (
                                    <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      {approvedItems.length} disetujui
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Next Steps Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-lg">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4 mb-4">
                            <motion.div
                              animate={{ rotate: [0, 10, -10, 0] }}
                              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                              className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
                            >
                              <Clock className="h-6 w-6 text-white" />
                            </motion.div>
                            <div>
                              <h4 className="font-bold text-blue-900 text-lg">Langkah Selanjutnya</h4>
                              <p className="text-blue-700 text-sm">Proses yang akan terjadi setelah ini</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-100">
                              <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm">1</span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Review Dokumen</p>
                                <p className="text-sm text-gray-600">Tim akan mereview dokumen Anda</p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-100">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm">2</span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Validasi Output</p>
                                <p className="text-sm text-gray-600">Validasi hasil produksi konten</p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-100">
                              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm">3</span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Publikasi</p>
                                <p className="text-sm text-gray-600">Konten yang disetujui akan dipublikasikan</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Important Notice */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-lg">
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <motion.div
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                              className="flex-shrink-0"
                            >
                              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                                <Sparkles className="h-6 w-6 text-white" />
                              </div>
                            </motion.div>
                            <div className="flex-1">
                              <h4 className="font-bold text-amber-800 text-lg mb-2">Penting untuk Diingat!</h4>
                              <div className="space-y-2 text-amber-700">
                                <p className="flex items-center">
                                  <Zap className="h-4 w-4 mr-2 text-amber-600" />
                                  Simpan No. Comtab <strong>{submission.noComtab}</strong> untuk referensi
                                </p>
                                <p className="flex items-center">
                                  <Zap className="h-4 w-4 mr-2 text-amber-600" />
                                  Anda akan mendapat notifikasi saat dokumen diproses
                                </p>
                                <p className="flex items-center">
                                  <Zap className="h-4 w-4 mr-2 text-amber-600" />
                                  Cek status dokumen secara berkala di halaman riwayat
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>

                  {/* Enhanced Action Button */}
                  <div className="flex items-center justify-center pt-6 border-t border-gray-200">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={onClose}
                        className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg"
                      >
                        <Rocket className="h-5 w-5 mr-2" />
                        Selesai
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

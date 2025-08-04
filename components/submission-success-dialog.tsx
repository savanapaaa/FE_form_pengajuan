"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  CheckCircle,
  Copy,
  FileText,
  Calendar,
  User,
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
  AlertTriangle,
  Shield,
  Lock,
  Key,
  ArrowRight,
  Home,
  History,
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

interface SubmissionSuccessDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  submission: Submission | null
  onGoHome: () => void
  onViewHistory: () => void
}

// Massive confetti explosion with special shapes
const MassiveConfetti = () => {
  const specialShapes = [
    { component: Star, color: "text-yellow-400", size: "h-8 w-8" },
    { component: Crown, color: "text-purple-400", size: "h-7 w-7" },
    { component: Heart, color: "text-pink-400", size: "h-6 w-6" },
    { component: Diamond, color: "text-blue-400", size: "h-6 w-6" },
    { component: Sparkles, color: "text-green-400", size: "h-7 w-7" },
    { component: Zap, color: "text-orange-400", size: "h-6 w-6" },
    { component: Shield, color: "text-indigo-400", size: "h-6 w-6" },
    { component: Key, color: "text-cyan-400", size: "h-5 w-5" },
  ]

  const circles = ["●", "◆", "▲", "■", "♦", "★", "♠", "♣", "♥", "◉", "◎", "○"]
  const colors = [
    "text-red-400",
    "text-blue-400",
    "text-green-400",
    "text-yellow-400",
    "text-purple-400",
    "text-pink-400",
    "text-indigo-400",
    "text-cyan-400",
    "text-orange-400",
    "text-emerald-400",
    "text-violet-400",
    "text-rose-400",
  ]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Special icon confetti - larger and more prominent */}
      {[...Array(40)].map((_, i) => {
        const shape = specialShapes[i % specialShapes.length]
        const ShapeComponent = shape.component
        return (
          <motion.div
            key={`special-${i}`}
            className={`absolute ${shape.color}`}
            initial={{
              x: Math.random() * 800,
              y: -100,
              rotate: 0,
              scale: 0,
            }}
            animate={{
              y: 1000,
              rotate: Math.random() * 1440 - 720,
              scale: [0, 1.5, 1, 1.2, 0],
              x: Math.random() * 800,
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              ease: "easeOut",
              delay: Math.random() * 3,
            }}
          >
            <ShapeComponent className={shape.size} />
          </motion.div>
        )
      })}

      {/* Regular circle confetti - more quantity */}
      {[...Array(60)].map((_, i) => (
        <motion.div
          key={`circle-${i}`}
          className={`absolute text-3xl ${colors[i % colors.length]} opacity-90`}
          initial={{
            x: Math.random() * 800,
            y: -100,
            rotate: 0,
            scale: 0,
          }}
          animate={{
            y: 1000,
            rotate: Math.random() * 1440 - 720,
            scale: [0, 1.8, 1.2, 1.5, 0],
            x: Math.random() * 800,
          }}
          transition={{
            duration: Math.random() * 5 + 3,
            ease: "easeOut",
            delay: Math.random() * 3,
          }}
        >
          {circles[i % circles.length]}
        </motion.div>
      ))}

      {/* Burst effect from center */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`burst-${i}`}
          className="absolute w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
          style={{
            top: "50%",
            left: "50%",
            transformOrigin: "0 0",
          }}
          initial={{ scale: 0, x: 0, y: 0 }}
          animate={{
            scale: [0, 1, 0.8, 0],
            x: [0, (Math.random() - 0.5) * 600],
            y: [0, (Math.random() - 0.5) * 600],
            rotate: [0, Math.random() * 720],
          }}
          transition={{
            duration: 2,
            ease: "easeOut",
            delay: i * 0.05,
          }}
        />
      ))}
    </div>
  )
}

export function SubmissionSuccessDialog({
  isOpen,
  onOpenChange,
  submission,
  onGoHome,
  onViewHistory,
}: SubmissionSuccessDialogProps) {
  const [copiedComtab, setCopiedComtab] = useState(false)
  const [copiedPin, setCopiedPin] = useState(false)

  if (!submission) return null

  const contentItems = submission.contentItems || []
  const approvedItems = contentItems.filter((item) => item.status === "approved")

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const copyToClipboard = async (text: string, type: "comtab" | "pin") => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === "comtab") {
        setCopiedComtab(true)
        setTimeout(() => setCopiedComtab(false), 2000)
      } else {
        setCopiedPin(true)
        setTimeout(() => setCopiedPin(false), 2000)
      }
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-blue-50 border-0 shadow-2xl">
        <div className="relative">
          <MassiveConfetti />

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="relative z-10"
          >
            {/* Enhanced Success Header */}
            <DialogHeader className="text-center pb-8 border-b border-gradient-to-r from-emerald-200 to-blue-200">
              <motion.div
                initial={{ scale: 0, rotate: -360 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
                className="mx-auto mb-6 relative"
              >
                <div className="w-32 h-32 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl">
                  <CheckCircle className="h-16 w-16 text-white" />
                </div>
                {/* Multiple animated rings */}
                <motion.div
                  animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                  transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="absolute inset-0 border-4 border-emerald-300 rounded-full opacity-50"
                />
                <motion.div
                  animate={{ rotate: -360, scale: [1, 1.2, 1] }}
                  transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="absolute inset-2 border-4 border-blue-300 rounded-full opacity-40"
                />
                <motion.div
                  animate={{ rotate: 360, scale: [1, 1.3, 1] }}
                  transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="absolute inset-4 border-4 border-purple-300 rounded-full opacity-30"
                />
                {/* Floating success icons */}
                {[Star, Crown, Heart, Diamond, Sparkles, Zap, Shield, Key].map((Icon, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-6 h-6 text-yellow-400"
                    style={{
                      top: "50%",
                      left: "50%",
                      transformOrigin: "0 0",
                    }}
                    animate={{
                      rotate: [0, 360],
                      scale: [0, 1.5, 1, 1.2, 0],
                      x: [0, 80 * Math.cos((i * 45 * Math.PI) / 180)],
                      y: [0, 80 * Math.sin((i * 45 * Math.PI) / 180)],
                      opacity: [0, 1, 1, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 0.3,
                      ease: "easeInOut",
                    }}
                  >
                    <Icon className="h-6 w-6" />
                  </motion.div>
                ))}
              </motion.div>

              <DialogTitle className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
                🎉 Pengajuan Berhasil Dikirim! 🎉
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-xl">
                Dokumen Anda telah berhasil disubmit dan siap untuk diproses
              </DialogDescription>
            </DialogHeader>

            <div className="px-8 py-8 space-y-8">
              {/* Enhanced Credentials Display */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {/* No. Comtab Card */}
                <Card className="bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                          className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg"
                        >
                          <FileText className="h-6 w-6 text-white" />
                        </motion.div>
                        <div>
                          <Label className="text-lg font-bold text-emerald-900">No. Comtab</Label>
                          <p className="text-emerald-700 text-sm">Nomor referensi dokumen</p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                        <Star className="h-3 w-3 mr-1" />
                        Penting
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Input
                          value={submission.noComtab}
                          readOnly
                          className="font-mono text-xl font-bold text-center bg-white border-2 border-emerald-300 text-emerald-900"
                        />
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(submission.noComtab, "comtab")}
                            className="border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                          >
                            {copiedComtab ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </motion.div>
                      </div>
                      <AnimatePresence>
                        {copiedComtab && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-emerald-600 text-sm font-medium flex items-center"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Berhasil disalin!
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>

                {/* PIN Card */}
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                          className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg"
                        >
                          <Lock className="h-6 w-6 text-white" />
                        </motion.div>
                        <div>
                          <Label className="text-lg font-bold text-blue-900">PIN Dokumen</Label>
                          <p className="text-blue-700 text-sm">Kode keamanan dokumen</p>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        <Shield className="h-3 w-3 mr-1" />
                        Rahasia
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Input
                          value={submission.pin}
                          readOnly
                          type="password"
                          className="font-mono text-xl font-bold text-center bg-white border-2 border-blue-300 text-blue-900"
                        />
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(submission.pin, "pin")}
                            className="border-blue-300 text-blue-600 hover:bg-blue-50"
                          >
                            {copiedPin ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </motion.div>
                      </div>
                      <AnimatePresence>
                        {copiedPin && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-blue-600 text-sm font-medium flex items-center"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Berhasil disalin!
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Enhanced Document Summary */}
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 shadow-lg">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-purple-900 flex items-center">
                        <Sparkles className="h-7 w-7 mr-3 text-purple-600" />
                        Ringkasan Dokumen
                      </h3>
                      <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200 px-4 py-2">
                        <Crown className="h-4 w-4 mr-2" />
                        Berhasil Disubmit
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="p-4 bg-white rounded-lg border border-purple-100 shadow-sm">
                        <div className="flex items-center space-x-3 mb-3">
                          <Target className="h-6 w-6 text-purple-600" />
                          <span className="font-semibold text-gray-700">Tema</span>
                        </div>
                        <p className="text-gray-900 font-medium">{submission.tema}</p>
                      </div>

                      <div className="p-4 bg-white rounded-lg border border-purple-100 shadow-sm">
                        <div className="flex items-center space-x-3 mb-3">
                          <User className="h-6 w-6 text-purple-600" />
                          <span className="font-semibold text-gray-700">Petugas</span>
                        </div>
                        <p className="text-gray-900 font-medium">{submission.petugasPelaksana}</p>
                      </div>

                      <div className="p-4 bg-white rounded-lg border border-purple-100 shadow-sm">
                        <div className="flex items-center space-x-3 mb-3">
                          <Activity className="h-6 w-6 text-purple-600" />
                          <span className="font-semibold text-gray-700">Jenis Media</span>
                        </div>
                        <p className="text-gray-900 font-medium capitalize">{submission.jenisMedia}</p>
                      </div>

                      <div className="p-4 bg-white rounded-lg border border-purple-100 shadow-sm">
                        <div className="flex items-center space-x-3 mb-3">
                          <Eye className="h-6 w-6 text-purple-600" />
                          <span className="font-semibold text-gray-700">Supervisor</span>
                        </div>
                        <p className="text-gray-900 font-medium">{submission.supervisor}</p>
                      </div>

                      <div className="p-4 bg-white rounded-lg border border-purple-100 shadow-sm">
                        <div className="flex items-center space-x-3 mb-3">
                          <Calendar className="h-6 w-6 text-purple-600" />
                          <span className="font-semibold text-gray-700">Tanggal Submit</span>
                        </div>
                        <p className="text-gray-900 font-medium">{formatDate(submission.tanggalSubmit)}</p>
                      </div>

                      <div className="p-4 bg-white rounded-lg border border-purple-100 shadow-sm">
                        <div className="flex items-center space-x-3 mb-3">
                          <Layers className="h-6 w-6 text-purple-600" />
                          <span className="font-semibold text-gray-700">Total Konten</span>
                        </div>
                        <div className="flex items-center space-x-3">
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
                  </CardContent>
                </Card>
              </motion.div>

              {/* Enhanced Important Notice */}
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-lg">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-4">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                        className="flex-shrink-0"
                      >
                        <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                          <AlertTriangle className="h-8 w-8 text-white" />
                        </div>
                      </motion.div>
                      <div className="flex-1">
                        <h4 className="font-bold text-amber-800 text-2xl mb-4">Penting untuk Diingat!</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3 text-amber-700">
                            <p className="flex items-center">
                              <Zap className="h-5 w-5 mr-3 text-amber-600" />
                              <strong>Simpan No. Comtab dan PIN</strong> dengan aman
                            </p>
                            <p className="flex items-center">
                              <Zap className="h-5 w-5 mr-3 text-amber-600" />
                              Gunakan untuk <strong>tracking status</strong> dokumen
                            </p>
                            <p className="flex items-center">
                              <Zap className="h-5 w-5 mr-3 text-amber-600" />
                              <strong>Notifikasi</strong> akan dikirim saat ada update
                            </p>
                          </div>
                          <div className="space-y-3 text-amber-700">
                            <p className="flex items-center">
                              <Zap className="h-5 w-5 mr-3 text-amber-600" />
                              Cek <strong>halaman riwayat</strong> secara berkala
                            </p>
                            <p className="flex items-center">
                              <Zap className="h-5 w-5 mr-3 text-amber-600" />
                              Proses review akan <strong>segera dimulai</strong>
                            </p>
                            <p className="flex items-center">
                              <Zap className="h-5 w-5 mr-3 text-amber-600" />
                              <strong>Jangan bagikan PIN</strong> kepada orang lain
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex items-center justify-center space-x-6 pt-8 border-t border-gray-200">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={onViewHistory}
                  variant="outline"
                  className="px-8 py-4 border-2 border-blue-300 text-blue-600 hover:bg-blue-50 bg-transparent text-lg"
                >
                  <History className="h-5 w-5 mr-3" />
                  Lihat Riwayat
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={onGoHome}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white shadow-lg text-lg"
                >
                  <Home className="h-5 w-5 mr-3" />
                  Kembali ke Beranda
                  <ArrowRight className="h-5 w-5 ml-3" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

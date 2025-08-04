"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Send,
  Shield,
  FileText,
  CheckCircle,
  Calendar,
  Target,
  Activity,
  Layers,
  Star,
  Zap,
  ArrowRight,
  Lock,
  Eye,
  Users,
  AlertCircle,
  Rocket,
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

interface EnhancedConfirmationDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  submission: Submission | null
  onConfirm: () => void
  isSubmitting: boolean
}

// Floating particles with multiple shapes
const FloatingParticles = () => {
  const shapes = ["●", "★", "♦", "▲", "■"]
  const colors = ["text-blue-400", "text-indigo-400", "text-purple-400", "text-pink-400", "text-cyan-400"]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(25)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute text-lg ${colors[i % colors.length]} opacity-60`}
          initial={{
            x: Math.random() * 500,
            y: Math.random() * 700,
          }}
          animate={{
            x: Math.random() * 500,
            y: Math.random() * 700,
            rotate: [0, 360],
            scale: [0.5, 1.2, 0.5],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: Math.random() * 4 + 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          {shapes[i % shapes.length]}
        </motion.div>
      ))}
    </div>
  )
}

// Orbiting icons around main icon
const OrbitingIcons = () => {
  const icons = [FileText, Users, Calendar, Target, Activity, Layers]

  return (
    <div className="absolute inset-0">
      {icons.map((Icon, i) => (
        <motion.div
          key={i}
          className="absolute w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg"
          style={{
            top: "50%",
            left: "50%",
            transformOrigin: "0 0",
          }}
          animate={{
            rotate: [0, 360],
            x: [0, 60 * Math.cos((i * 60 * Math.PI) / 180)],
            y: [0, 60 * Math.sin((i * 60 * Math.PI) / 180)],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
            delay: i * 0.5,
          }}
        >
          <Icon className="h-4 w-4 text-white" />
        </motion.div>
      ))}
    </div>
  )
}

// Processing steps animation
const ProcessingSteps = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { icon: FileText, label: "Validasi Data", color: "from-blue-500 to-blue-600" },
    { icon: Shield, label: "Verifikasi Keamanan", color: "from-green-500 to-green-600" },
    { icon: Send, label: "Mengirim Dokumen", color: "from-purple-500 to-purple-600" },
  ]

  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const Icon = step.icon
        const isActive = index === currentStep
        const isCompleted = index < currentStep

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
            className={cn(
              "flex items-center space-x-4 p-4 rounded-xl border-2 transition-all duration-300",
              isActive
                ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 shadow-lg"
                : isCompleted
                  ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300"
                  : "bg-gray-50 border-gray-200",
            )}
          >
            <motion.div
              animate={isActive ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-r",
                isActive ? step.color : isCompleted ? "from-green-500 to-green-600" : "from-gray-400 to-gray-500",
              )}
            >
              {isCompleted ? <CheckCircle className="h-6 w-6 text-white" /> : <Icon className="h-6 w-6 text-white" />}
            </motion.div>
            <div className="flex-1">
              <p
                className={cn(
                  "font-semibold",
                  isActive ? "text-blue-900" : isCompleted ? "text-green-900" : "text-gray-600",
                )}
              >
                {step.label}
              </p>
              <p className="text-sm text-gray-500">
                {isCompleted ? "Selesai" : isActive ? "Sedang diproses..." : "Menunggu"}
              </p>
            </div>
            {isActive && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
              />
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

export function EnhancedConfirmationDialog({
  isOpen,
  onOpenChange,
  submission,
  onConfirm,
  isSubmitting,
}: EnhancedConfirmationDialogProps) {
  const [pin, setPin] = useState("")
  const [currentStep, setCurrentStep] = useState(0)
  const [showProcessing, setShowProcessing] = useState(false)

  useEffect(() => {
    if (isSubmitting && !showProcessing) {
      setShowProcessing(true)
      setCurrentStep(0)

      // Simulate processing steps
      const timer1 = setTimeout(() => setCurrentStep(1), 1000)
      const timer2 = setTimeout(() => setCurrentStep(2), 2500)
      const timer3 = setTimeout(() => setCurrentStep(3), 4000)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    }
  }, [isSubmitting, showProcessing])

  useEffect(() => {
    if (isOpen) {
      setPin("")
      setShowProcessing(false)
      setCurrentStep(0)
    }
  }, [isOpen])

  if (!submission) return null

  const contentItems = submission.contentItems || []
  const approvedItems = contentItems.filter((item) => item.status === "approved")
  const rejectedItems = contentItems.filter((item) => item.status === "rejected")

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  const handleConfirm = () => {
    if (pin === submission.pin) {
      onConfirm()
    }
  }

  const isPinValid = pin === submission.pin

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-0 shadow-2xl">
        <div className="relative">
          <FloatingParticles />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative z-10"
          >
            <AnimatePresence mode="wait">
              {!showProcessing ? (
                <motion.div key="confirmation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {/* Enhanced Header */}
                  <DialogHeader className="text-center pb-6 border-b border-gradient-to-r from-indigo-200 to-purple-200">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="mx-auto mb-4 relative"
                    >
                      <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                        <Send className="h-12 w-12 text-white" />
                      </div>
                      <OrbitingIcons />
                      {/* Pulsing rings */}
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                        className="absolute inset-0 border-4 border-indigo-300 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
                        className="absolute inset-0 border-4 border-purple-300 rounded-full"
                      />
                    </motion.div>

                    <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Konfirmasi Pengajuan
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 mt-2 text-lg">
                      Masukkan PIN untuk mengkonfirmasi pengajuan dokumen
                    </DialogDescription>
                  </DialogHeader>

                  <div className="px-6 py-6 space-y-6">
                    {/* Enhanced Summary Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 shadow-lg">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-indigo-900 flex items-center">
                              <FileText className="h-6 w-6 mr-3 text-indigo-600" />
                              Ringkasan Pengajuan
                            </h3>
                            <Badge className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border-indigo-200 px-4 py-2">
                              <Star className="h-4 w-4 mr-2" />
                              {submission.noComtab}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div className="p-4 bg-white rounded-lg border border-indigo-100 shadow-sm">
                                <div className="flex items-center space-x-3 mb-2">
                                  <Target className="h-5 w-5 text-indigo-600" />
                                  <span className="font-semibold text-gray-700">Tema</span>
                                </div>
                                <p className="text-gray-900 font-medium">{submission.tema}</p>
                              </div>

                              <div className="p-4 bg-white rounded-lg border border-indigo-100 shadow-sm">
                                <div className="flex items-center space-x-3 mb-2">
                                  <Users className="h-5 w-5 text-indigo-600" />
                                  <span className="font-semibold text-gray-700">Petugas</span>
                                </div>
                                <p className="text-gray-900 font-medium">{submission.petugasPelaksana}</p>
                              </div>

                              <div className="p-4 bg-white rounded-lg border border-indigo-100 shadow-sm">
                                <div className="flex items-center space-x-3 mb-2">
                                  <Calendar className="h-5 w-5 text-indigo-600" />
                                  <span className="font-semibold text-gray-700">Tanggal Order</span>
                                </div>
                                <p className="text-gray-900 font-medium">{formatDate(submission.tanggalOrder)}</p>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="p-4 bg-white rounded-lg border border-indigo-100 shadow-sm">
                                <div className="flex items-center space-x-3 mb-2">
                                  <Activity className="h-5 w-5 text-indigo-600" />
                                  <span className="font-semibold text-gray-700">Jenis Media</span>
                                </div>
                                <p className="text-gray-900 font-medium capitalize">{submission.jenisMedia}</p>
                              </div>

                              <div className="p-4 bg-white rounded-lg border border-indigo-100 shadow-sm">
                                <div className="flex items-center space-x-3 mb-2">
                                  <Eye className="h-5 w-5 text-indigo-600" />
                                  <span className="font-semibold text-gray-700">Supervisor</span>
                                </div>
                                <p className="text-gray-900 font-medium">{submission.supervisor}</p>
                              </div>

                              <div className="p-4 bg-white rounded-lg border border-indigo-100 shadow-sm">
                                <div className="flex items-center space-x-3 mb-2">
                                  <Layers className="h-5 w-5 text-indigo-600" />
                                  <span className="font-semibold text-gray-700">Total Konten</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                  <span className="text-gray-900 font-medium">{contentItems.length} item</span>
                                  <div className="flex items-center space-x-2">
                                    <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      {approvedItems.length} disetujui
                                    </Badge>
                                    {rejectedItems.length > 0 && (
                                      <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                                        {rejectedItems.length} ditolak
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Enhanced PIN Input */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 shadow-lg">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4 mb-4">
                            <motion.div
                              animate={{ rotate: [0, 5, -5, 0] }}
                              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                              className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg"
                            >
                              <Lock className="h-6 w-6 text-white" />
                            </motion.div>
                            <div>
                              <Label htmlFor="pin" className="text-lg font-bold text-purple-900">
                                Masukkan PIN Dokumen
                              </Label>
                              <p className="text-purple-700 text-sm">
                                PIN ini digunakan untuk mengamankan dokumen Anda
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <Input
                              id="pin"
                              type="password"
                              placeholder="Masukkan PIN 6 digit"
                              value={pin}
                              onChange={(e) => setPin(e.target.value)}
                              className="text-center text-2xl font-mono tracking-widest border-2 border-purple-300 focus:border-purple-500 focus:ring-purple-500 bg-white"
                              maxLength={6}
                            />

                            {pin && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={cn(
                                  "flex items-center space-x-2 p-3 rounded-lg",
                                  isPinValid
                                    ? "bg-green-100 border border-green-200"
                                    : "bg-red-100 border border-red-200",
                                )}
                              >
                                {isPinValid ? (
                                  <>
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <span className="text-green-800 font-medium">PIN valid! Siap untuk dikirim</span>
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="h-5 w-5 text-red-600" />
                                    <span className="text-red-800 font-medium">PIN tidak sesuai</span>
                                  </>
                                )}
                              </motion.div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Enhanced Security Notice */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-lg">
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <motion.div
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                              className="flex-shrink-0"
                            >
                              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                                <Shield className="h-6 w-6 text-white" />
                              </div>
                            </motion.div>
                            <div className="flex-1">
                              <h4 className="font-bold text-green-800 text-lg mb-2">Keamanan Terjamin</h4>
                              <div className="space-y-2 text-green-700">
                                <p className="flex items-center">
                                  <Zap className="h-4 w-4 mr-2 text-green-600" />
                                  Data Anda dienkripsi dengan standar keamanan tinggi
                                </p>
                                <p className="flex items-center">
                                  <Zap className="h-4 w-4 mr-2 text-green-600" />
                                  PIN hanya digunakan untuk verifikasi identitas
                                </p>
                                <p className="flex items-center">
                                  <Zap className="h-4 w-4 mr-2 text-green-600" />
                                  Dokumen akan diproses secara aman dan terpercaya
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>

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
                        onClick={handleConfirm}
                        disabled={!isPinValid || isSubmitting}
                        className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                            <Rocket className="h-5 w-5 mr-2" />
                            Kirim Dokumen
                            <ArrowRight className="h-5 w-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8"
                >
                  {/* Processing Header */}
                  <div className="text-center mb-8">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="mx-auto mb-4 w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl"
                    >
                      <Send className="h-10 w-10 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Memproses Pengajuan</h3>
                    <p className="text-gray-600">Mohon tunggu, dokumen Anda sedang diproses...</p>
                  </div>

                  {/* Processing Steps */}
                  <ProcessingSteps currentStep={currentStep} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

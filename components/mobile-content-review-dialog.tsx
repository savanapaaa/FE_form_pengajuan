"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  ImageIcon,
  Video,
  Music,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  Clock,
  User,
  Calendar,
  AlertTriangle,
  Shield,
  Send,
  Sparkles,
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
  sourceNarasi: string[]
  sourceAudioDubbing: string[]
  sourceAudioBacksound: string[]
  sourcePendukungLainnya: string[]
  tanggalOrderMasuk: Date | undefined
  tanggalJadi: Date | undefined
  tanggalTayang: Date | undefined
  keterangan: string
  status?: "pending" | "approved" | "rejected"
  alasanPenolakan?: string
  tanggalDiproses?: string
  diprosesoleh?: string
  narasiSourceType?: ("text" | "file" | "surat")[]
  audioDubbingSourceType?: ("file-audio" | "lain-lain")[]
  audioBacksoundSourceType?: ("file-audio" | "lain-lain")[]
  pendukungLainnyaSourceType?: ("video" | "foto" | "lain-lain")[]
  narasiFile?: any
  suratFile?: any
  audioDubbingFile?: any
  audioDubbingLainLainFile?: any
  audioBacksoundFile?: any
  audioBacksoundLainLainFile?: any
  pendukungVideoFile?: any
  pendukungFotoFile?: any
  pendukungLainLainFile?: any
  hasilProdukFile?: any
  hasilProdukLink?: string
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
  tanggalOrder: Date | undefined
  petugasPelaksana: string
  supervisor: string
  durasi: string
  jumlahProduksi: string
  tanggalSubmit: Date | undefined
  lastModified?: Date | undefined
  uploadedBuktiMengetahui?: any
  isConfirmed?: boolean
  tanggalKonfirmasi?: string
  contentItems?: ContentItem[]
  workflowStage?: "submitted" | "review" | "validation" | "completed"
  tanggalReview?: string
}

interface MobileContentReviewDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  submission: Submission | null
  contentItem?: ContentItem | null
  onUpdate: (submissions: Submission[]) => void
  onToast: (message: string, type: "success" | "error" | "info") => void
}

const getFileIcon = (type: string) => {
  if (type.includes("image")) return <ImageIcon className="h-4 w-4" />
  if (type.includes("video")) return <Video className="h-4 w-4" />
  if (type.includes("audio")) return <Music className="h-4 w-4" />
  return <FileText className="h-4 w-4" />
}

const getContentTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "video":
      return <Video className="h-5 w-5 text-red-500" />
    case "audio":
      return <Music className="h-5 w-5 text-purple-500" />
    case "fotografis":
      return <Eye className="h-5 w-5 text-blue-500" />
    case "infografis":
      return <FileText className="h-5 w-5 text-green-500" />
    case "naskah-berita":
      return <FileText className="h-5 w-5 text-orange-500" />
    case "bumper":
      return <Sparkles className="h-5 w-5 text-indigo-500" />
    default:
      return <FileText className="h-5 w-5 text-gray-500" />
  }
}

const formatDate = (date?: Date | string): string => {
  if (!date) return "N/A"
  const d = typeof date === "string" ? new Date(date) : date
  if (isNaN(d.getTime())) return "N/A"
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export const MobileContentReviewDialog: React.FC<MobileContentReviewDialogProps> = ({
  isOpen,
  onOpenChange,
  submission,
  contentItem,
  onUpdate,
  onToast,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [viewMode, setViewMode] = useState<"detail" | "grid">("detail")
  const [reviewDecisions, setReviewDecisions] = useState<Record<string, "approved" | "rejected" | null>>({})
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({})
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const contentItems = submission?.contentItems?.filter((item) => item.status === "pending") || []
  const currentItem = contentItem || contentItems[currentIndex]
  const totalItems = contentItems.length

  useEffect(() => {
    if (!isOpen) {
      setCurrentIndex(0)
      setReviewDecisions({})
      setRejectionReasons({})
      setShowRejectForm(false)
      setIsProcessing(false)
    }
  }, [isOpen])

  const handleNext = () => {
    if (currentIndex < totalItems - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowRejectForm(false)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setShowRejectForm(false)
    }
  }

  const handleApprove = async () => {
    if (!currentItem) return

    setIsProcessing(true)
    try {
      setReviewDecisions((prev) => ({
        ...prev,
        [currentItem.id]: "approved",
      }))

      // Move to next item or finish if last item
      if (currentIndex < totalItems - 1) {
        handleNext()
      } else {
        await handleFinishReview()
      }
    } catch (error) {
      console.error("Error approving content:", error)
      onToast("Terjadi kesalahan saat menyetujui konten", "error")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!currentItem || !rejectionReasons[currentItem.id]?.trim()) {
      onToast("Harap berikan alasan penolakan", "error")
      return
    }

    setIsProcessing(true)
    try {
      setReviewDecisions((prev) => ({
        ...prev,
        [currentItem.id]: "rejected",
      }))
      setShowRejectForm(false)

      // Move to next item or finish if last item
      if (currentIndex < totalItems - 1) {
        handleNext()
      } else {
        await handleFinishReview()
      }
    } catch (error) {
      console.error("Error rejecting content:", error)
      onToast("Terjadi kesalahan saat menolak konten", "error")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFinishReview = async () => {
    // Check if all items have been reviewed
    const allReviewed = contentItems.every((item) => reviewDecisions[item.id] !== undefined)

    if (!allReviewed) {
      onToast("Harap review semua konten terlebih dahulu", "error")
      return
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Load and update submissions
    const submissions = JSON.parse(localStorage.getItem("submissions") || "[]")
    const updatedSubmissions = submissions.map((sub: any) => {
      if (sub.id === submission?.id) {
        const updatedContentItems = sub.contentItems?.map((contentItem: any) => {
          const decision = reviewDecisions[contentItem.id]
          if (decision) {
            return {
              ...contentItem,
              status: decision,
              alasanPenolakan: decision === "rejected" ? rejectionReasons[contentItem.id] : undefined,
              tanggalDiproses: new Date().toLocaleDateString("id-ID"),
              diprosesoleh: "Admin",
            }
          }
          return contentItem
        })

        return {
          ...sub,
          contentItems: updatedContentItems,
          lastModified: new Date(),
          tanggalReview: new Date().toISOString(),
          workflowStage: "validation",
        }
      }
      return sub
    })

    localStorage.setItem("submissions", JSON.stringify(updatedSubmissions))
    onUpdate(updatedSubmissions)

    const approvedCount = Object.values(reviewDecisions).filter((d) => d === "approved").length
    const rejectedCount = Object.values(reviewDecisions).filter((d) => d === "rejected").length

    onToast(`Review selesai! ${approvedCount} konten disetujui, ${rejectedCount} konten ditolak`, "success")
    onOpenChange(false)
  }

  const handleGridItemClick = (index: number) => {
    setCurrentIndex(index)
    setViewMode("detail")
  }

  if (!submission || contentItems.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md mx-auto">
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak Ada Konten</h3>
            <p className="text-gray-600">Tidak ada konten yang perlu direview saat ini.</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto h-[90vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="flex-shrink-0 p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold text-gray-900 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-600" />
              Review Konten
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode(viewMode === "detail" ? "grid" : "detail")}
                className="p-2"
              >
                {viewMode === "detail" ? <Grid3X3 className="h-4 w-4" /> : <List className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>
                {currentIndex + 1} dari {totalItems}
              </span>
              <span>{Math.round(((currentIndex + 1) / totalItems) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentIndex + 1) / totalItems) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {viewMode === "grid" ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-4 h-full"
              >
                <ScrollArea className="h-full">
                  <div className="grid grid-cols-1 gap-3">
                    {contentItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleGridItemClick(index)}
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer transition-all duration-200",
                          index === currentIndex
                            ? "border-blue-500 bg-blue-50 shadow-md"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm",
                        )}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm text-gray-900 line-clamp-2">{item.nama}</h4>
                          <Badge className="text-xs ml-2 bg-blue-100 text-blue-800 border-blue-200">
                            {item.jenisKonten}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{formatDate(item.tanggalOrderMasuk)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {reviewDecisions[item.id] === "approved" && (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            )}
                            {reviewDecisions[item.id] === "rejected" && <XCircle className="h-3 w-3 text-red-600" />}
                            {!reviewDecisions[item.id] && <Clock className="h-3 w-3 text-orange-600" />}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </motion.div>
            ) : (
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col"
              >
                <ScrollArea className="flex-1 p-4">
                  {currentItem && (
                    <div className="space-y-4">
                      {/* Item Header */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            {getContentTypeIcon(currentItem.jenisKonten)}
                            <div>
                              <h3 className="font-bold text-lg text-gray-900 leading-tight">{currentItem.nama}</h3>
                              <p className="text-sm text-gray-600 capitalize">
                                {currentItem.jenisKonten.replace("-", " ")}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <User className="h-4 w-4" />
                            <span>Order: {formatDate(currentItem.tanggalOrderMasuk)}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>Jadi: {formatDate(currentItem.tanggalJadi)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Content Details */}
                      <div className="space-y-4">
                        {currentItem.nomorSurat && (
                          <div>
                            <Label className="text-sm font-semibold text-gray-700">Nomor Surat</Label>
                            <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded-lg mt-1">
                              {currentItem.nomorSurat}
                            </p>
                          </div>
                        )}

                        {currentItem.narasiText && (
                          <div>
                            <Label className="text-sm font-semibold text-gray-700">Narasi</Label>
                            <div className="bg-gray-50 p-3 rounded-lg mt-1 border">
                              <p className="text-sm text-gray-900 whitespace-pre-wrap">{currentItem.narasiText}</p>
                            </div>
                          </div>
                        )}

                        {currentItem.keterangan && (
                          <div>
                            <Label className="text-sm font-semibold text-gray-700">Keterangan</Label>
                            <div className="bg-gray-50 p-3 rounded-lg mt-1 border">
                              <p className="text-sm text-gray-900 whitespace-pre-wrap">{currentItem.keterangan}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Rejection Form */}
                      <AnimatePresence>
                        {showRejectForm && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3 p-4 bg-red-50 border border-red-200 rounded-lg"
                          >
                            <Label className="text-sm font-semibold text-red-900">Alasan Penolakan *</Label>
                            <Textarea
                              value={rejectionReasons[currentItem.id] || ""}
                              onChange={(e) =>
                                setRejectionReasons((prev) => ({
                                  ...prev,
                                  [currentItem.id]: e.target.value,
                                }))
                              }
                              placeholder="Jelaskan alasan penolakan konten ini..."
                              className="min-h-[80px] resize-none border-red-300 focus:border-red-500"
                              required
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </ScrollArea>

                {/* Navigation & Actions */}
                <div className="flex-shrink-0 p-4 border-t bg-white space-y-4">
                  {/* Navigation */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevious}
                      disabled={currentIndex === 0}
                      className="flex items-center space-x-2 bg-transparent"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Sebelumnya</span>
                    </Button>

                    <span className="text-sm text-gray-600">
                      {currentIndex + 1} / {totalItems}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNext}
                      disabled={currentIndex === totalItems - 1}
                      className="flex items-center space-x-2 bg-transparent"
                    >
                      <span>Selanjutnya</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    {showRejectForm ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowRejectForm(false)
                            setRejectionReasons((prev) => ({
                              ...prev,
                              [currentItem.id]: "",
                            }))
                          }}
                          disabled={isProcessing}
                        >
                          Batal
                        </Button>
                        <Button
                          onClick={handleReject}
                          disabled={!rejectionReasons[currentItem.id]?.trim() || isProcessing}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          {isProcessing ? (
                            <div className="flex items-center space-x-2">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              <span>Menolak...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <XCircle className="h-4 w-4" />
                              <span>Tolak</span>
                            </div>
                          )}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => setShowRejectForm(true)}
                          disabled={isProcessing}
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Tolak
                        </Button>
                        <Button
                          onClick={handleApprove}
                          disabled={isProcessing}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {isProcessing ? (
                            <div className="flex items-center space-x-2">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              <span>Menyetujui...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4" />
                              <span>Setujui</span>
                            </div>
                          )}
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Finish Review Button - Show when all items reviewed */}
                  {Object.keys(reviewDecisions).length === totalItems && (
                    <Button
                      onClick={handleFinishReview}
                      disabled={isProcessing}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isProcessing ? (
                        <div className="flex items-center space-x-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Menyelesaikan...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Send className="h-4 w-4" />
                          <span>Selesaikan Review</span>
                        </div>
                      )}
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default MobileContentReviewDialog

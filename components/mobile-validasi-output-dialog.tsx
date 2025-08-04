"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  Check,
  Shield,
  ThumbsUp,
  ThumbsDown,
  LinkIcon,
  X,
  AlertCircle,
  Rocket,
  FileCheck,
  MessageCircle,
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
  isTayang?: boolean
  tanggalValidasiTayang?: string
  validatorTayang?: string
  keteranganValidasi?: string
  alasanTidakTayang?: string
  tanggalTayangValidasi?: string
  hasilProdukValidasiFile?: any
  hasilProdukValidasiLink?: string
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
  isOutputValidated?: boolean
  tanggalValidasiOutput?: string
}

interface MobileValidasiOutputDialogProps {
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
      return <Shield className="h-5 w-5 text-indigo-500" />
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

// Validation Status Component
const ValidationStatus = ({
  decision,
  hasFile,
  hasLink,
  hasDate,
  hasReason,
}: {
  decision: boolean | null
  hasFile: boolean
  hasLink: boolean
  hasDate: boolean
  hasReason: boolean
}) => {
  const isValid = decision !== null && (decision === false ? hasReason : hasDate && (hasFile || hasLink))

  if (decision === null) {
    return (
      <div className="flex items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
        <Clock className="h-5 w-5 text-orange-500 mr-3" />
        <div>
          <p className="font-semibold text-orange-800 text-sm">Menunggu Keputusan</p>
          <p className="text-orange-600 text-xs">Pilih apakah konten ini tayang atau tidak</p>
        </div>
      </div>
    )
  }

  if (isValid) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200"
      >
        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
        <div>
          <p className="font-semibold text-green-800 text-sm">Validasi Lengkap</p>
          <p className="text-green-600 text-xs">{decision ? "Siap untuk tayang" : "Alasan penolakan sudah diisi"}</p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="flex items-center p-3 bg-red-50 rounded-lg border border-red-200">
      <XCircle className="h-5 w-5 text-red-500 mr-3" />
      <div>
        <p className="font-semibold text-red-800 text-sm">Validasi Belum Lengkap</p>
        <p className="text-red-600 text-xs">
          {decision === true ? "Harap isi tanggal tayang dan hasil produk" : "Harap isi alasan tidak tayang"}
        </p>
      </div>
    </div>
  )
}

// File Upload Success Indicator
const FileUploadSuccess = ({ fileName }: { fileName: string }) => (
  <motion.div
    initial={{ scale: 0.9, opacity: 0, y: 10 }}
    animate={{ scale: 1, opacity: 1, y: 0 }}
    transition={{ type: "spring", stiffness: 200 }}
    className="flex items-center p-2 bg-green-50 rounded border border-green-200 mt-2"
  >
    <FileCheck className="h-4 w-4 text-green-600 mr-2" />
    <div className="flex-1 min-w-0">
      <p className="text-xs text-green-700 font-medium">File berhasil diupload</p>
      <p className="text-xs text-green-600 truncate">{fileName}</p>
    </div>
  </motion.div>
)

// Link Input Success Indicator
const LinkInputSuccess = ({ link }: { link: string }) => (
  <motion.div
    initial={{ scale: 0.9, opacity: 0, y: 10 }}
    animate={{ scale: 1, opacity: 1, y: 0 }}
    transition={{ type: "spring", stiffness: 200 }}
    className="flex items-center p-2 bg-blue-50 rounded border border-blue-200 mt-2"
  >
    <LinkIcon className="h-4 w-4 text-blue-600 mr-2" />
    <div className="flex-1 min-w-0">
      <p className="text-xs text-blue-700 font-medium">Link berhasil ditambahkan</p>
      <p className="text-xs text-blue-600 truncate">{link}</p>
    </div>
  </motion.div>
)

// Reason Input Success Indicator
const ReasonInputSuccess = ({ reason }: { reason: string }) => (
  <motion.div
    initial={{ scale: 0.9, opacity: 0, y: 10 }}
    animate={{ scale: 1, opacity: 1, y: 0 }}
    transition={{ type: "spring", stiffness: 200 }}
    className="flex items-center p-2 bg-orange-50 rounded border border-orange-200 mt-2"
  >
    <MessageCircle className="h-4 w-4 text-orange-600 mr-2" />
    <div className="flex-1">
      <p className="text-xs text-orange-700 font-medium">Alasan tidak tayang sudah diisi</p>
      <p className="text-xs text-orange-600 line-clamp-2">{reason}</p>
    </div>
  </motion.div>
)

export const MobileValidasiOutputDialog: React.FC<MobileValidasiOutputDialogProps> = ({
  isOpen,
  onOpenChange,
  submission,
  contentItem,
  onUpdate,
  onToast,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [viewMode, setViewMode] = useState<"detail" | "grid">("detail")
  const [validationDecisions, setValidationDecisions] = useState<Record<string, boolean | null>>({})
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({})
  const [validationNotes, setValidationNotes] = useState<Record<string, string>>({})
  const [tayangDates, setTayangDates] = useState<Record<string, string>>({})
  const [hasilProdukFiles, setHasilProdukFiles] = useState<Record<string, any>>({})
  const [hasilProdukLinks, setHasilProdukLinks] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState("validation")
  const [isSaving, setIsSaving] = useState(false)

  const approvedItems = submission?.contentItems?.filter((item) => item.status === "approved") || []
  const currentItem = contentItem || approvedItems[currentIndex]
  const totalItems = approvedItems.length

  useEffect(() => {
    if (!isOpen) {
      setCurrentIndex(0)
      setValidationDecisions({})
      setRejectionReasons({})
      setValidationNotes({})
      setTayangDates({})
      setHasilProdukFiles({})
      setHasilProdukLinks({})
      setActiveTab("validation")
      setIsSaving(false)
    }
  }, [isOpen])

  const handleNext = () => {
    if (currentIndex < totalItems - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleValidationDecisionChange = (decision: boolean) => {
    if (!currentItem) return

    setValidationDecisions((prev) => ({
      ...prev,
      [currentItem.id]: decision,
    }))

    // Clear rejection reason if switching to approved
    if (decision === true) {
      setRejectionReasons((prev) => ({
        ...prev,
        [currentItem.id]: "",
      }))
    } else {
      // Clear tayang-related fields if switching to rejected
      setTayangDates((prev) => ({
        ...prev,
        [currentItem.id]: "",
      }))
      setHasilProdukFiles((prev) => ({
        ...prev,
        [currentItem.id]: null,
      }))
      setHasilProdukLinks((prev) => ({
        ...prev,
        [currentItem.id]: "",
      }))
    }
  }

  const handleValidate = async () => {
    if (!currentItem) return

    const decision = validationDecisions[currentItem.id]

    // Validate required fields
    if (decision === null || decision === undefined) {
      onToast("Harap buat keputusan validasi", "error")
      return
    }

    if (decision === false && !rejectionReasons[currentItem.id]?.trim()) {
      onToast("Harap berikan alasan tidak tayang", "error")
      return
    }

    if (decision === true) {
      const hasDate = tayangDates[currentItem.id]?.trim()
      const hasFile = hasilProdukFiles[currentItem.id]
      const hasLink = hasilProdukLinks[currentItem.id]?.trim()

      if (!hasDate) {
        onToast("Harap isi tanggal tayang", "error")
        return
      }

      if (!hasFile && !hasLink) {
        onToast("Harap upload file atau masukkan link hasil produk", "error")
        return
      }
    }

    setIsSaving(true)
    try {
      // Move to next item or finish if last item
      if (currentIndex < totalItems - 1) {
        handleNext()
      } else {
        await handleFinishValidation()
      }
    } catch (error) {
      console.error("Error validating content:", error)
      onToast("Terjadi kesalahan saat validasi", "error")
    } finally {
      setIsSaving(false)
    }
  }

  const handleFinishValidation = async () => {
    // Check if all items have been validated
    const allValidated = approvedItems.every(
      (item) => validationDecisions[item.id] !== undefined && validationDecisions[item.id] !== null,
    )

    if (!allValidated) {
      onToast("Harap validasi semua konten terlebih dahulu", "error")
      return
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Load and update submissions
    const submissions = JSON.parse(localStorage.getItem("submissions") || "[]")
    const updatedSubmissions = submissions.map((sub: any) => {
      if (sub.id === submission?.id) {
        const updatedContentItems = sub.contentItems?.map((contentItem: any) => {
          const decision = validationDecisions[contentItem.id]
          if (decision !== undefined && decision !== null) {
            return {
              ...contentItem,
              isTayang: decision,
              tanggalValidasiTayang: new Date().toLocaleDateString("id-ID"),
              validatorTayang: "Admin",
              keteranganValidasi: validationNotes[contentItem.id] || "",
              alasanTidakTayang: decision === false ? rejectionReasons[contentItem.id] : undefined,
              tanggalTayangValidasi: decision === true ? tayangDates[contentItem.id] : undefined,
              hasilProdukValidasiFile: decision === true ? hasilProdukFiles[contentItem.id] : undefined,
              hasilProdukValidasiLink: decision === true ? hasilProdukLinks[contentItem.id] : undefined,
            }
          }
          return contentItem
        })

        return {
          ...sub,
          contentItems: updatedContentItems,
          lastModified: new Date(),
          isOutputValidated: true,
          tanggalValidasiOutput: new Date().toISOString(),
          workflowStage: "completed",
        }
      }
      return sub
    })

    localStorage.setItem("submissions", JSON.stringify(updatedSubmissions))
    onUpdate(updatedSubmissions)

    const tayangCount = Object.values(validationDecisions).filter((d) => d === true).length
    const tidakTayangCount = Object.values(validationDecisions).filter((d) => d === false).length

    onToast(`Validasi selesai! ${tayangCount} konten tayang, ${tidakTayangCount} konten tidak tayang`, "success")
    onOpenChange(false)
  }

  const handleGridItemClick = (index: number) => {
    setCurrentIndex(index)
    setViewMode("detail")
  }

  const handleHasilFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentItem) return

    const file = event.target.files?.[0]
    if (file) {
      setHasilProdukFiles((prev) => ({
        ...prev,
        [currentItem.id]: file,
      }))
    }
  }

  const removeHasilFile = () => {
    if (!currentItem) return

    setHasilProdukFiles((prev) => ({
      ...prev,
      [currentItem.id]: null,
    }))
  }

  if (!submission || !approvedItems || approvedItems.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md mx-auto">
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak Ada Konten</h3>
            <p className="text-gray-600">Tidak ada konten yang perlu divalidasi saat ini.</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const currentDecision = validationDecisions[currentItem.id]
  const currentRejectionReason = rejectionReasons[currentItem.id] || ""
  const currentValidationNote = validationNotes[currentItem.id] || ""
  const currentTayangDate = tayangDates[currentItem.id] || ""
  const currentHasilFile = hasilProdukFiles[currentItem.id]
  const currentHasilLink = hasilProdukLinks[currentItem.id] || ""

  // Validation status
  const hasFile = !!currentHasilFile
  const hasLink = !!currentHasilLink.trim()
  const hasDate = !!currentTayangDate.trim()
  const hasReason = !!currentRejectionReason.trim()

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto h-[90vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="flex-shrink-0 p-4 border-b bg-gradient-to-r from-yellow-50 to-amber-50">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold text-gray-900 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-yellow-600" />
              Validasi Output
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
                className="bg-gradient-to-r from-yellow-500 to-amber-600 h-2 rounded-full"
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
                    {approvedItems.map((item, index) => {
                      const itemDecision = validationDecisions[item.id]
                      const itemHasFile = !!hasilProdukFiles[item.id]
                      const itemHasLink = !!hasilProdukLinks[item.id]?.trim()
                      const itemHasDate = !!tayangDates[item.id]?.trim()
                      const itemHasReason = !!rejectionReasons[item.id]?.trim()
                      const itemIsValid =
                        itemDecision !== null &&
                        (itemDecision === false ? itemHasReason : itemHasDate && (itemHasFile || itemHasLink))

                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => handleGridItemClick(index)}
                          className={cn(
                            "p-3 rounded-lg border cursor-pointer transition-all duration-200",
                            index === currentIndex
                              ? "border-yellow-500 bg-yellow-50 shadow-md"
                              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm",
                          )}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm text-gray-900 line-clamp-2">{item.nama}</h4>
                            <Badge className="text-xs ml-2 bg-yellow-100 text-yellow-800 border-yellow-200">
                              {item.jenisKonten}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>{formatDate(item.tanggalOrderMasuk)}</span>
                            </div>
                          </div>

                          {/* Validation Status for Grid Item */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              {itemIsValid && <CheckCircle className="h-3 w-3 text-green-600" />}
                              {itemDecision === false && !itemHasReason && <XCircle className="h-3 w-3 text-red-600" />}
                              {itemDecision === true && (!itemHasDate || (!itemHasFile && !itemHasLink)) && (
                                <XCircle className="h-3 w-3 text-red-600" />
                              )}
                              {itemDecision === null && <Clock className="h-3 w-3 text-orange-600" />}
                            </div>

                            {itemIsValid && (
                              <Badge className="text-xs bg-green-100 text-green-800 border-green-200">Lengkap</Badge>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
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
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                  <div className="px-4 pt-2 bg-white border-b border-gray-200">
                    <TabsList className="grid w-full grid-cols-2 h-10">
                      <TabsTrigger value="validation" className="text-xs">
                        <Shield className="h-3.5 w-3.5 mr-1" />
                        Validasi
                      </TabsTrigger>
                      <TabsTrigger value="content" className="text-xs">
                        <FileText className="h-3.5 w-3.5 mr-1" />
                        Konten
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="p-4">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`${activeTab}-${currentIndex}`}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          {currentItem && (
                            <div className="space-y-4">
                              <TabsContent value="validation" className="space-y-4 m-0 p-0">
                                {/* Item Header */}
                                <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 shadow-sm">
                                  <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1 flex items-center space-x-3">
                                        {getContentTypeIcon(currentItem.jenisKonten)}
                                        <div>
                                          <CardTitle className="text-lg font-bold text-gray-900">
                                            {currentItem.nama}
                                          </CardTitle>
                                          <CardDescription className="text-sm text-gray-600 capitalize">
                                            {currentItem.jenisKonten.replace("-", " ")}
                                          </CardDescription>
                                        </div>
                                      </div>
                                    </div>
                                  </CardHeader>
                                </Card>

                                {/* Validation Status */}
                                <ValidationStatus
                                  decision={currentDecision}
                                  hasFile={hasFile}
                                  hasLink={hasLink}
                                  hasDate={hasDate}
                                  hasReason={hasReason}
                                />

                                {/* Validation Decision */}
                                <div className="space-y-4">
                                  <Label className="text-base font-semibold text-gray-900">
                                    Apakah konten ini layak untuk tayang?
                                  </Label>
                                  <div className="grid grid-cols-2 gap-3">
                                    <Button
                                      variant={currentDecision === true ? "default" : "outline"}
                                      onClick={() => handleValidationDecisionChange(true)}
                                      className={cn(
                                        "h-14 text-sm font-semibold transition-all duration-300",
                                        currentDecision === true
                                          ? "bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white shadow-lg"
                                          : "border-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-400",
                                      )}
                                    >
                                      <ThumbsUp className="h-5 w-5 mr-2" />
                                      Tayang
                                    </Button>

                                    <Button
                                      variant={currentDecision === false ? "default" : "outline"}
                                      onClick={() => handleValidationDecisionChange(false)}
                                      className={cn(
                                        "h-14 text-sm font-semibold transition-all duration-300",
                                        currentDecision === false
                                          ? "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg"
                                          : "border-2 border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400",
                                      )}
                                    >
                                      <ThumbsDown className="h-5 w-5 mr-2" />
                                      Tidak Tayang
                                    </Button>
                                  </div>
                                </div>

                                {/* Tayang Fields */}
                                <AnimatePresence>
                                  {currentDecision === true && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0, y: -20 }}
                                      animate={{ opacity: 1, height: "auto", y: 0 }}
                                      exit={{ opacity: 0, height: 0, y: -20 }}
                                      transition={{ duration: 0.3 }}
                                      className="space-y-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200"
                                    >
                                      <h4 className="font-semibold text-yellow-800 flex items-center">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Detail Publikasi
                                      </h4>

                                      {/* Tanggal Tayang */}
                                      <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-900">Tanggal Tayang *</Label>
                                        <Input
                                          type="date"
                                          value={currentTayangDate}
                                          onChange={(e) =>
                                            setTayangDates((prev) => ({
                                              ...prev,
                                              [currentItem.id]: e.target.value,
                                            }))
                                          }
                                          className="border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500"
                                        />
                                        {!currentTayangDate.trim() && (
                                          <p className="text-yellow-600 text-sm flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            Tanggal tayang wajib diisi
                                          </p>
                                        )}
                                        {hasDate && (
                                          <motion.div
                                            initial={{ scale: 0.9, opacity: 0, y: 10 }}
                                            animate={{ scale: 1, opacity: 1, y: 0 }}
                                            className="flex items-center p-2 bg-green-50 rounded border border-green-200"
                                          >
                                            <Calendar className="h-4 w-4 text-green-600 mr-2" />
                                            <p className="text-xs text-green-700 font-medium">
                                              Tanggal tayang telah ditetapkan
                                            </p>
                                          </motion.div>
                                        )}
                                      </div>

                                      {/* Hasil Produk */}
                                      <div className="space-y-3">
                                        <Label className="text-sm font-semibold text-gray-900">
                                          Hasil Produk * (File atau Link)
                                        </Label>

                                        {/* File Upload */}
                                        <div className="space-y-2">
                                          <Label className="text-xs text-gray-600">Upload File</Label>
                                          <div className="flex items-center space-x-2">
                                            <Input
                                              type="file"
                                              onChange={handleHasilFileChange}
                                              className="flex-1 border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500"
                                              accept="*/*"
                                            />
                                            {currentHasilFile && (
                                              <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={removeHasilFile}
                                                className="text-red-600 border-red-300 hover:bg-red-50 bg-transparent"
                                              >
                                                <X className="h-4 w-4" />
                                              </Button>
                                            )}
                                          </div>
                                          {currentHasilFile && <FileUploadSuccess fileName={currentHasilFile.name} />}
                                        </div>

                                        {/* Link Input */}
                                        <div className="space-y-2">
                                          <Label className="text-xs text-gray-600">Atau Masukkan Link</Label>
                                          <Input
                                            type="url"
                                            placeholder="https://example.com/hasil-produk"
                                            value={currentHasilLink}
                                            onChange={(e) =>
                                              setHasilProdukLinks((prev) => ({
                                                ...prev,
                                                [currentItem.id]: e.target.value,
                                              }))
                                            }
                                            className="border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500"
                                          />
                                          {currentHasilLink && <LinkInputSuccess link={currentHasilLink} />}
                                        </div>

                                        {!currentHasilFile && !currentHasilLink.trim() && (
                                          <p className="text-yellow-600 text-sm flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            Harap upload file atau masukkan link hasil produk
                                          </p>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>

                                {/* Rejection Reason */}
                                <AnimatePresence>
                                  {currentDecision === false && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0, y: -20 }}
                                      animate={{ opacity: 1, height: "auto", y: 0 }}
                                      exit={{ opacity: 0, height: 0, y: -20 }}
                                      transition={{ duration: 0.3 }}
                                      className="space-y-3"
                                    >
                                      <Label className="text-base font-semibold text-red-700">
                                        Alasan Tidak Tayang *
                                      </Label>
                                      <Textarea
                                        placeholder="Jelaskan alasan mengapa konten ini tidak layak untuk tayang..."
                                        value={currentRejectionReason}
                                        onChange={(e) =>
                                          setRejectionReasons((prev) => ({
                                            ...prev,
                                            [currentItem.id]: e.target.value,
                                          }))
                                        }
                                        className="min-h-[80px] border-red-300 focus:border-red-500 focus:ring-red-500"
                                      />
                                      {currentDecision === false && !currentRejectionReason.trim() && (
                                        <p className="text-red-600 text-sm flex items-center">
                                          <AlertCircle className="h-4 w-4 mr-1" />
                                          Alasan penolakan wajib diisi
                                        </p>
                                      )}
                                      {hasReason && <ReasonInputSuccess reason={currentRejectionReason} />}
                                    </motion.div>
                                  )}
                                </AnimatePresence>

                                {/* Validation Notes */}
                                <div className="space-y-3">
                                  <Label className="text-base font-semibold text-gray-900">
                                    Catatan Validasi (Opsional)
                                  </Label>
                                  <Textarea
                                    placeholder="Tambahkan catatan atau komentar terkait validasi konten ini..."
                                    value={currentValidationNote}
                                    onChange={(e) =>
                                      setValidationNotes((prev) => ({
                                        ...prev,
                                        [currentItem.id]: e.target.value,
                                      }))
                                    }
                                    className="min-h-[60px] border-gray-300 focus:border-yellow-500 focus:ring-yellow-500"
                                  />
                                </div>
                              </TabsContent>

                              <TabsContent value="content" className="space-y-4 m-0 p-0">
                                <Card className="bg-white shadow-sm">
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Detail Konten</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    <div>
                                      <Label className="text-sm font-medium text-gray-700">Judul:</Label>
                                      <p className="text-sm text-gray-900 mt-1">{currentItem.nama}</p>
                                    </div>

                                    {currentItem.nomorSurat && (
                                      <div>
                                        <Label className="text-sm font-medium text-gray-700">Nomor Surat:</Label>
                                        <p className="text-sm text-gray-900 mt-1">{currentItem.nomorSurat}</p>
                                      </div>
                                    )}

                                    {currentItem.narasiText && (
                                      <div>
                                        <Label className="text-sm font-medium text-gray-700">Narasi:</Label>
                                        <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                                          <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                                            {currentItem.narasiText}
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    {currentItem.keterangan && (
                                      <div>
                                        <Label className="text-sm font-medium text-gray-700">Keterangan:</Label>
                                        <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                                          <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                                            {currentItem.keterangan}
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                      <div>
                                        <Label className="text-sm font-medium text-gray-700">Tanggal Order:</Label>
                                        <p className="text-sm text-gray-900 mt-1">
                                          {formatDate(currentItem.tanggalOrderMasuk)}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium text-gray-700">Tanggal Jadi:</Label>
                                        <p className="text-sm text-gray-900 mt-1">
                                          {formatDate(currentItem.tanggalJadi)}
                                        </p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </TabsContent>
                            </div>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </ScrollArea>
                </Tabs>

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

                  {/* Action Button */}
                  <Button
                    onClick={handleValidate}
                    disabled={isSaving}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    {isSaving ? (
                      <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Memvalidasi...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Check className="h-4 w-4" />
                        <span>Validasi Konten</span>
                      </div>
                    )}
                  </Button>

                  {/* Finish Validation Button - Show when all items validated */}
                  {Object.keys(validationDecisions).length === totalItems && (
                    <Button
                      onClick={handleFinishValidation}
                      disabled={isSaving}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isSaving ? (
                        <div className="flex items-center space-x-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Menyelesaikan...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Rocket className="h-4 w-4" />
                          <span>Selesaikan Validasi</span>
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

export default MobileValidasiOutputDialog

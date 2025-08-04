"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  FileText,
  CheckCircle,
  Clock,
  BarChart3,
  Archive,
  X,
  Video,
  Mic,
  ImageIcon,
  FileIcon,
  Play,
  Link,
  ExternalLink,
  Globe,
  Tv,
  Radio,
  Newspaper,
  Monitor,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

// Define interfaces
interface FileData {
  name: string
  size: number
  type: string
  lastModified: number
  base64?: string
  url?: string
}

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
  hasilProdukFile?: FileData | string
  hasilProdukLink?: string
  isTayang?: boolean
  tanggalValidasiTayang?: string
  validatorTayang?: string
  keteranganValidasi?: string
  narasiFile?: FileData | string
  suratFile?: FileData | string
  audioDubbingFile?: FileData | string
  audioDubbingLainLainFile?: FileData | string
  audioBacksoundFile?: FileData | string
  audioBacksoundLainLainFile?: FileData | string
  pendukungVideoFile?: FileData | string
  pendukungFotoFile?: FileData | string
  pendukungLainLainFile?: FileData | string
  alasanTakedown?: string
  tanggalTakedown?: string
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
  uploadedBuktiMengetahui?: FileData | string
  isConfirmed?: boolean
  tanggalKonfirmasi?: string
  isOutputValidated?: boolean
  tanggalValidasiOutput?: string
  contentItems?: ContentItem[]
}

interface HasilOutputSectionProps {
  submission: Submission | null
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

// Helper functions
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

const getContentTypeIcon = (type: string) => {
  switch (type) {
    case "video":
      return <Video className="h-4 w-4 text-red-500" />
    case "audio":
      return <Mic className="h-4 w-4 text-purple-500" />
    case "fotografis":
      return <ImageIcon className="h-4 w-4 text-blue-500" />
    case "infografis":
      return <FileIcon className="h-4 w-4 text-green-500" />
    case "naskah-berita":
      return <FileText className="h-4 w-4 text-orange-500" />
    case "bumper":
      return <Play className="h-4 w-4 text-indigo-500" />
    default:
      return <FileText className="h-4 w-4 text-gray-500" />
  }
}

const getMediaIcon = (media: string) => {
  const mediaLower = media.toLowerCase()
  if (mediaLower.includes("tv") || mediaLower.includes("televisi")) {
    return <Tv className="h-4 w-4 text-blue-600" />
  }
  if (mediaLower.includes("radio")) {
    return <Radio className="h-4 w-4 text-green-600" />
  }
  if (mediaLower.includes("website") || mediaLower.includes("web")) {
    return <Globe className="h-4 w-4 text-purple-600" />
  }
  if (mediaLower.includes("media sosial") || mediaLower.includes("sosmed")) {
    return <Monitor className="h-4 w-4 text-pink-600" />
  }
  if (mediaLower.includes("koran") || mediaLower.includes("surat kabar")) {
    return <Newspaper className="h-4 w-4 text-gray-600" />
  }
  return <FileText className="h-4 w-4 text-gray-500" />
}

const handleFilePreview = (file: any, title: string) => {
  if (!file) {
    alert("File tidak tersedia")
    return
  }

  if (typeof file === "string") {
    if (file.startsWith("http://") || file.startsWith("https://")) {
      window.open(file, "_blank")
      return
    }
  }

  if (file.url) {
    window.open(file.url, "_blank")
    return
  }

  if (file.base64) {
    const mimeType = file.type || "application/octet-stream"
    const dataUrl = file.base64.startsWith("data:") ? file.base64 : `data:${mimeType};base64,${file.base64}`
    window.open(dataUrl, "_blank")
    return
  }

  alert("File tidak dapat dibuka")
}

export default function HasilOutputSection({ submission, isOpen, onOpenChange }: HasilOutputSectionProps) {
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean
    file: any
    title: string
  }>({
    isOpen: false,
    file: null,
    title: "",
  })

  if (!submission) return null

  const contentItems = submission.contentItems || []
  const approvedItems = contentItems.filter((item) => item.status === "approved")

  const handlePreview = (file: any, title: string) => {
    setPreviewModal({
      isOpen: true,
      file: file,
      title: title,
    })
  }

  const renderContent = () => (
    <div className="space-y-6">
      {/* Detail Dokumen */}
      <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-800">
            <FileText className="h-5 w-5" />
            <span>Detail Dokumen</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-green-700">No. Comtab</label>
                <p className="text-gray-900 font-medium">{submission.noComtab}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-green-700">Judul</label>
                <p className="text-gray-900">{submission.judul}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-green-700">Tema</label>
                <p className="text-gray-900 capitalize">{submission.tema}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-green-700">Petugas Pelaksana</label>
                <p className="text-gray-900">{submission.petugasPelaksana}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-green-700">Supervisor</label>
                <p className="text-gray-900">{submission.supervisor}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-green-700">Durasi</label>
                <p className="text-gray-900">{submission.durasi}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-green-700">Tanggal Submit</label>
                <p className="text-gray-900">{formatDate(submission.tanggalSubmit)}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-green-700">Tanggal Konfirmasi</label>
                <p className="text-gray-900">{formatDate(submission.tanggalKonfirmasi)}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-green-700">Jumlah Produksi</label>
                <p className="text-gray-900">{submission.jumlahProduksi}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hasil Output Konten */}
      <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-800">
            <Archive className="h-5 w-5" />
            <span>Hasil Output Konten ({approvedItems.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] overflow-y-auto">
            <div className="space-y-6 pr-4">
              {approvedItems.length > 0 ? (
                approvedItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 bg-gradient-to-r from-white to-green-50/30 rounded-xl shadow-lg border border-green-200 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">{getContentTypeIcon(item.jenisKonten)}</div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {item.nama || `Konten ${item.jenisKonten}`}
                          </h3>
                          <p className="text-sm text-gray-600 capitalize">{item.jenisKonten.replace("-", " ")}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-medium",
                            item.isTayang === true && "bg-green-100 text-green-800 border-green-300",
                            item.isTayang === false && "bg-red-100 text-red-800 border-red-300",
                            item.isTayang === undefined && "bg-yellow-100 text-yellow-800 border-yellow-300",
                          )}
                        >
                          {item.isTayang === true ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Tayang
                            </>
                          ) : item.isTayang === false ? (
                            <>
                              <X className="h-3 w-3 mr-1" />
                              Tidak Tayang
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 mr-1" />
                              Belum Divalidasi
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>

                    {/* Target Media */}
                    <div className="mb-4">
                      <label className="text-sm font-semibold text-green-700 mb-2 block">Target Media</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Media Pemerintah */}
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Media Pemerintah</label>
                          <div className="flex flex-wrap gap-1">
                            {item.mediaPemerintah && item.mediaPemerintah.length > 0 ? (
                              item.mediaPemerintah.map((media, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                                >
                                  {getMediaIcon(media)}
                                  <span className="ml-1">{media}</span>
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-gray-500 italic">Tidak ada</span>
                            )}
                          </div>
                        </div>

                        {/* Media Massa */}
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Media Massa</label>
                          <div className="flex flex-wrap gap-1">
                            {item.mediaMassa && item.mediaMassa.length > 0 ? (
                              item.mediaMassa.map((media, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="bg-purple-50 text-purple-700 border-purple-200 text-xs"
                                >
                                  {getMediaIcon(media)}
                                  <span className="ml-1">{media}</span>
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-gray-500 italic">Tidak ada</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Hasil Produk */}
                    <div className="mb-4">
                      <label className="text-sm font-semibold text-green-700 mb-2 block">Hasil Produk</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* File */}
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">File</label>
                          {item.hasilProdukFile ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleFilePreview(item.hasilProdukFile, "Hasil Produk File")}
                              className="w-full justify-start bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              <span className="truncate">
                                {typeof item.hasilProdukFile === "string"
                                  ? "File Link"
                                  : item.hasilProdukFile.name || "File"}
                              </span>
                              <ExternalLink className="h-3 w-3 ml-auto" />
                            </Button>
                          ) : (
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <span className="text-xs text-gray-500 italic">Tidak ada file</span>
                            </div>
                          )}
                        </div>

                        {/* Link */}
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Link</label>
                          {item.hasilProdukLink ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(item.hasilProdukLink, "_blank")}
                              className="w-full justify-start bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                            >
                              <Link className="h-4 w-4 mr-2" />
                              <span className="truncate">{item.hasilProdukLink}</span>
                              <ExternalLink className="h-3 w-3 ml-auto" />
                            </Button>
                          ) : (
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <span className="text-xs text-gray-500 italic">Tidak ada link</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Informasi Validasi */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <label className="text-xs font-medium text-gray-600">Tanggal Jadi</label>
                        <p className="text-gray-900">{formatDate(item.tanggalJadi)}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">Tanggal Tayang</label>
                        <p className="text-gray-900">{formatDate(item.tanggalTayang)}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">Validator</label>
                        <p className="text-gray-900">{item.validatorTayang || "N/A"}</p>
                      </div>
                    </div>

                    {/* Keterangan Validasi */}
                    {item.keteranganValidasi && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <label className="text-xs font-medium text-green-700 block mb-1">Keterangan Validasi</label>
                        <p className="text-sm text-green-800">{item.keteranganValidasi}</p>
                      </div>
                    )}

                    {/* Alasan Takedown */}
                    {item.alasanTakedown && (
                      <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                        <label className="text-xs font-medium text-red-700 block mb-1">Alasan Takedown</label>
                        <p className="text-sm text-red-800">{item.alasanTakedown}</p>
                        <p className="text-xs text-red-600 mt-1">Tanggal: {item.tanggalTakedown}</p>
                      </div>
                    )}
                  </motion.div>
                ))
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                  <div className="mx-auto mb-4 p-4 bg-green-100 rounded-full w-fit">
                    <Archive className="h-12 w-12 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak Ada Konten</h3>
                  <p className="text-gray-600">Belum ada konten yang disetujui untuk dokumen ini.</p>
                </motion.div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )

  // If used as a dialog
  if (isOpen !== undefined && onOpenChange) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <span>Hasil Output - {submission.noComtab}</span>
            </DialogTitle>
            <DialogDescription>Detail lengkap hasil produksi konten yang telah disetujui</DialogDescription>
          </DialogHeader>
          {renderContent()}
        </DialogContent>
      </Dialog>
    )
  }

  // If used as a regular component
  return renderContent()
}

// Named export for compatibility
export { HasilOutputSection }

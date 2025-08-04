"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  File,
  Eye,
  Download,
  ExternalLink,
  Globe,
  Sparkles,
} from "lucide-react"
import { motion } from "framer-motion"
import PreviewModal from "./preview-modal"

interface FileData {
  name: string
  size: number
  type: string
  lastModified: number
  base64?: string
  url?: string
}

interface ProductionResultPreviewProps {
  hasilProdukFile?: FileData | string
  hasilProdukLink?: string
  contentName?: string
  className?: string
}

const ProductionResultPreview: React.FC<ProductionResultPreviewProps> = ({
  hasilProdukFile,
  hasilProdukLink,
  contentName = "Konten",
  className = "",
}) => {
  const [isFilePreviewOpen, setIsFilePreviewOpen] = useState(false)
  const [isLinkPreviewOpen, setIsLinkPreviewOpen] = useState(false)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <FileImage className="h-6 w-6 text-blue-500" />
    if (type.startsWith("video/")) return <FileVideo className="h-6 w-6 text-red-500" />
    if (type.startsWith("audio/")) return <FileAudio className="h-6 w-6 text-purple-500" />
    if (type.includes("pdf") || type.includes("document")) return <FileText className="h-6 w-6 text-green-500" />
    return <File className="h-6 w-6 text-gray-500" />
  }

  const getFileTypeColor = (type: string) => {
    if (type.startsWith("image/")) return "bg-blue-100 text-blue-800 border-blue-300"
    if (type.startsWith("video/")) return "bg-red-100 text-red-800 border-red-300"
    if (type.startsWith("audio/")) return "bg-purple-100 text-purple-800 border-purple-300"
    if (type.includes("pdf")) return "bg-green-100 text-green-800 border-green-300"
    if (type.includes("document")) return "bg-orange-100 text-orange-800 border-orange-300"
    return "bg-gray-100 text-gray-800 border-gray-300"
  }

  const getPreviewUrl = (file: FileData | string) => {
    if (typeof file === "string") {
      // Validate URL format
      try {
        new URL(file)
        return file
      } catch (error) {
        console.warn("Invalid URL format:", file)
        return null
      }
    }

    if (file.url) {
      try {
        new URL(file.url)
        return file.url
      } catch (error) {
        console.warn("Invalid URL format:", file.url)
        return null
      }
    }

    if (file.base64) {
      return file.base64.startsWith("data:") ? file.base64 : `data:${file.type};base64,${file.base64}`
    }

    return null
  }

  const getPreviewType = (file: FileData | string) => {
    if (typeof file === "string") {
      const fileExtension = file.split(".").pop()?.toLowerCase()
      const mimeTypes: Record<string, string> = {
        pdf: "application/pdf",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        mp4: "video/mp4",
        mp3: "audio/mpeg",
        wav: "audio/wav",
        txt: "text/plain",
        doc: "application/msword",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      }
      return mimeTypes[fileExtension || ""] || "text/plain"
    }
    return file.type
  }

  const getFileName = (file: FileData | string) => {
    if (typeof file === "string") return file.split("/").pop() || "file"
    return file.name
  }

  const handleFilePreview = () => {
    if (hasilProdukFile) {
      const url = getPreviewUrl(hasilProdukFile)
      if (url) {
        setIsFilePreviewOpen(true)
      } else {
        alert("Preview not available - invalid file URL")
      }
    }
  }

  const handleLinkPreview = () => {
    if (hasilProdukLink) {
      try {
        new URL(hasilProdukLink)
        setIsLinkPreviewOpen(true)
      } catch (error) {
        alert("Preview not available - invalid link format")
      }
    }
  }

  const handleDownload = (file: FileData | string) => {
    const downloadUrl = getPreviewUrl(file)
    if (downloadUrl) {
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = getFileName(file)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  if (!hasilProdukFile && !hasilProdukLink) {
    return (
      <div className={`p-6 bg-gray-50 rounded-xl border border-gray-200 text-center ${className}`}>
        <div className="flex flex-col items-center space-y-3">
          <div className="p-3 bg-gray-200 rounded-full">
            <File className="h-8 w-8 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Hasil Produksi Belum Tersedia</p>
            <p className="text-xs text-gray-500 mt-1">
              File atau link hasil produksi untuk {contentName} belum diunggah
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="h-5 w-5 text-indigo-500" />
          <h4 className="font-semibold text-gray-800">Hasil Produksi - {contentName}</h4>
        </div>

        {/* File Hasil Produksi */}
        {hasilProdukFile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg shadow-md">
                  {typeof hasilProdukFile === "string" ? (
                    <Globe className="h-6 w-6 text-green-500" />
                  ) : (
                    getFileIcon(hasilProdukFile.type)
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-semibold text-green-900">File Hasil Produksi</p>
                    {typeof hasilProdukFile !== "string" && (
                      <Badge variant="outline" className={getFileTypeColor(hasilProdukFile.type)}>
                        {hasilProdukFile.type.split("/")[1]?.toUpperCase() ||
                          hasilProdukFile.name.split(".").pop()?.toUpperCase() ||
                          "FILE"}
                      </Badge>
                    )}
                  </div>
                  {typeof hasilProdukFile === "string" ? (
                    <p className="text-xs text-green-700 truncate max-w-[300px]">{hasilProdukFile}</p>
                  ) : (
                    <div className="flex items-center space-x-4 text-xs text-green-700">
                      <span>{hasilProdukFile.name}</span>
                      <span>•</span>
                      <span>{formatFileSize(hasilProdukFile.size)}</span>
                      <span>•</span>
                      <span>{new Date(hasilProdukFile.lastModified).toLocaleDateString("id-ID")}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleFilePreview}
                  className="hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-all duration-200 bg-transparent"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(hasilProdukFile)}
                  className="hover:bg-green-50 hover:border-green-300 hover:text-green-600 transition-all duration-200"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const url = getPreviewUrl(hasilProdukFile)
                    if (url) window.open(url, "_blank")
                  }}
                  className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all duration-200"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Buka
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Link Hasil Produksi */}
        {hasilProdukLink && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg shadow-md">
                  <Globe className="h-6 w-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-semibold text-blue-900">Link Hasil Produksi</p>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                      URL
                    </Badge>
                  </div>
                  <p className="text-xs text-blue-700 truncate max-w-[300px]">{hasilProdukLink}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleLinkPreview}
                  className="hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-all duration-200 bg-transparent"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(hasilProdukLink, "_blank")}
                  className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all duration-200"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Buka
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Preview Modals */}
      {hasilProdukFile && (
        <PreviewModal
          isOpen={isFilePreviewOpen}
          onClose={() => setIsFilePreviewOpen(false)}
          url={getPreviewUrl(hasilProdukFile) || ""}
          type={getPreviewType(hasilProdukFile)}
          fileName={getFileName(hasilProdukFile)}
        />
      )}

      {hasilProdukLink && (
        <PreviewModal
          isOpen={isLinkPreviewOpen}
          onClose={() => setIsLinkPreviewOpen(false)}
          url={hasilProdukLink}
          type={hasilProdukLink.split(".").pop()?.toLowerCase() === "pdf" ? "application/pdf" : "text/html"}
          fileName={hasilProdukLink.split("/").pop() || "link"}
        />
      )}
    </>
  )
}

export default ProductionResultPreview

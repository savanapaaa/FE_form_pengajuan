"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Download, FileText, ImageIcon, Video, Music, File, AlertTriangle, Eye, FileX } from "lucide-react"

interface PreviewModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  file: any
  url: string
  type: string
  fileName: string
  title: string
}

export default function PreviewModal({ isOpen, onOpenChange, file, url, type, fileName, title }: PreviewModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [fileInfo, setFileInfo] = useState<any>(null)
  const blobUrlsRef = useRef<string[]>([])

  // Enhanced file URL creation with better error handling
  const createUrlFromFile = (fileData: any): string => {
    try {
      if (!fileData) {
        console.warn("No file data provided")
        return ""
      }

      // Handle string URLs
      if (typeof fileData === "string") {
        if (fileData.startsWith("http://") || fileData.startsWith("https://")) {
          return fileData
        }
        if (fileData.startsWith("data:")) {
          return fileData
        }
        // Handle relative paths or filenames
        return fileData
      }

      // Handle objects with url property
      if (fileData && typeof fileData === "object" && fileData.url) {
        return fileData.url
      }

      // Handle objects with base64 property
      if (fileData && typeof fileData === "object" && fileData.base64) {
        const base64Data = fileData.base64
        if (base64Data.startsWith("data:")) {
          return base64Data
        }
        const mimeType = fileData.type || "application/octet-stream"
        return `data:${mimeType};base64,${base64Data}`
      }

      // Handle objects with preview property
      if (fileData && typeof fileData === "object" && fileData.preview) {
        return fileData.preview
      }

      // Handle objects with content property
      if (fileData && typeof fileData === "object" && fileData.content) {
        return fileData.content
      }

      // Handle Browser File/Blob objects
      const isBrowserFile = (obj: any): boolean => {
        return (
          obj &&
          typeof obj === "object" &&
          typeof obj.name === "string" &&
          typeof obj.size === "number" &&
          typeof obj.type === "string" &&
          typeof obj.lastModified === "number" &&
          typeof obj.slice === "function"
        )
      }

      if (isBrowserFile(fileData) && typeof URL !== "undefined" && typeof URL.createObjectURL === "function") {
        try {
          const blobUrl = URL.createObjectURL(fileData)
          blobUrlsRef.current.push(blobUrl)
          return blobUrl
        } catch (error) {
          console.error("Failed to create object URL:", error)
          return ""
        }
      }

      // Handle serialized file objects (objects with name, size, type but no methods)
      if (
        fileData &&
        typeof fileData === "object" &&
        typeof fileData.name === "string" &&
        typeof fileData.size === "number" &&
        typeof fileData.type === "string"
      ) {
        console.warn("File object appears to be serialized, cannot create preview URL")
        return ""
      }

      console.warn("Unknown file format, cannot create URL:", typeof fileData, fileData)
      return ""
    } catch (error) {
      console.error("Error creating URL from file:", error)
      return ""
    }
  }

  // Enhanced MIME type detection
  const getMimeType = (fileData: any, fallbackType?: string): string => {
    try {
      // Check if file object has type property
      if (fileData && typeof fileData === "object" && fileData.type) {
        return fileData.type
      }

      // Use provided type
      if (fallbackType) {
        return fallbackType
      }

      // Determine from filename/URL
      const filename = typeof fileData === "string" ? fileData : fileData?.name || fileName || ""
      const extension = filename.split(".").pop()?.toLowerCase()

      const mimeTypes: Record<string, string> = {
        // Images
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        webp: "image/webp",
        svg: "image/svg+xml",
        bmp: "image/bmp",
        ico: "image/x-icon",
        // Videos
        mp4: "video/mp4",
        webm: "video/webm",
        ogg: "video/ogg",
        avi: "video/x-msvideo",
        mov: "video/quicktime",
        wmv: "video/x-ms-wmv",
        flv: "video/x-flv",
        // Audio
        mp3: "audio/mpeg",
        wav: "audio/wav",
        ogg: "audio/ogg",
        aac: "audio/aac",
        flac: "audio/flac",
        // Documents
        pdf: "application/pdf",
        txt: "text/plain",
        html: "text/html",
        css: "text/css",
        js: "text/javascript",
        json: "application/json",
        xml: "application/xml",
        // Office
        doc: "application/msword",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        xls: "application/vnd.ms-excel",
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ppt: "application/vnd.ms-powerpoint",
        pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      }

      return mimeTypes[extension || ""] || "application/octet-stream"
    } catch (error) {
      console.error("Error determining MIME type:", error)
      return "application/octet-stream"
    }
  }

  // Check if file type is previewable
  const isPreviewable = (mimeType: string): boolean => {
    return (
      mimeType.startsWith("image/") ||
      mimeType.startsWith("video/") ||
      mimeType.startsWith("audio/") ||
      mimeType === "application/pdf" ||
      mimeType.startsWith("text/") ||
      mimeType === "application/json"
    )
  }

  // Get file size in readable format
  const getFileSize = (fileData: any): string => {
    try {
      if (fileData && typeof fileData === "object" && typeof fileData.size === "number") {
        const bytes = fileData.size
        if (bytes === 0) return "0 Bytes"
        const k = 1024
        const sizes = ["Bytes", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
      }
      return "Ukuran tidak diketahui"
    } catch (error) {
      return "Ukuran tidak diketahui"
    }
  }

  // Process file URL with enhanced error handling
  const processFileUrl = async (fileData: any, providedUrl?: string, providedType?: string) => {
    try {
      setIsLoading(true)
      setError("")

      // Use provided URL or create from file
      const processedUrl = providedUrl || createUrlFromFile(fileData)
      const mimeType = getMimeType(fileData, providedType)

      // Set file info
      const info = {
        name: fileName || (typeof fileData === "string" ? fileData.split("/").pop() : fileData?.name) || "File",
        size: getFileSize(fileData),
        type: mimeType,
        isPreviewable: isPreviewable(mimeType),
        url: processedUrl,
      }

      setFileInfo(info)

      if (!processedUrl) {
        setError("File tidak dapat diakses atau URL tidak valid")
        setIsLoading(false)
        return
      }

      if (!info.isPreviewable) {
        setError("Format file tidak mendukung preview")
        setIsLoading(false)
        return
      }

      setPreviewUrl(processedUrl)
      setIsLoading(false)
    } catch (error) {
      console.error("Error processing file URL:", error)
      setError(`Error memproses file: ${error instanceof Error ? error.message : "Unknown error"}`)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && (file || url)) {
      processFileUrl(file, url, type)
    }

    // Clean up function to revoke blob URLs when component unmounts or dialog closes
    return () => {
      blobUrlsRef.current.forEach((blobUrl) => {
        if (blobUrl.startsWith("blob:")) {
          try {
            URL.revokeObjectURL(blobUrl)
          } catch (e) {
            console.error("Error revoking blob URL:", e)
          }
        }
      })
      blobUrlsRef.current = []
    }
  }, [isOpen, file, url, type])

  const handleDownload = () => {
    try {
      if (!previewUrl && !url) {
        console.error("No URL available for download")
        return
      }

      const downloadUrl = previewUrl || url
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = fileName || "download"

      if (downloadUrl.startsWith("http://") || downloadUrl.startsWith("https://")) {
        link.target = "_blank"
        link.rel = "noopener noreferrer"
      }

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error downloading file:", error)
    }
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <ImageIcon className="h-8 w-8 text-blue-500" />
    if (mimeType.startsWith("video/")) return <Video className="h-8 w-8 text-red-500" />
    if (mimeType.startsWith("audio/")) return <Music className="h-8 w-8 text-purple-500" />
    if (mimeType === "application/pdf") return <FileText className="h-8 w-8 text-red-600" />
    if (mimeType.startsWith("text/")) return <FileText className="h-8 w-8 text-green-500" />
    return <File className="h-8 w-8 text-gray-500" />
  }

  const renderPreview = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Memuat preview...</span>
        </div>
      )
    }

    if (error || !previewUrl || !fileInfo?.isPreviewable) {
      return (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          {error ? (
            <>
              <FileX className="h-16 w-16 text-red-400" />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Preview Tidak Tersedia</h3>
                <p className="text-gray-600 mb-4">{error}</p>
              </div>
            </>
          ) : (
            <>
              {fileInfo && getFileIcon(fileInfo.type)}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">File Tersedia</h3>
                <p className="text-gray-600 mb-4">
                  Format file ini tidak mendukung preview, tetapi Anda dapat mendownloadnya.
                </p>
              </div>
            </>
          )}

          {fileInfo && (
            <div className="bg-gray-50 p-4 rounded-lg border w-full max-w-md">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Nama File:</span>
                  <span className="text-gray-900 truncate ml-2">{fileInfo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Ukuran:</span>
                  <span className="text-gray-900">{fileInfo.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Tipe:</span>
                  <span className="text-gray-900">{fileInfo.type}</span>
                </div>
              </div>
            </div>
          )}

          <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Download File
          </Button>
        </div>
      )
    }

    const mimeType = fileInfo?.type || type

    if (mimeType.startsWith("image/")) {
      return (
        <div className="flex items-center justify-center">
          <img
            src={previewUrl || "/placeholder.svg"}
            alt={fileName}
            className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
            onError={() => setError("Gagal memuat gambar")}
          />
        </div>
      )
    }

    if (mimeType.startsWith("video/")) {
      return (
        <div className="flex items-center justify-center">
          <video
            src={previewUrl}
            controls
            className="max-w-full max-h-[70vh] rounded-lg shadow-lg"
            onError={() => setError("Gagal memuat video")}
          >
            Browser Anda tidak mendukung tag video.
          </video>
        </div>
      )
    }

    if (mimeType.startsWith("audio/")) {
      return (
        <div className="flex flex-col items-center justify-center space-y-4">
          <Music className="h-16 w-16 text-purple-500" />
          <audio src={previewUrl} controls className="w-full max-w-md" onError={() => setError("Gagal memuat audio")}>
            Browser Anda tidak mendukung tag audio.
          </audio>
          <p className="text-gray-600 text-center">{fileName}</p>
        </div>
      )
    }

    if (mimeType === "application/pdf") {
      return (
        <div className="w-full h-[70vh]">
          <object
            data={previewUrl}
            type="application/pdf"
            className="w-full h-full border-0 rounded-lg"
            onError={() => setError("Gagal memuat PDF")}
          >
            <p>
              Browser Anda tidak mendukung preview PDF.{" "}
              <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                Klik disini untuk membuka PDF
              </a>
            </p>
          </object>
        </div>
      )
    }

    if (mimeType.startsWith("text/") || mimeType === "application/json") {
      return (
        <div className="w-full">
          <ScrollArea className="h-[60vh] w-full border rounded-lg p-4 bg-gray-50">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap break-words">
              <iframe
                src={previewUrl}
                className="w-full h-full border-0"
                title={fileName}
                onError={() => setError("Gagal memuat teks")}
                sandbox="allow-same-origin"
              />
            </pre>
          </ScrollArea>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertTriangle className="h-16 w-16 text-yellow-500" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Preview Tidak Didukung</h3>
          <p className="text-gray-600 mb-4">Format file ini tidak dapat ditampilkan dalam preview.</p>
        </div>
        <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700">
          <Download className="h-4 w-4 mr-2" />
          Download File
        </Button>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-lg font-semibold text-gray-900 truncate">{title}</DialogTitle>
                <p className="text-sm text-gray-600 truncate">{fileName}</p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">{renderPreview()}</div>
      </DialogContent>
    </Dialog>
  )
}

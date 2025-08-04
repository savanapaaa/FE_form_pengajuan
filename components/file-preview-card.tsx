"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, FileImage, FileVideo, FileAudio, File, Eye, Download, ExternalLink } from "lucide-react"
import PreviewModal from "./preview-modal"

interface FileData {
  name: string
  size: number
  type: string
  lastModified: number
  base64?: string
  url?: string
}

interface FilePreviewCardProps {
  fileData: FileData | string
  label?: string
  className?: string
}

const FilePreviewCard: React.FC<FilePreviewCardProps> = ({ fileData, label, className = "" }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Handle string data (links)
  if (typeof fileData === "string") {
    const isUrl = fileData.startsWith("http") || fileData.startsWith("https")

    const handlePreview = () => {
      // For string URLs, validate the URL first
      if (!fileData || typeof fileData !== "string") {
        alert("Invalid file data")
        return
      }

      // Check if it's a valid URL
      try {
        new URL(fileData)
        setIsPreviewOpen(true)
      } catch (error) {
        // If not a valid URL, treat as a file path or identifier
        console.warn("Invalid URL format:", fileData)
        alert("File preview not available - invalid URL format")
      }
    }

    return (
      <>
        <div
          className={`p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors ${className}`}
        >
          <div className="flex items-center space-x-3">
            <ExternalLink className="h-8 w-8 text-blue-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900">{label || "Link/URL"}</p>
              <p className="text-sm text-gray-500 truncate">{fileData}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreview}
                className="hover:bg-indigo-50 hover:text-indigo-600 bg-transparent"
              >
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
              {isUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(fileData, "_blank")}
                  className="hover:bg-blue-50 hover:text-blue-600 bg-transparent"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Buka
                </Button>
              )}
            </div>
          </div>
        </div>

        <PreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          url={fileData}
          type={fileData.split(".").pop()?.toLowerCase() === "pdf" ? "application/pdf" : "text/plain"}
          fileName={fileData.split("/").pop() || "file"}
        />
      </>
    )
  }

  // Handle FileData object
  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <FileImage className="h-8 w-8 text-blue-500" />
    if (type.startsWith("video/")) return <FileVideo className="h-8 w-8 text-red-500" />
    if (type.startsWith("audio/")) return <FileAudio className="h-8 w-8 text-purple-500" />
    if (type.includes("pdf") || type.includes("document")) return <FileText className="h-8 w-8 text-green-500" />
    return <File className="h-8 w-8 text-gray-500" />
  }

  const getFileTypeColor = (type: string) => {
    if (type.startsWith("image/")) return "bg-blue-100 text-blue-800"
    if (type.startsWith("video/")) return "bg-red-100 text-red-800"
    if (type.startsWith("audio/")) return "bg-purple-100 text-purple-800"
    if (type.includes("pdf")) return "bg-green-100 text-green-800"
    if (type.includes("document")) return "bg-orange-100 text-orange-800"
    if (type.includes("text")) return "bg-gray-100 text-gray-800"
    return "bg-gray-100 text-gray-800"
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getPreviewUrl = () => {
    // Priority: url > base64 > fallback
    if (fileData.url) {
      // Validate URL format
      try {
        new URL(fileData.url)
        return fileData.url
      } catch (error) {
        console.warn("Invalid URL format:", fileData.url)
        return null
      }
    }

    if (fileData.base64) {
      // Ensure base64 has proper data URL format
      return fileData.base64.startsWith("data:") ? fileData.base64 : `data:${fileData.type};base64,${fileData.base64}`
    }

    return null
  }

  const handlePreview = () => {
    const previewUrl = getPreviewUrl()

    if (previewUrl) {
      setIsPreviewOpen(true)
    } else {
      alert("Preview not available - file content not accessible")
    }
  }

  const handleDownload = () => {
    const downloadUrl = getPreviewUrl()

    if (downloadUrl) {
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = fileData.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      alert("File tidak dapat diunduh. Hanya metadata yang tersedia.")
    }
  }

  const hasPreviewableContent = getPreviewUrl() !== null

  return (
    <>
      <div
        className={`p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors shadow-sm ${className}`}
      >
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">{getFileIcon(fileData.type)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <p className="font-medium text-gray-900 truncate">{label || fileData.name}</p>
              <Badge variant="secondary" className={getFileTypeColor(fileData.type)}>
                {fileData.type.split("/")[1]?.toUpperCase() || fileData.name.split(".").pop()?.toUpperCase() || "FILE"}
              </Badge>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{formatFileSize(fileData.size)}</span>
              <span>•</span>
              <span>{new Date(fileData.lastModified).toLocaleDateString("id-ID")}</span>
              {!hasPreviewableContent && (
                <>
                  <span>•</span>
                  <span className="text-orange-600 text-xs">Metadata saja</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreview}
              className={`hover:bg-indigo-50 hover:text-indigo-600 bg-transparent ${
                !hasPreviewableContent ? "opacity-50" : ""
              }`}
              title={hasPreviewableContent ? "Preview file" : "Hanya metadata tersedia"}
            >
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className={`hover:bg-green-50 hover:text-green-600 bg-transparent ${
                !hasPreviewableContent ? "opacity-50" : ""
              }`}
              title={hasPreviewableContent ? "Download file" : "File tidak dapat diunduh"}
              disabled={!hasPreviewableContent}
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        </div>
      </div>

      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        url={getPreviewUrl() || ""}
        type={fileData.type}
        fileName={fileData.name}
      />
    </>
  )
}

export default FilePreviewCard

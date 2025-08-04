import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { FileText, ImageIcon, Video, Music, File } from "lucide-react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Enhanced FileData interface for better file handling
export interface FileData {
  name: string
  size: number
  type: string
  lastModified: number
  base64?: string // For preview and persistence
  preview?: string // Optimized preview URL
  thumbnailBase64?: string // Compressed thumbnail for lists
}

// Content item interface
export interface ContentItem {
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

  narasiFile: FileData | string | null
  suratFile: FileData | string | null
  audioDubbingFile: FileData | string | null
  audioDubbingLainLainFile: FileData | string | null
  audioBacksoundFile: FileData | string | null
  audioBacksoundLainLainFile: FileData | string | null
  pendukungVideoFile: FileData | string | null
  pendukungFotoFile: FileData | string | null
  pendukungLainLainFile: FileData | string | null

  narasiFileId?: string
  suratFileId?: string
  audioDubbingFileId?: string
  audioDubbingLainLainFileId?: string
  audioBacksoundFileId?: string
  audioBacksoundLainLainFileId?: string
  pendukungVideoFileId?: string
  pendukungFotoFileId?: string
  pendukungLainLainFileId?: string

  tanggalOrderMasuk: Date | undefined
  tanggalJadi: Date | undefined
  tanggalTayang: Date | undefined
  keterangan: string
  status?: "pending" | "approved" | "rejected"
  alasanPenolakan?: string
  tanggalDiproses?: string
  diprosesoleh?: string

  narasiSourceType: ("text" | "file" | "surat")[]
  audioDubbingSourceType: ("file-audio" | "lain-lain")[]
  audioBacksoundSourceType: ("file-audio" | "lain-lain")[]
  pendukungLainnyaSourceType: ("video" | "foto" | "lain-lain")[]

  narasiFileManualText?: string
  suratFileManualText?: string
  audioDubbingFileManualText?: string
  audioDubbingLainLainFileManualText?: string
  audioBacksoundFileManualText?: string
  audioBacksoundLainLainFileManualText?: string
  pendukungVideoFileManualText?: string
  pendukungFotoFileManualText?: string
  pendukungLainLainFileManualText?: string

  // Additional fields for validation and production
  isTayang?: boolean
  outputFile?: FileData | string | null
  outputFileId?: string
  outputNotes?: string
}

// Main submission interface
export interface Submission {
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
  uploadedBuktiMengetahui: FileData | string | null
  isConfirmed: boolean
  contentItems?: ContentItem[]
  workflowStage?: "submitted" | "review" | "validation" | "completed"
}

// Storage functions
export const saveSubmissionsToStorage = (submissions: Submission[]) => {
  try {
    const serializedSubmissions = submissions.map((submission) => ({
      ...submission,
      tanggalOrder: submission.tanggalOrder.toISOString(),
      tanggalSubmit: submission.tanggalSubmit.toISOString(),
      contentItems: submission.contentItems?.map((item) => ({
        ...item,
        tanggalOrderMasuk: item.tanggalOrderMasuk?.toISOString(),
        tanggalJadi: item.tanggalJadi?.toISOString(),
        tanggalTayang: item.tanggalTayang?.toISOString(),
      })),
    }))

    localStorage.setItem("submissions", JSON.stringify(serializedSubmissions))
  } catch (error) {
    console.error("Error saving submissions to storage:", error)
  }
}

export const loadSubmissionsFromStorage = (): Submission[] => {
  try {
    const stored = localStorage.getItem("submissions")
    if (!stored) return []

    const parsed = JSON.parse(stored)
    return parsed.map((submission: any) => ({
      ...submission,
      tanggalOrder: new Date(submission.tanggalOrder),
      tanggalSubmit: new Date(submission.tanggalSubmit),
      contentItems: submission.contentItems?.map((item: any) => ({
        ...item,
        tanggalOrderMasuk: item.tanggalOrderMasuk ? new Date(item.tanggalOrderMasuk) : undefined,
        tanggalJadi: item.tanggalJadi ? new Date(item.tanggalJadi) : undefined,
        tanggalTayang: item.tanggalTayang ? new Date(item.tanggalTayang) : undefined,
      })),
    }))
  } catch (error) {
    console.error("Error loading submissions from storage:", error)
    return []
  }
}

// File handling utilities
export const createFilePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export const isImageFile = (file: File | FileData | string): boolean => {
  if (typeof file === "string") {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file)
  }

  if (file instanceof File) {
    return file.type.startsWith("image/")
  }

  if (typeof file === "object" && file.type) {
    return file.type.startsWith("image/")
  }

  return false
}

export const getFileExtension = (filename: string): string => {
  return filename.split(".").pop()?.toLowerCase() || ""
}

export const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// File icon utility
export const getFileIcon = (file: any) => {
  if (!file) return <File className="h-5 w-5 text-gray-500" />

  let fileType = ""

  // Determine file type
  if (typeof file === "string") {
    const extension = file.split(".").pop()?.toLowerCase()
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension || "")) {
      fileType = "image"
    } else if (["mp4", "avi", "mov", "wmv", "flv", "webm"].includes(extension || "")) {
      fileType = "video"
    } else if (["mp3", "wav", "ogg", "aac", "flac"].includes(extension || "")) {
      fileType = "audio"
    } else {
      fileType = "document"
    }
  } else if (file instanceof File) {
    fileType = file.type.split("/")[0]
  } else if (file && typeof file === "object" && file.type) {
    fileType = file.type.split("/")[0]
  }

  // Return appropriate icon
  switch (fileType) {
    case "image":
      return <ImageIcon className="h-5 w-5 text-blue-500" />
    case "video":
      return <Video className="h-5 w-5 text-red-500" />
    case "audio":
      return <Music className="h-5 w-5 text-purple-500" />
    default:
      return <FileText className="h-5 w-5 text-gray-500" />
  }
}

// Download file utility
export const downloadFile = (file: any, filename?: string) => {
  try {
    let url = ""
    let downloadName = filename || "download"

    if (typeof file === "string") {
      if (file.startsWith("http://") || file.startsWith("https://")) {
        // It's a URL, open in new tab
        window.open(file, "_blank")
        return
      } else if (file.startsWith("data:")) {
        // It's a data URL
        url = file
        downloadName = filename || "file"
      } else {
        // It's a file path or name
        downloadName = file
        console.warn("Cannot download file: Invalid file data")
        return
      }
    } else if (file instanceof File) {
      // It's a File object
      url = URL.createObjectURL(file)
      downloadName = filename || file.name
    } else if (file && typeof file === "object") {
      if (file.base64) {
        // It's a FileData object with base64
        const mimeType = file.type || "application/octet-stream"
        url = `data:${mimeType};base64,${file.base64}`
        downloadName = filename || file.name || "file"
      } else if (file.url) {
        // It's an object with URL
        url = file.url
        downloadName = filename || file.name || "file"
      } else {
        console.warn("Cannot download file: Invalid file object")
        return
      }
    } else {
      console.warn("Cannot download file: Unsupported file type")
      return
    }

    // Create download link and trigger download
    const link = document.createElement("a")
    link.href = url
    link.download = downloadName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Clean up blob URL if created
    if (url.startsWith("blob:")) {
      setTimeout(() => URL.revokeObjectURL(url), 100)
    }
  } catch (error) {
    console.error("Error downloading file:", error)
  }
}

// Date formatting utilities
export const formatDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/
  return phoneRegex.test(phone.replace(/\s/g, ""))
}

export const validateRequired = (value: any): boolean => {
  if (typeof value === "string") {
    return value.trim().length > 0
  }
  return value !== null && value !== undefined
}

// Content type utilities
export const getContentTypeDisplayName = (type: string): string => {
  const typeNames: Record<string, string> = {
    infografis: "Infografis",
    "naskah-berita": "Naskah Berita",
    audio: "Audio",
    video: "Video",
    fotografis: "Fotografis",
    bumper: "Bumper",
  }
  return typeNames[type] || type.charAt(0).toUpperCase() + type.slice(1).replace("-", " ")
}

export const getWorkflowStageDisplayName = (stage: string): string => {
  const stageNames: Record<string, string> = {
    submitted: "Terkirim",
    review: "Review",
    validation: "Validasi",
    completed: "Selesai",
  }
  return stageNames[stage] || stage
}

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    submitted: "bg-blue-100 text-blue-800",
    review: "bg-orange-100 text-orange-800",
    validation: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
  }
  return colors[status] || "bg-gray-100 text-gray-800"
}

// Local storage utilities with error handling
export const setLocalStorage = (key: string, value: any): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error)
    return false
  }
}

export const getLocalStorage = (key: string, defaultValue: any = null): any => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error getting localStorage key "${key}":`, error)
    return defaultValue
  }
}

export const removeLocalStorage = (key: string): boolean => {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error)
    return false
  }
}

// URL utilities
export const createBlobUrl = (data: string | Blob): string => {
  if (typeof data === "string" && data.startsWith("data:")) {
    // Convert data URL to blob
    const arr = data.split(",")
    const mime = arr[0].match(/:(.*?);/)?.[1] || "application/octet-stream"
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    const blob = new Blob([u8arr], { type: mime })
    return URL.createObjectURL(blob)
  }

  if (data instanceof Blob) {
    return URL.createObjectURL(data)
  }

  return data as string
}

export const revokeBlobUrl = (url: string): void => {
  if (url.startsWith("blob:")) {
    URL.revokeObjectURL(url)
  }
}

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle utility
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

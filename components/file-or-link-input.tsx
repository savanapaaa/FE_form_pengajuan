"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Link, FileText, X, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface FileData {
  name: string
  size: number
  type: string
  lastModified: number
  base64?: string
  url?: string
}

interface FileOrLinkInputProps {
  value?: FileData | string
  onChange: (value: FileData | string | undefined) => void
  currentType: "file" | "link" | "text"
  disabled?: boolean
}

const FileOrLinkInput: React.FC<FileOrLinkInputProps> = ({ value, onChange, currentType, disabled = false }) => {
  const [activeTab, setActiveTab] = useState<"file" | "link" | "text">(currentType)
  const [dragOver, setDragOver] = useState(false)
  const [linkValue, setLinkValue] = useState(typeof value === "string" ? value : "")
  const [textValue, setTextValue] = useState(typeof value === "string" ? value : "")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return

      const file = files[0]
      const reader = new FileReader()

      reader.onload = (e) => {
        const fileData: FileData = {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          base64: e.target?.result as string,
        }
        onChange(fileData)
      }

      reader.readAsDataURL(file)
    },
    [onChange],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      if (disabled) return
      handleFileSelect(e.dataTransfer.files)
    },
    [handleFileSelect, disabled],
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!disabled) setDragOver(true)
    },
    [disabled],
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(e.target.files)
    },
    [handleFileSelect],
  )

  const handleLinkChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setLinkValue(newValue)
      onChange(newValue || undefined)
    },
    [onChange],
  )

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value
      setTextValue(newValue)
      onChange(newValue || undefined)
    },
    [onChange],
  )

  const clearValue = useCallback(() => {
    onChange(undefined)
    setLinkValue("")
    setTextValue("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [onChange])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const isFileValue = typeof value === "object" && value !== null
  const hasValue = Boolean(value)

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className="flex mb-4">
        <button
          type="button"
          onClick={() => setActiveTab("file")}
          disabled={disabled}
          className={`flex-1 py-3 px-6 text-sm font-medium rounded-l-xl transition-all duration-200 ${
            activeTab === "file"
              ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Upload className="h-4 w-4 mr-2 inline" />
          Unggah File
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("link")}
          disabled={disabled}
          className={`flex-1 py-3 px-6 text-sm font-medium transition-all duration-200 ${
            activeTab === "link"
              ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Link className="h-4 w-4 mr-2 inline" />
          Sediakan Tautan
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("text")}
          disabled={disabled}
          className={`flex-1 py-3 px-6 text-sm font-medium rounded-r-xl transition-all duration-200 ${
            activeTab === "text"
              ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <FileText className="h-4 w-4 mr-2 inline" />
          Input Teks
        </button>
      </div>

      {/* Content Area */}
      <div className="border-2 border-dashed border-gray-200 rounded-xl bg-white">
        <AnimatePresence mode="wait">
          {activeTab === "file" && (
            <motion.div
              key="file"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {hasValue && isFileValue ? (
                <div className="p-6 bg-green-50 border-green-200 border-2 border-dashed rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-green-800">{value.name}</p>
                        <p className="text-sm text-green-600">{formatFileSize(value.size)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearValue}
                      disabled={disabled}
                      className="text-green-600 hover:text-green-800 hover:bg-green-100"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className={`p-12 text-center transition-all duration-200 ${
                    dragOver
                      ? "bg-purple-50 border-purple-300 border-2 border-dashed"
                      : "hover:bg-gray-50 cursor-pointer"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => !disabled && fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">Klik untuk memilih file</p>
                  <p className="text-gray-500 mb-4">atau seret dan lepas file di sini</p>
                  <p className="text-sm text-gray-400">
                    Format yang didukung: jpg, jpeg, png, gif, bmp, pdf, doc, docx
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileInputChange}
                    disabled={disabled}
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.gif,.bmp,.pdf,.doc,.docx"
                  />
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "link" && (
            <motion.div
              key="link"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-6"
            >
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <Link className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">Masukkan URL/Link</p>
                  <p className="text-gray-500">Berikan tautan ke file atau halaman web</p>
                </div>
                <Input
                  type="url"
                  placeholder="https://example.com/file.pdf"
                  value={linkValue}
                  onChange={handleLinkChange}
                  disabled={disabled}
                  className="text-center text-lg py-3"
                />
                {hasValue && typeof value === "string" && (
                  <div className="flex justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearValue}
                      disabled={disabled}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Hapus Link
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "text" && (
            <motion.div
              key="text"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-6"
            >
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">Input Teks Manual</p>
                  <p className="text-gray-500">Ketik atau tempel teks secara langsung</p>
                </div>
                <Textarea
                  placeholder="Masukkan teks di sini..."
                  value={textValue}
                  onChange={handleTextChange}
                  disabled={disabled}
                  rows={6}
                  className="text-base resize-none"
                />
                {hasValue && typeof value === "string" && (
                  <div className="flex justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearValue}
                      disabled={disabled}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Hapus Teks
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default FileOrLinkInput

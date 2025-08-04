"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Camera, Trash2, RotateCw, Check, Scan, ImageIcon, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface PhotoFormScannerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onCapture: (file: File) => void
  onCancel?: () => void
}

export function PhotoFormScanner({ isOpen, onOpenChange, onCapture, onCancel }: PhotoFormScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")

  // Start camera when dialog opens
  useEffect(() => {
    if (isOpen) {
      startCamera()
    } else {
      stopCamera()
      setCapturedImage(null)
      setError(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    setIsLoading(true)
    setError(null)
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        })
        setStream(mediaStream)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      } else {
        setError("Kamera tidak tersedia di perangkat ini")
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      setError("Gagal mengakses kamera. Pastikan Anda memberikan izin akses kamera.")
    } finally {
      setIsLoading(false)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop()
      })
      setStream(null)
    }
  }

  const switchCamera = () => {
    stopCamera()
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"))
    setTimeout(() => {
      startCamera()
    }, 300)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Draw the current video frame to the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convert canvas to data URL
        const imageDataUrl = canvas.toDataURL("image/jpeg", 0.8)
        setCapturedImage(imageDataUrl)

        // Stop the camera after capturing
        stopCamera()
      }
    }
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    startCamera()
  }

  const confirmPhoto = () => {
    if (capturedImage) {
      // Convert data URL to File object
      fetch(capturedImage)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "form-scan.jpg", { type: "image/jpeg" })
          onCapture(file)
          onOpenChange(false)
        })
        .catch((err) => {
          console.error("Error converting image:", err)
          setError("Gagal memproses gambar")
        })
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center">
            <Scan className="h-5 w-5 mr-2 text-blue-600" />
            Scan Dokumen
          </DialogTitle>
        </DialogHeader>

        <div className="relative aspect-[3/4] w-full bg-black rounded-lg overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
              <Loader2 className="h-10 w-10 text-white animate-spin" />
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-6 text-center">
              <ImageIcon className="h-16 w-16 mb-4 text-red-400" />
              <p className="mb-4">{error}</p>
              <Button onClick={startCamera} variant="outline" className="bg-white text-gray-900">
                Coba Lagi
              </Button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {capturedImage ? (
              <motion.div
                key="captured"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full w-full"
              >
                <img
                  src={capturedImage || "/placeholder.svg"}
                  alt="Captured"
                  className="h-full w-full object-contain"
                />
              </motion.div>
            ) : (
              <motion.div
                key="video"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full w-full"
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                  style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hidden canvas for capturing */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3">
          {capturedImage ? (
            <>
              <Button
                variant="outline"
                onClick={retakePhoto}
                className="flex-1 flex items-center justify-center bg-transparent"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Ambil Ulang
              </Button>
              <Button
                onClick={confirmPhoto}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 flex items-center justify-center"
              >
                <Check className="h-4 w-4 mr-2" />
                Gunakan Foto
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel} className="flex-1 bg-transparent">
                Batal
              </Button>
              <Button
                onClick={switchCamera}
                variant="outline"
                className="flex-1 flex items-center justify-center bg-transparent"
                disabled={isLoading || !!error}
              >
                <RotateCw className="h-4 w-4 mr-2" />
                Putar Kamera
              </Button>
              <Button
                onClick={capturePhoto}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center"
                disabled={isLoading || !!error || !stream}
              >
                <Camera className="h-4 w-4 mr-2" />
                Ambil Foto
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

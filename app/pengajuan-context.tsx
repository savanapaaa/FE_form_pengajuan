"use client"

import React, { createContext, useContext, useState, useCallback, useMemo } from "react"

export interface FileData {
  id: string
  name: string
  size: number
  type: string
  url: string
  file?: File
}

export interface PengajuanData {
  id: string
  tanggal: string
  nama: string
  instansi: string
  jabatan: string
  nomorTelepon: string
  email: string
  jenisKonten: string[]
  judulKonten: string
  deskripsiKonten: string
  targetAudiens: string
  tujuanKonten: string
  deadlinePublikasi: string
  platformPublikasi: string[]
  files: FileData[]
  links: string[]
  catatanTambahan: string
  status: "pending" | "approved" | "rejected" | "in_review" | "validated"
  reviewNotes?: string
  validationNotes?: string
  reviewedBy?: string
  validatedBy?: string
  reviewedAt?: string
  validatedAt?: string
}

interface PengajuanContextType {
  submissions: PengajuanData[]
  addSubmission: (data: PengajuanData) => void
  updateSubmission: (id: string, data: Partial<PengajuanData>) => void
  getSubmissionById: (id: string) => PengajuanData | undefined
  getSubmissionsByStatus: (status: PengajuanData["status"]) => PengajuanData[]
  refreshData: () => void
}

const PengajuanContext = createContext<PengajuanContextType | undefined>(undefined)

export const usePengajuan = () => {
  const context = useContext(PengajuanContext)
  if (context === undefined) {
    throw new Error("usePengajuan must be used within a PengajuanProvider")
  }
  return context
}

// Optimized provider with memoization
export const PengajuanProvider = React.memo(function PengajuanProvider({ children }: { children: React.ReactNode }) {
  const [submissions, setSubmissions] = useState<PengajuanData[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("pengajuan-submissions")
        return stored ? JSON.parse(stored) : []
      } catch {
        return []
      }
    }
    return []
  })

  const addSubmission = useCallback((data: PengajuanData) => {
    setSubmissions((prev) => {
      const updated = [...prev, data]
      if (typeof window !== "undefined") {
        localStorage.setItem("pengajuan-submissions", JSON.stringify(updated))
      }
      return updated
    })
  }, [])

  const updateSubmission = useCallback((id: string, data: Partial<PengajuanData>) => {
    setSubmissions((prev) => {
      const updated = prev.map((submission) => (submission.id === id ? { ...submission, ...data } : submission))
      if (typeof window !== "undefined") {
        localStorage.setItem("pengajuan-submissions", JSON.stringify(updated))
      }
      return updated
    })
  }, [])

  const getSubmissionById = useCallback(
    (id: string) => {
      return submissions.find((submission) => submission.id === id)
    },
    [submissions],
  )

  const getSubmissionsByStatus = useCallback(
    (status: PengajuanData["status"]) => {
      return submissions.filter((submission) => submission.status === status)
    },
    [submissions],
  )

  const refreshData = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("pengajuan-submissions")
        setSubmissions(stored ? JSON.parse(stored) : [])
      } catch {
        setSubmissions([])
      }
    }
  }, [])

  const contextValue = useMemo(
    () => ({
      submissions,
      addSubmission,
      updateSubmission,
      getSubmissionById,
      getSubmissionsByStatus,
      refreshData,
    }),
    [submissions, addSubmission, updateSubmission, getSubmissionById, getSubmissionsByStatus, refreshData],
  )

  return <PengajuanContext.Provider value={contextValue}>{children}</PengajuanContext.Provider>
})

"use client"

import { useContext } from "react"
import { useRouter } from "next/navigation"
import { PengajuanContext } from "./pengajuan-context"

const HalamanReview = () => {
  const { pengajuan, setStatus } = useContext(PengajuanContext)
  const router = useRouter()

  const handleApprove = (id: string) => {
    setStatus(id, "disetujui")
    router.push("/validasi")
  }

  const handleReject = (id: string) => {
    setStatus(id, "ditolak")
  }

  return (
    <div>
      <h2>Halaman Review</h2>
      {pengajuan.map((item) => (
        <div key={item.id}>
          <p>Judul: {item.judul}</p>
          <button onClick={() => handleApprove(item.id)}>Setujui</button>
          <button onClick={() => handleReject(item.id)}>Tolak</button>
        </div>
      ))}
    </div>
  )
}

export default HalamanReview

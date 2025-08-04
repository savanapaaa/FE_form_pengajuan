"use client"

import { useContext } from "react"
import { useRouter } from "next/navigation"
import { PengajuanContext } from "./pengajuan-context"

const HalamanValidasi = () => {
  const { pengajuan, setStatus } = useContext(PengajuanContext)
  const router = useRouter()

  const handleValid = (id: string) => {
    setStatus(id, "valid")
    router.push("/rekap")
  }

  const handleInvalid = (id: string) => {
    setStatus(id, "tidak valid")
  }

  return (
    <div>
      <h2>Halaman Validasi</h2>
      {pengajuan.map((item) => (
        <div key={item.id}>
          <p>Judul: {item.judul}</p>
          <button onClick={() => handleValid(item.id)}>Valid</button>
          <button onClick={() => handleInvalid(item.id)}>Tidak Valid</button>
        </div>
      ))}
    </div>
  )
}

export default HalamanValidasi

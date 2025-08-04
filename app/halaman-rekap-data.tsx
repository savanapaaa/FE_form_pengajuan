"use client"

import { useContext } from "react"
import { PengajuanContext } from "./pengajuan-context"

const HalamanRekapData = () => {
  const { pengajuan } = useContext(PengajuanContext)

  return (
    <div>
      <h2>Halaman Rekap Data</h2>
      {pengajuan.map((item) => (
        <div key={item.id}>
          <p>Judul: {item.judul}</p>
          <p>Status: {item.status}</p>
        </div>
      ))}
    </div>
  )
}

export default HalamanRekapData

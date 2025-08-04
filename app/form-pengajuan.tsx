"use client"

import { useContext } from "react"
import { useRouter } from "next/navigation"
import { PengajuanContext } from "./pengajuan-context"

const FormPengajuan = () => {
  const { tambahPengajuan } = useContext(PengajuanContext)
  const router = useRouter()

  const handleSubmit = (data: any) => {
    tambahPengajuan(data)
    router.push("/review")
  }

  return (
    <div>
      <h2>Form Pengajuan</h2>
      <form onSubmit={() => handleSubmit({})}>
        <button type="submit">Submit Pengajuan</button>
      </form>
    </div>
  )
}

export default FormPengajuan

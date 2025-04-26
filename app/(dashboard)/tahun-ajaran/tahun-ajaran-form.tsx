"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ModalForm } from "@/components/ui/modal-form"
import { useToast } from "@/components/ui/use-toast"

interface TahunAjaran {
  id: number
  nama: string
  nominal_spp: number
  created_at: string
  updated_at: string
}

interface TahunAjaranFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
  tahunAjaran: TahunAjaran | null
}

export function TahunAjaranForm({ isOpen, onClose, onSubmit, tahunAjaran }: TahunAjaranFormProps) {
  const [nama, setNama] = useState("")
  const [nominalSpp, setNominalSpp] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (tahunAjaran) {
      setNama(tahunAjaran.nama)
      setNominalSpp(tahunAjaran.nominal_spp.toString())
    } else {
      setNama("")
      setNominalSpp("")
    }
  }, [tahunAjaran])

  const handleSubmitForm = async () => {
    if (!nama || !nominalSpp) {
      toast({
        title: "Error",
        description: "Nama dan nominal SPP harus diisi",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const url = tahunAjaran ? `/api/tahun-ajaran/${tahunAjaran.id}` : "/api/tahun-ajaran"
      const method = tahunAjaran ? "PUT" : "POST"

      console.log("Submitting form:", { url, method, nama, nominal_spp: Number.parseFloat(nominalSpp) })

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama,
          nominal_spp: Number.parseFloat(nominalSpp),
        }),
      })

      const data = await response.json()
      console.log("Response:", data)

      if (!response.ok) {
        throw new Error(data.message || "Terjadi kesalahan saat menyimpan data")
      }

      toast({
        title: "Berhasil",
        description: tahunAjaran ? "Data tahun ajaran berhasil diperbarui" : "Data tahun ajaran berhasil disimpan",
      })

      onSubmit()
    } catch (error: any) {
      console.error("Error submitting form:", error)
      toast({
        title: "Error",
        description: error.message || "Terjadi kesalahan saat menyimpan data",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ModalForm
      title={tahunAjaran ? "Edit Tahun Ajaran" : "Tambah Tahun Ajaran"}
      description="Masukkan data tahun ajaran dan nominal SPP"
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmitForm}
      isSubmitting={isSubmitting}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nama">Tahun Ajaran</Label>
          <Input
            id="nama"
            placeholder="Contoh: 2023/2024"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nominal_spp">Nominal SPP</Label>
          <Input
            id="nominal_spp"
            type="number"
            placeholder="Contoh: 500000"
            value={nominalSpp}
            onChange={(e) => setNominalSpp(e.target.value)}
            required
          />
        </div>
      </div>
    </ModalForm>
  )
}

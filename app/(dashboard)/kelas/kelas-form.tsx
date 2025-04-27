"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ModalForm } from "@/components/ui/modal-form"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Kelas {
  id: number
  nama: string
  tingkat: string
  wali_kelas: string
  created_at: string
  updated_at: string
}

interface KelasFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
  kelas: Kelas | null
}

// Opsi tingkat kelas
const tingkatOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]

export function KelasForm({ isOpen, onClose, onSubmit, kelas }: KelasFormProps) {
  const [nama, setNama] = useState("")
  const [tingkat, setTingkat] = useState("")
  const [waliKelas, setWaliKelas] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (kelas) {
      setNama(kelas.nama)
      setTingkat(kelas.tingkat)
      setWaliKelas(kelas.wali_kelas || "")
    } else {
      setNama("")
      setTingkat("")
      setWaliKelas("")
    }
  }, [kelas])

  const handleSubmitForm = async () => {
    if (!nama || !tingkat) {
      toast({
        title: "Error",
        description: "Nama dan tingkat kelas harus diisi",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const url = kelas ? `/api/kelas/${kelas.id}` : "/api/kelas"
      const method = kelas ? "PUT" : "POST"

      console.log("Submitting form:", { url, method, nama, tingkat, wali_kelas: waliKelas })

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama,
          tingkat,
          wali_kelas: waliKelas,
        }),
      })

      const data = await response.json()
      console.log("Response:", data)

      if (!response.ok) {
        throw new Error(data.message || "Terjadi kesalahan saat menyimpan data")
      }

      toast({
        title: "Berhasil",
        description: kelas ? "Data kelas berhasil diperbarui" : "Data kelas berhasil disimpan",
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
      title={kelas ? "Edit Kelas" : "Tambah Kelas"}
      description="Masukkan data kelas"
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmitForm}
      isSubmitting={isSubmitting}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nama">Nama Kelas</Label>
          <Input id="nama" placeholder="Contoh: 10-A" value={nama} onChange={(e) => setNama(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tingkat">Tingkat</Label>
          <Select value={tingkat} onValueChange={setTingkat} required>
            <SelectTrigger>
              <SelectValue placeholder="Pilih tingkat kelas" />
            </SelectTrigger>
            <SelectContent>
              {tingkatOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="wali_kelas">Wali Kelas</Label>
          <Input
            id="wali_kelas"
            placeholder="Contoh: Budi Santoso"
            value={waliKelas}
            onChange={(e) => setWaliKelas(e.target.value)}
          />
        </div>
      </div>
    </ModalForm>
  )
}

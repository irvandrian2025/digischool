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
}

interface Siswa {
  id: number
  nis: string
  nama: string
  jenis_kelamin: string
  alamat: string
  tanggal_lahir: string
  no_hp: string
  email: string
  kelas_id: number
  created_at: string
  updated_at: string
}

interface SiswaFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
  siswa: Siswa | null
  kelasList: Kelas[]
}

export function SiswaForm({ isOpen, onClose, onSubmit, siswa, kelasList }: SiswaFormProps) {
  const [nis, setNis] = useState("")
  const [nama, setNama] = useState("")
  const [jenisKelamin, setJenisKelamin] = useState("")
  const [alamat, setAlamat] = useState("")
  const [tanggalLahir, setTanggalLahir] = useState("")
  const [noHp, setNoHp] = useState("")
  const [email, setEmail] = useState("")
  const [kelasId, setKelasId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (siswa) {
      setNis(siswa.nis)
      setNama(siswa.nama)
      setJenisKelamin(siswa.jenis_kelamin)
      setAlamat(siswa.alamat || "")
      setTanggalLahir(siswa.tanggal_lahir ? siswa.tanggal_lahir.split("T")[0] : "")
      setNoHp(siswa.no_hp || "")
      setEmail(siswa.email || "")
      setKelasId(siswa.kelas_id.toString())
    } else {
      setNis("")
      setNama("")
      setJenisKelamin("")
      setAlamat("")
      setTanggalLahir("")
      setNoHp("")
      setEmail("")
      setKelasId("")
    }
  }, [siswa])

  const handleSubmitForm = async () => {
    if (!nis || !nama || !jenisKelamin || !kelasId) {
      toast({
        title: "Error",
        description: "NIS, nama, jenis kelamin, dan kelas harus diisi",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const url = siswa ? `/api/siswa/${siswa.id}` : "/api/siswa"
      const method = siswa ? "PUT" : "POST"

      console.log("Submitting form:", { url, method, nis, nama, jenisKelamin, kelasId })

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nis,
          nama,
          jenis_kelamin: jenisKelamin,
          alamat,
          tanggal_lahir: tanggalLahir,
          no_hp: noHp,
          email,
          kelas_id: Number.parseInt(kelasId),
        }),
      })

      const data = await response.json()
      console.log("Response:", data)

      if (!response.ok) {
        throw new Error(data.message || "Terjadi kesalahan saat menyimpan data")
      }

      toast({
        title: "Berhasil",
        description: siswa ? "Data siswa berhasil diperbarui" : "Data siswa berhasil disimpan",
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
      title={siswa ? "Edit Siswa" : "Tambah Siswa"}
      description="Masukkan data siswa"
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmitForm}
      isSubmitting={isSubmitting}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nis">NIS</Label>
          <Input id="nis" placeholder="Contoh: 10001" value={nis} onChange={(e) => setNis(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nama">Nama Lengkap</Label>
          <Input
            id="nama"
            placeholder="Contoh: Budi Santoso"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="jenis_kelamin">Jenis Kelamin</Label>
          <Select value={jenisKelamin} onValueChange={setJenisKelamin} required>
            <SelectTrigger>
              <SelectValue placeholder="Pilih jenis kelamin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="L">Laki-laki</SelectItem>
              <SelectItem value="P">Perempuan</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="kelas_id">Kelas</Label>
          <Select value={kelasId} onValueChange={setKelasId} required>
            <SelectTrigger>
              <SelectValue placeholder="Pilih kelas" />
            </SelectTrigger>
            <SelectContent>
              {kelasList.length > 0 ? (
                kelasList.map((kelas) => (
                  <SelectItem key={kelas.id} value={kelas.id.toString()}>
                    {kelas.nama}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="loading" disabled>
                  Tidak ada data kelas
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="alamat">Alamat</Label>
          <Input
            id="alamat"
            placeholder="Contoh: Jl. Pendidikan No. 1"
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tanggal_lahir">Tanggal Lahir</Label>
          <Input
            id="tanggal_lahir"
            type="date"
            value={tanggalLahir}
            onChange={(e) => setTanggalLahir(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="no_hp">Nomor HP</Label>
          <Input id="no_hp" placeholder="Contoh: 081234567890" value={noHp} onChange={(e) => setNoHp(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Contoh: budi@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>
    </ModalForm>
  )
}

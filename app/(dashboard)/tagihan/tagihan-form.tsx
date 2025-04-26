"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ModalForm } from "@/components/ui/modal-form"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface Tagihan {
  id: number
  siswa_id: number
  tahun_ajaran_id: number
  bulan: string
  tahun: number
  nominal: number
  status: string
  tanggal_jatuh_tempo: string
  keterangan: string
  siswa_nama?: string
  tahun_ajaran_nama?: string
  created_at: string
  updated_at: string
}

interface TahunAjaran {
  id: number
  nama: string
  nominal_spp: number
}

interface Siswa {
  id: number
  nis: string
  nama: string
  kelas_id: number
  kelas_nama?: string
}

interface TagihanFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
  tagihan: Tagihan | null
  tahunAjaranList: TahunAjaran[]
}

export function TagihanForm({ isOpen, onClose, onSubmit, tagihan, tahunAjaranList }: TagihanFormProps) {
  const [siswaId, setSiswaId] = useState("")
  const [tahunAjaranId, setTahunAjaranId] = useState("")
  const [bulan, setBulan] = useState("")
  const [tahun, setTahun] = useState("")
  const [nominal, setNominal] = useState("")
  const [status, setStatus] = useState("")
  const [tanggalJatuhTempo, setTanggalJatuhTempo] = useState("")
  const [keterangan, setKeterangan] = useState("")
  const [siswaList, setSiswaList] = useState<Siswa[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingSiswa, setIsLoadingSiswa] = useState(false)
  const { toast } = useToast()

  const bulanOptions = [
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
  ]

  const statusOptions = ["pending", "paid", "failed"]

  useEffect(() => {
    if (isOpen) {
      fetchSiswaList()
    }
  }, [isOpen])

  useEffect(() => {
    if (tagihan) {
      // Edit mode
      setSiswaId(tagihan.siswa_id.toString())
      setTahunAjaranId(tagihan.tahun_ajaran_id.toString())
      setBulan(tagihan.bulan)
      setTahun(tagihan.tahun.toString())
      setNominal(tagihan.nominal.toString())
      setStatus(tagihan.status)
      setTanggalJatuhTempo(tagihan.tanggal_jatuh_tempo ? tagihan.tanggal_jatuh_tempo.split("T")[0] : "")
      setKeterangan(tagihan.keterangan || "")
    } else {
      // Add mode
      setSiswaId("")
      setTahunAjaranId("")
      setBulan("")
      setTahun("")
      setNominal("")
      setStatus("pending")
      setTanggalJatuhTempo("")
      setKeterangan("")
    }
  }, [tagihan])

  const fetchSiswaList = async () => {
    try {
      setIsLoadingSiswa(true)
      const response = await fetch("/api/siswa")
      const data = await response.json()

      if (response.ok) {
        setSiswaList(data.data)
      } else {
        toast({
          title: "Error",
          description: data.message || "Gagal mengambil data siswa",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching siswa:", error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengambil data siswa",
        variant: "destructive",
      })
    } finally {
      setIsLoadingSiswa(false)
    }
  }

  const handleSubmitForm = async () => {
    if (tagihan) {
      // Edit mode - validate all fields
      if (!siswaId || !tahunAjaranId || !bulan || !tahun || !nominal || !status || !tanggalJatuhTempo) {
        toast({
          title: "Error",
          description: "Semua field harus diisi kecuali keterangan",
          variant: "destructive",
        })
        return
      }

      setIsSubmitting(true)

      try {
        const response = await fetch(`/api/tagihan/${tagihan.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            siswa_id: Number.parseInt(siswaId),
            tahun_ajaran_id: Number.parseInt(tahunAjaranId),
            bulan,
            tahun: Number.parseInt(tahun),
            nominal: Number.parseFloat(nominal),
            status,
            tanggal_jatuh_tempo: tanggalJatuhTempo,
            keterangan,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "Terjadi kesalahan saat menyimpan data")
        }

        toast({
          title: "Berhasil",
          description: "Data tagihan berhasil diperbarui",
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
    } else {
      // Add mode - validate required fields
      if (!siswaId || !tahunAjaranId) {
        toast({
          title: "Error",
          description: "Siswa dan tahun ajaran harus diisi",
          variant: "destructive",
        })
        return
      }

      setIsSubmitting(true)

      try {
        const response = await fetch("/api/tagihan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            siswa_id: Number.parseInt(siswaId),
            tahun_ajaran_id: Number.parseInt(tahunAjaranId),
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "Terjadi kesalahan saat menyimpan data")
        }

        toast({
          title: "Berhasil",
          description: "Tagihan berhasil dibuat untuk 12 bulan",
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
  }

  return (
    <ModalForm
      title={tagihan ? "Edit Tagihan" : "Tambah Tagihan"}
      description={tagihan ? "Edit data tagihan" : "Tambah tagihan baru (akan membuat 12 tagihan bulanan)"}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmitForm}
      isSubmitting={isSubmitting}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="siswa_id">Siswa</Label>
          <Select value={siswaId} onValueChange={setSiswaId} disabled={!!tagihan}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih siswa" />
            </SelectTrigger>
            <SelectContent>
              {isLoadingSiswa ? (
                <SelectItem value="loading" disabled>
                  Memuat data siswa...
                </SelectItem>
              ) : siswaList.length > 0 ? (
                siswaList.map((siswa) => (
                  <SelectItem key={siswa.id} value={siswa.id.toString()}>
                    {siswa.nis} - {siswa.nama} ({siswa.kelas_nama})
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-data" disabled>
                  Tidak ada data siswa
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tahun_ajaran_id">Tahun Ajaran</Label>
          <Select value={tahunAjaranId} onValueChange={setTahunAjaranId} disabled={!!tagihan}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih tahun ajaran" />
            </SelectTrigger>
            <SelectContent>
              {tahunAjaranList.length > 0 ? (
                tahunAjaranList.map((ta) => (
                  <SelectItem key={ta.id} value={ta.id.toString()}>
                    {ta.nama} - Rp {ta.nominal_spp.toLocaleString("id-ID")}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-data" disabled>
                  Tidak ada data tahun ajaran
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {tagihan && (
          <>
            <div className="space-y-2">
              <Label htmlFor="bulan">Bulan</Label>
              <Select value={bulan} onValueChange={setBulan}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih bulan" />
                </SelectTrigger>
                <SelectContent>
                  {bulanOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tahun">Tahun</Label>
              <Input
                id="tahun"
                type="number"
                placeholder="Contoh: 2023"
                value={tahun}
                onChange={(e) => setTahun(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nominal">Nominal</Label>
              <Input
                id="nominal"
                type="number"
                placeholder="Contoh: 500000"
                value={nominal}
                onChange={(e) => setNominal(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option === "pending" ? "Belum Bayar" : option === "paid" ? "Lunas" : "Gagal"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tanggal_jatuh_tempo">Tanggal Jatuh Tempo</Label>
              <Input
                id="tanggal_jatuh_tempo"
                type="date"
                value={tanggalJatuhTempo}
                onChange={(e) => setTanggalJatuhTempo(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keterangan">Keterangan</Label>
              <Textarea
                id="keterangan"
                placeholder="Keterangan tambahan (opsional)"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
              />
            </div>
          </>
        )}

        {!tagihan && (
          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
            <p className="text-yellow-800 text-sm">
              Sistem akan otomatis membuat 12 tagihan bulanan (Juli-Juni) sesuai dengan tahun ajaran yang dipilih.
              Nominal tagihan akan mengikuti nominal SPP dari tahun ajaran tersebut.
            </p>
          </div>
        )}
      </div>
    </ModalForm>
  )
}

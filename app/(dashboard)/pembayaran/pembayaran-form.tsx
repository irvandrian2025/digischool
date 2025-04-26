"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ModalForm } from "@/components/ui/modal-form"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface Pembayaran {
  id: number
  tagihan_id: number
  tanggal_bayar: string
  metode_pembayaran: string
  jumlah_bayar: number
  bukti_pembayaran: string
  keterangan: string
  created_at: string
  updated_at: string
}

interface Tagihan {
  id: number
  siswa_id: number
  bulan: string
  tahun: number
  nominal: number
  status: string
  siswa_nama?: string
  siswa_nis?: string
  kelas_nama?: string
}

interface PembayaranFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
  pembayaran: Pembayaran | null
}

export function PembayaranForm({ isOpen, onClose, onSubmit, pembayaran }: PembayaranFormProps) {
  const [tagihanId, setTagihanId] = useState("")
  const [tanggalBayar, setTanggalBayar] = useState("")
  const [metodePembayaran, setMetodePembayaran] = useState("")
  const [jumlahBayar, setJumlahBayar] = useState("")
  const [buktiPembayaran, setBuktiPembayaran] = useState("")
  const [keterangan, setKeterangan] = useState("")
  const [tagihanList, setTagihanList] = useState<Tagihan[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingTagihan, setIsLoadingTagihan] = useState(false)
  const { toast } = useToast()

  const metodePembayaranOptions = ["tunai", "transfer bank", "virtual account", "qris", "e-wallet"]

  useEffect(() => {
    if (isOpen) {
      fetchTagihanList()

      // Set default date to today if adding new payment
      if (!pembayaran) {
        const today = new Date().toISOString().split("T")[0]
        setTanggalBayar(today)
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (pembayaran) {
      // Edit mode
      setTagihanId(pembayaran.tagihan_id.toString())
      setTanggalBayar(pembayaran.tanggal_bayar ? pembayaran.tanggal_bayar.split("T")[0] : "")
      setMetodePembayaran(pembayaran.metode_pembayaran)
      setJumlahBayar(pembayaran.jumlah_bayar.toString())
      setBuktiPembayaran(pembayaran.bukti_pembayaran || "")
      setKeterangan(pembayaran.keterangan || "")
    } else {
      // Add mode
      setTagihanId("")
      // tanggalBayar is set to today in the other useEffect
      setMetodePembayaran("")
      setJumlahBayar("")
      setBuktiPembayaran("")
      setKeterangan("")
    }
  }, [pembayaran])

  const fetchTagihanList = async () => {
    try {
      setIsLoadingTagihan(true)
      // Only fetch unpaid tagihan if adding new payment
      const status = pembayaran ? "" : "pending"
      const url = status ? `/api/tagihan?status=${status}` : "/api/tagihan"

      const response = await fetch(url)
      const data = await response.json()

      if (response.ok) {
        setTagihanList(data.data)
      } else {
        toast({
          title: "Error",
          description: data.message || "Gagal mengambil data tagihan",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching tagihan:", error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengambil data tagihan",
        variant: "destructive",
      })
    } finally {
      setIsLoadingTagihan(false)
    }
  }

  const handleTagihanChange = (value: string) => {
    setTagihanId(value)

    // Auto-fill jumlah bayar with tagihan nominal
    const selectedTagihan = tagihanList.find((t) => t.id.toString() === value)
    if (selectedTagihan) {
      setJumlahBayar(selectedTagihan.nominal.toString())
    }
  }

  const handleSubmitForm = async () => {
    if (!tagihanId || !tanggalBayar || !metodePembayaran || !jumlahBayar) {
      toast({
        title: "Error",
        description: "Tagihan, tanggal bayar, metode pembayaran, dan jumlah bayar harus diisi",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const url = pembayaran ? `/api/pembayaran/${pembayaran.id}` : "/api/pembayaran"
      const method = pembayaran ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tagihan_id: Number.parseInt(tagihanId),
          tanggal_bayar: tanggalBayar,
          metode_pembayaran: metodePembayaran,
          jumlah_bayar: Number.parseFloat(jumlahBayar),
          bukti_pembayaran: buktiPembayaran,
          keterangan,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Terjadi kesalahan saat menyimpan data")
      }

      toast({
        title: "Berhasil",
        description: pembayaran ? "Data pembayaran berhasil diperbarui" : "Data pembayaran berhasil disimpan",
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
      title={pembayaran ? "Edit Pembayaran" : "Tambah Pembayaran"}
      description={pembayaran ? "Edit data pembayaran" : "Tambah pembayaran baru"}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmitForm}
      isSubmitting={isSubmitting}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tagihan_id">Tagihan</Label>
          <Select value={tagihanId} onValueChange={handleTagihanChange} disabled={!!pembayaran}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih tagihan" />
            </SelectTrigger>
            <SelectContent>
              {isLoadingTagihan ? (
                <SelectItem value="loading" disabled>
                  Memuat data tagihan...
                </SelectItem>
              ) : tagihanList.length > 0 ? (
                tagihanList.map((tagihan) => (
                  <SelectItem key={tagihan.id} value={tagihan.id.toString()}>
                    {tagihan.siswa_nis} - {tagihan.siswa_nama} - {tagihan.bulan} {tagihan.tahun} - Rp{" "}
                    {tagihan.nominal.toLocaleString("id-ID")}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-data" disabled>
                  Tidak ada data tagihan
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tanggal_bayar">Tanggal Bayar</Label>
          <Input
            id="tanggal_bayar"
            type="date"
            value={tanggalBayar}
            onChange={(e) => setTanggalBayar(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="metode_pembayaran">Metode Pembayaran</Label>
          <Select value={metodePembayaran} onValueChange={setMetodePembayaran}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih metode pembayaran" />
            </SelectTrigger>
            <SelectContent>
              {metodePembayaranOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="jumlah_bayar">Jumlah Bayar</Label>
          <Input
            id="jumlah_bayar"
            type="number"
            placeholder="Contoh: 500000"
            value={jumlahBayar}
            onChange={(e) => setJumlahBayar(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bukti_pembayaran">Bukti Pembayaran (URL)</Label>
          <Input
            id="bukti_pembayaran"
            placeholder="Contoh: https://example.com/bukti.jpg"
            value={buktiPembayaran}
            onChange={(e) => setBuktiPembayaran(e.target.value)}
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
      </div>
    </ModalForm>
  )
}

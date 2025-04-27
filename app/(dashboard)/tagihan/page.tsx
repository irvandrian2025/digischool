"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { DataTable } from "@/components/data-table"
import { columns } from "./columns"
import { TagihanForm } from "./tagihan-form"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  siswa_nama: string
  siswa_nis: string
  kelas_nama: string
  tahun_ajaran_nama: string
  created_at: string
  updated_at: string
}

interface TahunAjaran {
  id: number
  nama: string
}

interface Kelas {
  id: number
  nama: string
}

export default function TagihanPage() {
  const [tagihan, setTagihan] = useState<Tagihan[]>([])
  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([])
  const [kelasList, setKelasList] = useState<Kelas[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTagihan, setSelectedTagihan] = useState<Tagihan | null>(null)

  // Filter states
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState<string>("")
  const [selectedKelas, setSelectedKelas] = useState<string>("")
  const [selectedStatus, setSelectedStatus] = useState<string>("")
  const [selectedBulan, setSelectedBulan] = useState<string>("")
  const [selectedTahun, setSelectedTahun] = useState<string>("")
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

  // Get unique years from tagihan data
  const tahunOptions = [...new Set(tagihan.map((t) => t.tahun))].sort()

  const fetchTagihan = async () => {
    try {
      setLoading(true)

      // Build query params for filtering
      const params = new URLSearchParams()
      if (selectedTahunAjaran) params.append("tahun_ajaran_id", selectedTahunAjaran)
      if (selectedKelas) params.append("kelas_id", selectedKelas)
      if (selectedStatus) params.append("status", selectedStatus)
      if (selectedBulan) params.append("bulan", selectedBulan)
      if (selectedTahun) params.append("tahun", selectedTahun)

      const response = await fetch(`/api/tagihan?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setTagihan(data.data || [])
      } else {
        console.error("Error response:", data)
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
      setLoading(false)
    }
  }

  const fetchTahunAjaran = async () => {
    try {
      const response = await fetch("/api/tahun-ajaran")
      const data = await response.json()

      if (response.ok) {
        setTahunAjaranList(data.data || [])
      } else {
        console.error("Error fetching tahun ajaran:", data)
      }
    } catch (error) {
      console.error("Error fetching tahun ajaran:", error)
    }
  }

  const fetchKelas = async () => {
    try {
      const response = await fetch("/api/kelas")
      const data = await response.json()

      if (response.ok) {
        setKelasList(data.data || [])
      } else {
        console.error("Error fetching kelas:", data)
      }
    } catch (error) {
      console.error("Error fetching kelas:", error)
    }
  }

  useEffect(() => {
    fetchTahunAjaran()
    fetchKelas()
    fetchTagihan()
  }, [])

  // Refetch when filters change
  useEffect(() => {
    fetchTagihan()
  }, [selectedTahunAjaran, selectedKelas, selectedStatus, selectedBulan, selectedTahun])

  const handleAdd = () => {
    setSelectedTagihan(null)
    setIsModalOpen(true)
  }

  const handleEdit = (tagihan: Tagihan) => {
    setSelectedTagihan(tagihan)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus tagihan ini?")) {
      return
    }

    try {
      const response = await fetch(`/api/tagihan/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "Tagihan berhasil dihapus",
        })
        fetchTagihan()
      } else {
        toast({
          title: "Error",
          description: data.message || "Gagal menghapus tagihan",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting tagihan:", error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menghapus tagihan",
        variant: "destructive",
      })
    }
  }

  const handleFormSubmit = () => {
    setIsModalOpen(false)
    fetchTagihan()
  }

  const resetFilters = () => {
    setSelectedTahunAjaran("")
    setSelectedKelas("")
    setSelectedStatus("")
    setSelectedBulan("")
    setSelectedTahun("")
  }

  const [showFilter, setShowFilter] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tagihan</h2>
          <p className="text-muted-foreground">Kelola data tagihan SPP siswa</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-1"
          >
            {showFilter ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Sembunyikan Filter
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Tampilkan Filter
              </>
            )}
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Tagihan
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Tagihan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Tahun Ajaran</label>
              <Select value={selectedTahunAjaran} onValueChange={setSelectedTahunAjaran}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Tahun Ajaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tahun Ajaran</SelectItem>
                  {tahunAjaranList.map((ta) => (
                    <SelectItem key={ta.id} value={ta.id.toString()}>
                      {ta.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Kelas</label>
              <Select value={selectedKelas} onValueChange={setSelectedKelas}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kelas</SelectItem>
                  {kelasList.map((kelas) => (
                    <SelectItem key={kelas.id} value={kelas.id.toString()}>
                      {kelas.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === "pending" ? "Belum Bayar" : status === "paid" ? "Lunas" : "Gagal"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Bulan</label>
              <Select value={selectedBulan} onValueChange={setSelectedBulan}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Bulan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Bulan</SelectItem>
                  {bulanOptions.map((bulan) => (
                    <SelectItem key={bulan} value={bulan}>
                      {bulan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Tahun</label>
              <Select value={selectedTahun} onValueChange={setSelectedTahun}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Tahun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tahun</SelectItem>
                  {tahunOptions.map((tahun) => (
                    <SelectItem key={tahun} value={tahun.toString()}>
                      {tahun}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button variant="outline" onClick={resetFilters}>
            Reset Filter
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Tagihan</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns({ onEdit: handleEdit, onDelete: handleDelete })}
            data={tagihan}
            isLoading={loading}
            searchColumn="siswa_nama"
          />
        </CardContent>
      </Card>

      <TagihanForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        tagihan={selectedTagihan}
        tahunAjaranList={tahunAjaranList}
      />
    </div>
  )
}

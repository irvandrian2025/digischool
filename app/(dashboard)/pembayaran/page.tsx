"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { DataTable } from "@/components/data-table"
import { columns } from "./columns"
import { PembayaranForm } from "./pembayaran-form"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

interface Pembayaran {
  id: number
  tagihan_id: number
  tanggal_bayar: string
  metode_pembayaran: string
  jumlah_bayar: number
  bukti_pembayaran: string
  keterangan: string
  bulan: string
  tahun: number
  siswa_nama: string
  siswa_nis: string
  kelas_nama: string
  tahun_ajaran_nama: string
  created_at: string
  updated_at: string
}

interface Siswa {
  id: number
  nama: string
  nis: string
}

export default function PembayaranPage() {
  const [pembayaran, setPembayaran] = useState<Pembayaran[]>([])
  const [siswaList, setSiswaList] = useState<Siswa[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPembayaran, setSelectedPembayaran] = useState<Pembayaran | null>(null)

  // Filter states
  const [selectedSiswa, setSelectedSiswa] = useState<string>("")
  const [selectedStatus, setSelectedStatus] = useState<string>("")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")

  const { toast } = useToast()

  const statusOptions = ["paid", "pending", "failed"]

  const fetchPembayaran = async () => {
    try {
      setLoading(true)

      // Build query params for filtering
      const params = new URLSearchParams()
      if (selectedSiswa) params.append("siswa_id", selectedSiswa)
      if (selectedStatus) params.append("status", selectedStatus)
      if (startDate) params.append("start_date", startDate)
      if (endDate) params.append("end_date", endDate)

      const response = await fetch(`/api/pembayaran?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setPembayaran(data.data || [])
      } else {
        console.error("Error response:", data)
        toast({
          title: "Error",
          description: data.message || "Gagal mengambil data pembayaran",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching pembayaran:", error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengambil data pembayaran",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchSiswaList = async () => {
    try {
      const response = await fetch("/api/siswa")
      const data = await response.json()

      if (response.ok) {
        setSiswaList(data.data || [])
      } else {
        console.error("Error fetching siswa:", data)
      }
    } catch (error) {
      console.error("Error fetching siswa:", error)
    }
  }

  useEffect(() => {
    fetchSiswaList()
    fetchPembayaran()
  }, [])

  // Refetch when filters change
  useEffect(() => {
    fetchPembayaran()
  }, [selectedSiswa, selectedStatus, startDate, endDate])

  const handleAdd = () => {
    setSelectedPembayaran(null)
    setIsModalOpen(true)
  }

  const handleEdit = (pembayaran: Pembayaran) => {
    setSelectedPembayaran(pembayaran)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pembayaran ini?")) {
      return
    }

    try {
      const response = await fetch(`/api/pembayaran/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "Pembayaran berhasil dihapus",
        })
        fetchPembayaran()
      } else {
        toast({
          title: "Error",
          description: data.message || "Gagal menghapus pembayaran",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting pembayaran:", error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menghapus pembayaran",
        variant: "destructive",
      })
    }
  }

  const handleFormSubmit = () => {
    setIsModalOpen(false)
    fetchPembayaran()
  }

  const resetFilters = () => {
    setSelectedSiswa("")
    setSelectedStatus("")
    setStartDate("")
    setEndDate("")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pembayaran</h2>
          <p className="text-muted-foreground">Kelola data pembayaran SPP siswa</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Pembayaran
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Siswa</label>
              <Select value={selectedSiswa} onValueChange={setSelectedSiswa}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Siswa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Siswa</SelectItem>
                  {siswaList.map((siswa) => (
                    <SelectItem key={siswa.id} value={siswa.id.toString()}>
                      {siswa.nis} - {siswa.nama}
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
              <label className="text-sm font-medium mb-1 block">Tanggal Mulai</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Tanggal Akhir</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <Button variant="outline" onClick={resetFilters}>
            Reset Filter
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns({ onEdit: handleEdit, onDelete: handleDelete })}
            data={pembayaran}
            isLoading={loading}
            searchColumn="siswa_nama"
          />
        </CardContent>
      </Card>

      <PembayaranForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        pembayaran={selectedPembayaran}
      />
    </div>
  )
}

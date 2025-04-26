"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { DataTable } from "@/components/data-table"
import { columns } from "./columns"
import { TahunAjaranForm } from "./tahun-ajaran-form"
import { useToast } from "@/components/ui/use-toast"

interface TahunAjaran {
  id: number
  nama: string
  nominal_spp: number
  created_at: string
  updated_at: string
}

export default function TahunAjaranPage() {
  const [tahunAjaran, setTahunAjaran] = useState<TahunAjaran[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState<TahunAjaran | null>(null)
  const { toast } = useToast()

  const fetchTahunAjaran = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/tahun-ajaran")
      const data = await response.json()

      if (response.ok) {
        setTahunAjaran(data.data || [])
      } else {
        console.error("Error response:", data)
        toast({
          title: "Error",
          description: data.message || "Gagal mengambil data tahun ajaran",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching tahun ajaran:", error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengambil data tahun ajaran",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTahunAjaran()
  }, [])

  const handleAdd = () => {
    setSelectedTahunAjaran(null)
    setIsModalOpen(true)
  }

  const handleEdit = (tahunAjaran: TahunAjaran) => {
    setSelectedTahunAjaran(tahunAjaran)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus tahun ajaran ini?")) {
      return
    }

    try {
      const response = await fetch(`/api/tahun-ajaran/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "Tahun ajaran berhasil dihapus",
        })
        fetchTahunAjaran()
      } else {
        toast({
          title: "Error",
          description: data.message || "Gagal menghapus tahun ajaran",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting tahun ajaran:", error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menghapus tahun ajaran",
        variant: "destructive",
      })
    }
  }

  const handleFormSubmit = () => {
    setIsModalOpen(false)
    fetchTahunAjaran()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tahun Ajaran</h2>
          <p className="text-muted-foreground">Kelola data tahun ajaran dan nominal SPP</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Tahun Ajaran
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Tahun Ajaran</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns({ onEdit: handleEdit, onDelete: handleDelete })}
            data={tahunAjaran}
            isLoading={loading}
            searchColumn="nama"
          />
        </CardContent>
      </Card>

      <TahunAjaranForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        tahunAjaran={selectedTahunAjaran}
      />
    </div>
  )
}

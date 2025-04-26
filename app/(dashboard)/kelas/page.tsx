"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { DataTable } from "@/components/data-table"
import { columns } from "./columns"
import { KelasForm } from "./kelas-form"
import { useToast } from "@/components/ui/use-toast"

interface Kelas {
  id: number
  nama: string
  tingkat: string
  wali_kelas: string
  created_at: string
  updated_at: string
}

export default function KelasPage() {
  const [kelas, setKelas] = useState<Kelas[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedKelas, setSelectedKelas] = useState<Kelas | null>(null)
  const { toast } = useToast()

  const fetchKelas = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/kelas")
      const data = await response.json()

      if (response.ok) {
        setKelas(data.data || [])
      } else {
        console.error("Error response:", data)
        toast({
          title: "Error",
          description: data.message || "Gagal mengambil data kelas",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching kelas:", error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengambil data kelas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKelas()
  }, [])

  const handleAdd = () => {
    setSelectedKelas(null)
    setIsModalOpen(true)
  }

  const handleEdit = (kelas: Kelas) => {
    setSelectedKelas(kelas)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kelas ini?")) {
      return
    }

    try {
      const response = await fetch(`/api/kelas/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "Kelas berhasil dihapus",
        })
        fetchKelas()
      } else {
        toast({
          title: "Error",
          description: data.message || "Gagal menghapus kelas",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting kelas:", error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menghapus kelas",
        variant: "destructive",
      })
    }
  }

  const handleFormSubmit = () => {
    setIsModalOpen(false)
    fetchKelas()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Kelas</h2>
          <p className="text-muted-foreground">Kelola data kelas dan wali kelas</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Kelas
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kelas</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns({ onEdit: handleEdit, onDelete: handleDelete })}
            data={kelas}
            isLoading={loading}
            searchColumn="nama"
            filterColumn="tingkat"
          />
        </CardContent>
      </Card>

      <KelasForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        kelas={selectedKelas}
      />
    </div>
  )
}

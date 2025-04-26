"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { DataTable } from "@/components/data-table"
import { columns } from "./columns"
import { SiswaForm } from "./siswa-form"
import { useToast } from "@/components/ui/use-toast"

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
  kelas_nama?: string
  created_at: string
  updated_at: string
}

export default function SiswaPage() {
  const [siswa, setSiswa] = useState<Siswa[]>([])
  const [kelasList, setKelasList] = useState<Kelas[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null)
  const { toast } = useToast()

  const fetchSiswa = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/siswa")
      const data = await response.json()

      if (response.ok) {
        setSiswa(data.data || [])
      } else {
        console.error("Error response:", data)
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
      setLoading(false)
    }
  }

  const fetchKelasList = async () => {
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
    fetchKelasList()
    fetchSiswa()
  }, [])

  const handleAdd = () => {
    setSelectedSiswa(null)
    setIsModalOpen(true)
  }

  const handleEdit = (siswa: Siswa) => {
    setSelectedSiswa(siswa)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus siswa ini?")) {
      return
    }

    try {
      const response = await fetch(`/api/siswa/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "Siswa berhasil dihapus",
        })
        fetchSiswa()
      } else {
        toast({
          title: "Error",
          description: data.message || "Gagal menghapus siswa",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting siswa:", error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menghapus siswa",
        variant: "destructive",
      })
    }
  }

  const handleFormSubmit = () => {
    setIsModalOpen(false)
    fetchSiswa()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Siswa</h2>
          <p className="text-muted-foreground">Kelola data siswa</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Siswa
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Siswa</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns({ onEdit: handleEdit, onDelete: handleDelete })}
            data={siswa}
            isLoading={loading}
            searchColumn="nama"
            filterColumn="kelas_nama"
          />
        </CardContent>
      </Card>

      <SiswaForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        siswa={selectedSiswa}
        kelasList={kelasList}
      />
    </div>
  )
}

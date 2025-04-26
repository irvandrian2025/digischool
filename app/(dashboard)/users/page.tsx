"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { DataTable } from "@/components/data-table"
import { columns } from "./columns"
import { UserForm } from "./user-form"
import { useToast } from "@/components/ui/use-toast"

interface User {
  id: number
  username: string
  name: string
  role: string
  created_at: string
  updated_at: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const { toast } = useToast()

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/users")
      const data = await response.json()

      if (response.ok) {
        setUsers(data.data)
      } else {
        toast({
          title: "Error",
          description: data.message || "Gagal mengambil data users",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengambil data users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleAdd = () => {
    setSelectedUser(null)
    setIsModalOpen(true)
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus user ini?")) {
      return
    }

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "User berhasil dihapus",
        })
        fetchUsers()
      } else {
        toast({
          title: "Error",
          description: data.message || "Gagal menghapus user",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menghapus user",
        variant: "destructive",
      })
    }
  }

  const handleFormSubmit = () => {
    setIsModalOpen(false)
    fetchUsers()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground">Kelola data pengguna sistem</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Users</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns({ onEdit: handleEdit, onDelete: handleDelete })}
            data={users}
            isLoading={loading}
          />
        </CardContent>
      </Card>

      <UserForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        user={selectedUser}
      />
    </div>
  )
}

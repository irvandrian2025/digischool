"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ModalForm } from "@/components/ui/modal-form"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface User {
  id: number
  username: string
  name: string
  role: string
  created_at: string
  updated_at: string
}

interface UserFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
  user: User | null
}

export function UserForm({ isOpen, onClose, onSubmit, user }: UserFormProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      setUsername(user.username)
      setPassword("")
      setName(user.name)
      setRole(user.role)
    } else {
      setUsername("")
      setPassword("")
      setName("")
      setRole("")
    }
  }, [user])

  const handleSubmitForm = async () => {
    setIsSubmitting(true)

    try {
      const url = user ? `/api/users/${user.id}` : "/api/users"
      const method = user ? "PUT" : "POST"

      // Only include password if it's provided (for updates)
      const body: any = {
        username,
        name,
        role,
      }

      if (password) {
        body.password = password
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Terjadi kesalahan saat menyimpan data")
      }

      toast({
        title: "Berhasil",
        description: user ? "Data user berhasil diperbarui" : "Data user berhasil disimpan",
      })

      onSubmit()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ModalForm
      title={user ? "Edit User" : "Tambah User"}
      description="Masukkan data pengguna sistem"
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmitForm}
      isSubmitting={isSubmitting}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            placeholder="Contoh: admin"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">
            Password {user && <span className="text-sm text-gray-500">(Kosongkan jika tidak ingin mengubah)</span>}
          </Label>
          <Input
            id="password"
            type="password"
            placeholder={user ? "••••••••" : "Masukkan password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!user}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Nama Lengkap</Label>
          <Input
            id="name"
            placeholder="Contoh: Administrator"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select value={role} onValueChange={setRole} required>
            <SelectTrigger>
              <SelectValue placeholder="Pilih role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
              <SelectItem value="student">Student</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </ModalForm>
  )
}

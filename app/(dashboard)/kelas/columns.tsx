"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Kelas {
  id: number
  nama: string
  tingkat: string
  wali_kelas: string
  jumlah_siswa: number
  created_at: string
  updated_at: string
}

interface ColumnsProps {
  onEdit: (kelas: Kelas) => void
  onDelete: (id: number) => void
}

export const columns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<Kelas>[] => [
  {
    accessorKey: "nama",
    header: "Nama Kelas",
  },
  {
    accessorKey: "tingkat",
    header: "Tingkat",
  },
  {
    accessorKey: "wali_kelas",
    header: "Wali Kelas",
    cell: ({ row }) => {
      const waliKelas = row.getValue("wali_kelas") as string
      return <div>{waliKelas || "-"}</div>
    },
  },
  {
    accessorKey: "jumlah_siswa",
    header: "Jumlah Siswa",
    cell: ({ row }) => {
      const jumlahSiswa = Number(row.getValue("jumlah_siswa") || 0)
      return <div>{jumlahSiswa}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const kelas = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(kelas)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(kelas.id)} className="text-red-600">
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

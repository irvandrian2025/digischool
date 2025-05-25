"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash, CreditCard, ExternalLink, MessageSquare } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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

interface ColumnsProps {
  onEdit: (siswa: Siswa) => void
  onDelete: (id: number) => void
}

export const columns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<Siswa>[] => [
  {
    accessorKey: "nis",
    header: "NIS",
  },
  {
    accessorKey: "nama",
    header: "Nama",
  },
  {
    accessorKey: "jenis_kelamin",
    header: "Jenis Kelamin",
    cell: ({ row }) => {
      const jenisKelamin = row.getValue("jenis_kelamin") as string
      return <div>{jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}</div>
    },
  },
  {
    accessorKey: "kelas_nama",
    header: "Kelas",
  },
  {
    accessorKey: "no_hp",
    header: "No. HP",
    cell: ({ row }) => {
      const noHp = row.getValue("no_hp") as string
      return <div>{noHp || "-"}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const siswa = row.original

      const openKartuSpp = () => {
        window.open(`/kartu-spp/${siswa.id}`, "_blank")
      }

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
            <DropdownMenuItem onClick={() => onEdit(siswa)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(siswa.id)} className="text-red-600">
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

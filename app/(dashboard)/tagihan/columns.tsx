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
import { Badge } from "@/components/ui/badge"

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

interface ColumnsProps {
  onEdit: (tagihan: Tagihan) => void
  onDelete: (id: number) => void
}

export const columns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<Tagihan>[] => [
  {
    accessorKey: "siswa_nama",
    header: "Nama Siswa",
    cell: ({ row }) => {
      const siswa_nis = row.original.siswa_nis
      const siswa_nama = row.getValue("siswa_nama") as string
      return (
        <div>
          <div className="font-medium">{siswa_nama}</div>
          <div className="text-xs text-muted-foreground">{siswa_nis}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "kelas_nama",
    header: "Kelas",
  },
  {
    accessorKey: "tahun_ajaran_nama",
    header: "Tahun Ajaran",
  },
  {
    accessorKey: "bulan",
    header: "Bulan",
    cell: ({ row }) => {
      const bulan = row.getValue("bulan") as string
      const tahun = row.original.tahun
      return (
        <div>
          {bulan} {tahun}
        </div>
      )
    },
  },
  {
    accessorKey: "nominal",
    header: "Nominal",
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue("nominal") as string)
      const formatted = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(amount)

      return <div>{formatted}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string

      return (
        <Badge variant={status === "paid" ? "success" : status === "pending" ? "warning" : "destructive"}>
          {status === "pending" ? "Belum Bayar" : status === "paid" ? "Lunas" : "Gagal"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "tanggal_jatuh_tempo",
    header: "Jatuh Tempo",
    cell: ({ row }) => {
      const date = row.getValue("tanggal_jatuh_tempo") as string
      if (!date) return "-"

      const formattedDate = new Date(date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })

      return <div>{formattedDate}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const tagihan = row.original

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
            <DropdownMenuItem onClick={() => onEdit(tagihan)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(tagihan.id)} className="text-red-600">
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

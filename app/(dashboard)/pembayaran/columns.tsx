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

interface ColumnsProps {
  onEdit: (pembayaran: Pembayaran) => void
  onDelete: (id: number) => void
}

export const columns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<Pembayaran>[] => [
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
    accessorKey: "bulan",
    header: "Bulan/Tahun",
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
    accessorKey: "jumlah_bayar",
    header: "Jumlah Bayar",
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue("jumlah_bayar") as string)
      const formatted = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(amount)

      return <div>{formatted}</div>
    },
  },
  {
    accessorKey: "metode_pembayaran",
    header: "Metode Pembayaran",
    cell: ({ row }) => {
      const metode = row.getValue("metode_pembayaran") as string
      return <div className="capitalize">{metode}</div>
    },
  },
  {
    accessorKey: "tanggal_bayar",
    header: "Tanggal Bayar",
    cell: ({ row }) => {
      const date = row.getValue("tanggal_bayar") as string
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
      const pembayaran = row.original

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
            <DropdownMenuItem onClick={() => onEdit(pembayaran)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(pembayaran.id)} className="text-red-600">
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

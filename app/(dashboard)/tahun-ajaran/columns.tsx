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

interface TahunAjaran {
  id: number
  nama: string
  nominal_spp: number
  created_at: string
  updated_at: string
}

interface ColumnsProps {
  onEdit: (tahunAjaran: TahunAjaran) => void
  onDelete: (id: number) => void
}

export const columns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<TahunAjaran>[] => [
  {
    accessorKey: "nama",
    header: "Tahun Ajaran",
  },
  {
    accessorKey: "nominal_spp",
    header: "Nominal SPP",
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue("nominal_spp") as string)
      const formatted = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(amount)

      return <div>{formatted}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const tahunAjaran = row.original

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
            <DropdownMenuItem onClick={() => onEdit(tahunAjaran)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(tahunAjaran.id)} className="text-red-600">
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

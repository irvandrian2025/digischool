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
            <DropdownMenuItem onClick={() => {
              const message = `📣 *REMINDER PEMBAYARAN SPP* 📣

Assalamu'alaikum warahmatullahi wabarakatuh

Yth. Bapak/Ibu Orang Tua/Wali dari:
*${siswa.nama}*

Berikut tautan kartu SPP digital Ananda:
🔗 ${window.location.origin}/kartu-spp/${siswa.id}

*Informasi:*
- Tautan bersifat pribadi (jangan dibagikan)
- Cek pembayaran SPP bulanan melalui link tersebut
- Jika tautan tidak bisa dibuka, mohon save terlebih dahulu nomor ini

Jika mengalami kendala, silakan hubungi nomor ini.

Terima kasih atas perhatian dan kerjasamanya.

Wassalamu'alaikum warahmatullahi wabarakatuh

_Salam,_
*Admin Sekolah*`;
              // Start of new logic for phone number
              if (!siswa.no_hp || siswa.no_hp.trim() === "") {
                alert("Nomor HP siswa tidak tersedia atau kosong.");
                return;
              }

              let processedNoHp = siswa.no_hp.trim().replace(/\D/g, ''); // Remove non-digits and trim whitespace


              if (processedNoHp === "") {
                alert("Format nomor HP siswa tidak valid (setelah menghapus karakter non-digit).");
                return;
              }

              // If number starts with '0', replace with '62' (common for Indonesian numbers)
              if (processedNoHp.startsWith('0')) {
                processedNoHp = '62' + processedNoHp.substring(1);
              } 
              // Optional: if it doesn't start with '62' but starts with '8' (another common local format)
              // and has a typical length for a number missing the prefix (e.g. 8xx with 9-12 total digits for the '8xx...' part).
              else if (!processedNoHp.startsWith('62') && processedNoHp.startsWith('8') && (processedNoHp.length >= 9 && processedNoHp.length <= 12) ) {
                 processedNoHp = '62' + processedNoHp;
              }

              // Final check: if after processing, it's "62", or too short/long, consider it invalid for WhatsApp.
              // Indonesian numbers with 62 are typically 10-15 digits long.
              if (processedNoHp === "62" || processedNoHp.length < 10 || processedNoHp.length > 15) {
                  alert(`Nomor HP "${siswa.no_hp}" (diproses menjadi "${processedNoHp}") mungkin tidak valid untuk WhatsApp. Silakan periksa kembali.`);
                  return;
              }
              // End of new logic for phone number

              const whatsappLink = `https://wa.me/${processedNoHp}?text=${encodeURIComponent(message)}`;
              window.open(whatsappLink, "_blank");
            }}>
              <MessageSquare className="mr-2 h-4 w-4" />
              WhatsApp
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openKartuSpp}>
              <CreditCard className="mr-2 h-4 w-4" />
              <ExternalLink className="ml-auto h-3 w-3" />
              Kartu SPP Digital
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

"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function PembayaranPending() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        <h1 className="text-2xl font-bold text-yellow-600 mb-4">Pembayaran Sedang Diproses</h1>
        <p className="text-gray-600 mb-6">
          Pembayaran Anda sedang dalam proses verifikasi. Silakan tunggu beberapa saat.
        </p>
        <Button 
          onClick={() => router.push(`/kartu-spp/${window.location.pathname.split('/')[3]}`)}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          Kembali ke Kartu SPP
        </Button>
      </div>
    </div>
  )
}
"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function PembayaranSuccess() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">Pembayaran Berhasil</h1>
        <p className="text-gray-600 mb-6">
          Pembayaran Anda telah berhasil diproses. Terima kasih.
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
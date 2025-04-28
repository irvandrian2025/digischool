"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function PembayaranFailed() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Pembayaran Gagal</h1>
        <p className="text-gray-600 mb-6">
          Pembayaran Anda gagal diproses. Silakan coba lagi atau hubungi administrator.
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
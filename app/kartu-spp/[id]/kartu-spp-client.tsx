"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, User, School, CreditCard, Share2, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SiswaData {
  id: number
  nis: string
  nama: string
  jenis_kelamin: string
  alamat: string
  tanggal_lahir: string
  no_hp: string
  email: string
  kelas_id: number
  kelas_nama: string
}

interface TahunAjaranData {
  id: number
  nama: string
  nominal_spp: number
}

interface TagihanData {
  id: number
  bulan: string
  tahun: number
  nominal: number
  status: string
  tanggal_jatuh_tempo: string
  transaksi_id?: string
}

interface KartuSppClientProps {
  siswa: SiswaData
  tahunAjaran: TahunAjaranData | null
  tagihan: TagihanData[]
}

export function KartuSppClient({ siswa, tahunAjaran, tagihan }: KartuSppClientProps) {
  const router = useRouter()
  const [lastUpdated] = useState<string>(
    new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  )

  const handlePrint = () => {
    window.print()
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Kartu SPP Digital - ${siswa?.nama}`,
          text: `Kartu SPP Digital untuk ${siswa?.nama} (${siswa?.nis})`,
          url: window.location.href,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      alert("Web Share API tidak didukung di browser ini")
    }
  }

  const handlePayment = async (tagihanId: number) => {
    try {
      const response = await fetch('/api/pembayaran/midtrans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tagihan_id: tagihanId,
          siswa_id: siswa.id,
          amount: tahunAjaran?.nominal_spp,
          customer_details: {
            first_name: siswa.nama,
            email: siswa.email,
            phone: siswa.no_hp
          },
          payment_type: 'vtweb'
        })
      });

      const data = await response.json();
      
      if (data.success && data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        alert('Gagal membuat pembayaran: ' + (data.message || 'Silakan coba lagi'));
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Terjadi kesalahan saat memproses pembayaran');
    }
  }

  // Group tagihan by semester
  const semester1 = tagihan.filter((t) =>
    ["Juli", "Agustus", "September", "Oktober", "November", "Desember"].includes(t.bulan),
  )
  const semester2 = tagihan.filter((t) => ["Januari", "Februari", "Maret", "April", "Mei", "Juni"].includes(t.bulan))

  return (
    <div className="bg-gradient-to-b from-indigo-50 to-blue-50 min-h-screen py-8 px-4 print:bg-white print:py-0">
      <div className="max-w-4xl mx-auto">
        {/* Action buttons - hidden when printing */}
        <div className="flex justify-end gap-2 mb-4 print:hidden">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Cetak
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Bagikan
          </Button>
        </div>

        <Card className="overflow-hidden border-0 shadow-xl print:shadow-none">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-8 text-center print:bg-indigo-600">
            <h1 className="text-3xl font-bold mb-1">KARTU SPP DIGITAL</h1>
            
          </div>

          <CardContent className="p-0">
            {/* Student Info */}
            <div className="p-6 md:p-8 border-b flex flex-col md:flex-row gap-6">
              <div className="w-32 h-32 bg-gray-200 rounded-full overflow-hidden flex-shrink-0 mx-auto md:mx-0 border-4 border-white shadow-md">
                <img
                  src={`/placeholder.svg?height=128&width=128`}
                  alt="Foto Siswa"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <div className="flex items-center text-indigo-700 mb-1">
                      <User className="h-4 w-4 mr-2" />
                      <p className="text-sm font-semibold">Nama Siswa</p>
                    </div>
                    <p className="text-lg font-medium">{siswa.nama}</p>
                  </div>

                  <div>
                    <div className="flex items-center text-indigo-700 mb-1">
                      <CreditCard className="h-4 w-4 mr-2" />
                      <p className="text-sm font-semibold">NIS</p>
                    </div>
                    <p className="text-lg font-medium">{siswa.nis}</p>
                  </div>

                  <div>
                    <div className="flex items-center text-indigo-700 mb-1">
                      <School className="h-4 w-4 mr-2" />
                      <p className="text-sm font-semibold">Kelas</p>
                    </div>
                    <p className="text-lg font-medium">{siswa.kelas_nama}</p>
                  </div>

                  <div>
                    <div className="flex items-center text-indigo-700 mb-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      <p className="text-sm font-semibold">Tahun Ajaran</p>
                    </div>
                    <p className="text-lg font-medium">{tahunAjaran?.nama || "-"}</p>
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center text-indigo-700 mb-1">
                      <CreditCard className="h-4 w-4 mr-2" />
                      <p className="text-sm font-semibold">Nominal SPP</p>
                    </div>
                    <p className="text-xl font-bold text-indigo-700">
                      {tahunAjaran
                        ? new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          }).format(tahunAjaran.nominal_spp)
                        : "-"}{" "}
                      <span className="text-base font-normal">/ bulan</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-bold mb-6 text-gray-800">Status Pembayaran SPP</h2>

              <Tabs defaultValue="all" className="print:hidden">
                <TabsList className="mb-6">
                  <TabsTrigger value="all">Semua</TabsTrigger>
                  <TabsTrigger value="semester1">Semester 1</TabsTrigger>
                  <TabsTrigger value="semester2">Semester 2</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {tagihan.map((item) => (
                      <MonthCard key={item.id} tagihan={item} siswa={siswa} tahunAjaran={tahunAjaran} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="semester1">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {semester1.map((item) => (
                      <MonthCard key={item.id} tagihan={item} siswa={siswa} tahunAjaran={tahunAjaran} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="semester2">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {semester2.map((item) => (
                      <MonthCard key={item.id} tagihan={item} siswa={siswa} tahunAjaran={tahunAjaran} />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Print version - always show all months */}
              <div className="hidden print:block">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                  {tagihan.map((item) => (
                    <MonthCard key={item.id} tagihan={item} siswa={siswa} tahunAjaran={tahunAjaran} />
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-4 text-center text-sm text-gray-500 border-t">
              Terakhir diperbarui: {lastUpdated}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MonthCard({ tagihan, siswa, tahunAjaran, onPay }: { tagihan: TagihanData, siswa: SiswaData, tahunAjaran: TahunAjaranData | null, onPay?: (tagihanId: number) => void }) {
  const isPaid = tagihan.status === "paid"

  const handlePayNow = async () => {
    try {
      const response = await fetch('/api/pembayaran/midtrans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tagihan_id: tagihan.id,
          siswa_id: siswa.id,
          amount: tahunAjaran?.nominal_spp,
          customer_details: {
            first_name: siswa.nama,
            email: siswa.email,
            phone: siswa.no_hp
          }
        })
      });

      const data = await response.json();
      
      if (data.success && data.payment_url) {
        window.open(data.payment_url, '_blank');
      } else {
        alert('Gagal membuat pembayaran: ' + (data.message || 'Silakan coba lagi'));
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Terjadi kesalahan saat memproses pembayaran');
    }
  }

  return (
    <div
      className={`rounded-lg border overflow-hidden ${isPaid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
    >
      <div className="p-4 text-center">
        <p className="font-medium mb-1">{tagihan.bulan}</p>
        <p className="text-xs text-gray-500 mb-2">{tagihan.tahun}</p>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500">
            {new Date(tagihan.tanggal_jatuh_tempo).toLocaleDateString('id-ID')}
          </span>
          {tagihan.status === 'BELUM_LUNAS' && onPay && (
            <button 
              onClick={() => onPay(tagihan.id)}
              className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
            >
              Bayar Sekarang
            </button>
          )}
        </div>

        <div
          className={`text-xs font-semibold inline-block px-2 py-1 rounded-full mb-2 ${
            isPaid ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {isPaid ? "Lunas" : "Belum"}
        </div>

        {!isPaid && (
          <div className="mt-2">
            <Button
              size="sm"
              className="w-full text-xs bg-amber-500 hover:bg-amber-600 print:hidden"
              onClick={handlePayNow}
            >
              Bayar Sekarang
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

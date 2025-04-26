"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function CreateTahunAjaranPage() {
  const router = useRouter()
  const [nama, setNama] = useState("")
  const [nominalSpp, setNominalSpp] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/tahun-ajaran", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama,
          nominal_spp: Number.parseFloat(nominalSpp),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Terjadi kesalahan saat menyimpan data")
      }

      toast({
        title: "Berhasil",
        description: "Data tahun ajaran berhasil disimpan",
      })

      router.push("/tahun-ajaran")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tambah Tahun Ajaran</h2>
        <p className="text-muted-foreground">Tambahkan data tahun ajaran baru dan nominal SPP</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Form Tahun Ajaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nama">Tahun Ajaran</Label>
              <Input
                id="nama"
                placeholder="Contoh: 2023/2024"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nominal_spp">Nominal SPP</Label>
              <Input
                id="nominal_spp"
                type="number"
                placeholder="Contoh: 500000"
                value={nominalSpp}
                onChange={(e) => setNominalSpp(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

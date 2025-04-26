"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface KelasDeletePageProps {
  params: {
    id: string
  }
}

export default function KelasDeletePage({ params }: KelasDeletePageProps) {
  const router = useRouter()
  const [kelas, setKelas] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchKelas = async () => {
      try {
        const response = await fetch(`/api/kelas/${params.id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch kelas")
        }

        setKelas(data.data)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchKelas()
  }, [params.id])

  const handleDelete = async () => {
    setLoading(true)

    try {
      const response = await fetch(`/api/kelas/${params.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Terjadi kesalahan saat menghapus data")
      }

      toast({
        title: "Berhasil",
        description: "Data kelas berhasil dihapus",
      })

      router.push("/kelas")
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Hapus Kelas</h2>
        <p className="text-muted-foreground">Konfirmasi penghapusan data kelas</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Konfirmasi Hapus</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Peringatan</AlertTitle>
            <AlertDescription>
              Anda akan menghapus data kelas <strong>{kelas?.nama}</strong> dengan tingkat{" "}
              <strong>{kelas?.tingkat}</strong> dan wali kelas <strong>{kelas?.wali_kelas || "-"}</strong>. Tindakan ini
              tidak dapat dibatalkan.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
            Batal
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menghapus...
              </>
            ) : (
              "Hapus"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

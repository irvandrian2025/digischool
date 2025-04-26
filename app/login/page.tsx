"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2, Database, CheckCircle2, LogIn } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [seedSuccess, setSeedSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [seedingDb, setSeedingDb] = useState(false)
  const [dbStatus, setDbStatus] = useState<{
    isSeeded: boolean
    counts?: { users: number; tahunAjaran: number }
  } | null>(null)
  const [checkingDb, setCheckingDb] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  const checkDatabaseStatus = async () => {
    setCheckingDb(true)
    setError("")
    try {
      const response = await fetch("/api/check-db-status")
      const data = await response.json()

      if (response.ok) {
        setDbStatus(data)
      } else {
        setError("Gagal memeriksa status database: " + (data.message || "Unknown error"))
      }
    } catch (err) {
      console.error("Error checking database status:", err)
      setError("Terjadi kesalahan saat memeriksa status database")
    } finally {
      setCheckingDb(false)
    }
  }

  const handleSeedDatabase = async () => {
    setSeedingDb(true)
    setError("")
    setSeedSuccess(null)

    try {
      const response = await fetch("/api/seed")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengisi database")
      }

      setSeedSuccess(
        `Database berhasil diisi dengan ${data.counts?.tahunAjaran || 0} tahun ajaran, ${data.counts?.kelas || 0} kelas, ${data.counts?.siswa || 0} siswa, dan ${data.counts?.users || 0} pengguna.`,
      )

      // Re-check database status
      await checkDatabaseStatus()
    } catch (err: any) {
      console.error("Error seeding database:", err)
      setError(err.message || "Gagal mengisi database")
    } finally {
      setSeedingDb(false)
    }
  }

  // Direct access without authentication
  const handleDirectAccess = () => {
    router.push("/dashboard")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Just redirect to dashboard without authentication
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100">
      <div className="w-full max-w-md p-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-600 mb-2">DigiSchool</h1>
          <p className="text-gray-600">Sistem Pembayaran SPP Digital</p>
        </div>

        {checkingDb ? (
          <Card className="border-indigo-100 shadow-lg">
            <CardContent className="pt-6 flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              <p className="ml-2">Memeriksa status database...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-indigo-100 shadow-lg">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <div className="flex justify-center mt-4">
                <Button onClick={checkDatabaseStatus} className="bg-indigo-600 hover:bg-indigo-700">
                  Coba Lagi
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : !dbStatus?.isSeeded ? (
          <Card className="border-indigo-100 shadow-lg">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">Database Belum Terisi</CardTitle>
              <CardDescription>
                Database belum memiliki data awal. Silakan isi database terlebih dahulu.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {seedSuccess && (
                <Alert className="mb-4">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>{seedSuccess}</AlertDescription>
                </Alert>
              )}
              <div className="flex justify-center">
                <Button onClick={handleSeedDatabase} disabled={seedingDb} className="bg-indigo-600 hover:bg-indigo-700">
                  {seedingDb ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mengisi Database...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Isi Database dengan Data Awal
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-indigo-100 shadow-lg">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">Login</CardTitle>
              <CardDescription>Klik tombol di bawah untuk masuk ke sistem</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Alert className="mb-4 bg-yellow-50 border-yellow-200 text-yellow-800">
                <AlertTitle>Mode Pengembangan</AlertTitle>
                <AlertDescription>
                  Autentikasi dinonaktifkan sementara. Klik tombol di bawah untuk masuk langsung ke sistem.
                </AlertDescription>
              </Alert>

              <Button onClick={handleDirectAccess} className="w-full bg-indigo-600 hover:bg-indigo-700">
                <LogIn className="mr-2 h-4 w-4" />
                Masuk Langsung
              </Button>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-gray-500">© {new Date().getFullYear()} DigiSchool - Sistem Pembayaran SPP</p>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}

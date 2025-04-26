"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    router.push("/dashboard")
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">DigiSchool</h2>
        <p className="text-gray-600 mb-4">Mengalihkan ke Dashboard...</p>
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600" />
      </div>
    </div>
  )
}

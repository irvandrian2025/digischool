"use client"

import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

export default function RouteLoader() {
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const handleStart = () => setIsLoading(true)
    const handleComplete = () => setIsLoading(false)

    // Listen to route change events
    window.addEventListener('routeChangeStart', handleStart)
    window.addEventListener('routeChangeComplete', handleComplete)
    window.addEventListener('routeChangeError', handleComplete)

    return () => {
      window.removeEventListener('routeChangeStart', handleStart)
      window.removeEventListener('routeChangeComplete', handleComplete)
      window.removeEventListener('routeChangeError', handleComplete)
    }
  }, [])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-lg">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="mt-2 text-sm">Memuat...</p>
      </div>
    </div>
  )
}
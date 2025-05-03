"use client"

import { Inter } from "next/font/google"
// Hapus useRouter dan useEffect karena tidak lagi digunakan untuk cek sesi
// import { useRouter } from "next/navigation"
// import { useEffect } from "react"
import "../../styles/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
// Hapus getClientToken karena tidak lagi digunakan
// import { getClientToken } from "@/lib/auth"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Hapus useRouter
  // const router = useRouter()

  // Hapus seluruh useEffect untuk pemeriksaan sesi
  /*
  useEffect(() => {
    function checkSession() {
      const clientToken = getClientToken()
      const localToken = localStorage.getItem("auth-token")

      if (!clientToken || !localToken) {
        router.push("/login")
        return
      }

      const interval = setInterval(() => {
        const stillClientToken = getClientToken()
        const stillLocalToken = localStorage.getItem("auth-token")

        if (!stillClientToken || !stillLocalToken) {
          clearInterval(interval)
          router.push("/login")
        }
      }, 5 * 60 * 1000)

      return () => clearInterval(interval)
    }

    checkSession()
  }, [router])
  */

  return (
    <div className={inter.className}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        {/* Anda mungkin perlu cara lain untuk mendapatkan data user di sini jika diperlukan */}
        <Header user={{ name: "User", role: "role" }} /> 
        <div className="flex bg-gray-100 min-h-screen">
          <Sidebar />
          <main className="flex-1 p-4 md:ml-64 mt-16">
            <div className="w-full px-4 md:px-6">
              {children}
            </div>
          </main>
        </div>
      </ThemeProvider>
    </div>
  )
}

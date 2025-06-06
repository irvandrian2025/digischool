import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import RouteLoader from "@/components/ui/loader"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "DigiSchool - Sistem Pembayaran SPP",
  description: "Sistem Pembayaran SPP Digital untuk Sekolah",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <RouteLoader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

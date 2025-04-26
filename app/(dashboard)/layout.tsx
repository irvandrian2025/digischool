import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

// Mock user for development
const mockUser = {
  id: 1,
  username: "admin",
  name: "Administrator",
  role: "admin",
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Use mock user instead of getting from authentication
  const user = mockUser

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

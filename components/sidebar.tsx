"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BookOpen, Calendar, CreditCard, FileText, Home, School, Users } from "lucide-react"

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Tahun Ajaran", href: "/tahun-ajaran", icon: Calendar },
  { name: "Kelas", href: "/kelas", icon: BookOpen },
  { name: "Siswa", href: "/siswa", icon: Users },
  { name: "Tagihan", href: "/tagihan", icon: FileText },
  { name: "Pembayaran", href: "/pembayaran", icon: CreditCard },
  { name: "Users", href: "/users", icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex flex-col w-64 bg-indigo-800 text-white">
      <div className="flex items-center h-16 px-4 border-b border-indigo-700">
        <School className="h-6 w-6 mr-2" />
        <span className="text-xl font-bold">DigiSchool</span>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-sm rounded-md transition-colors",
                  isActive ? "bg-indigo-900 text-white" : "text-indigo-100 hover:bg-indigo-700",
                )}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

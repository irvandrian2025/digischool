"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BookOpen, Calendar, CreditCard, FileText, Home, School, Users } from "lucide-react"
import { useState } from "react"

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Tahun Ajaran", href: "/tahun-ajaran", icon: Calendar },
  { name: "Kelas", href: "/kelas", icon: BookOpen },
  { name: "Siswa", href: "/siswa", icon: Users },
  { name: "Tagihan", href: "/tagihan", icon: FileText },
  { name: "Pembayaran", href: "/pembayaran", icon: CreditCard },
  { name: "Users", href: "/users", icon: Users },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [showTagihanFilter, setShowTagihanFilter] = useState(false)
  const [showPembayaranFilter, setShowPembayaranFilter] = useState(false)

  const toggleSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen)
  }

  return (
    <>
      {/* Hamburger button for mobile */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white text-indigo-800 border border-indigo-800"
        onClick={toggleSidebar}
      >
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 6h16M4 12h16M4 18h16" 
          />
        </svg>
      </button>
      {/* Mobile sidebar */}
      <div className={`md:hidden fixed inset-0 z-40 ${mobileSidebarOpen ? 'block' : 'hidden'}`}>
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75" 
          onClick={() => setMobileSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-indigo-800 text-white">
          <div className="flex items-center justify-between h-16 px-4 border-b border-indigo-700">
            <div className="flex items-center">
              <School className="h-6 w-6 mr-2" />
              <span className="text-xl font-bold">DigiSchool</span>
            </div>
            <button 
              className="md:hidden p-1 rounded-md text-white hover:bg-indigo-700"
              onClick={() => setMobileSidebarOpen(false)}
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-2 space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
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
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-indigo-800 text-white fixed top-16 left-0 bottom-0 z-40">
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-2 space-y-1">
            
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => {
                      setMobileSidebarOpen(false)
                      if (['Tagihan', 'Pembayaran'].includes(item.name)) {
                        if (item.name === 'Tagihan') setShowTagihanFilter(!showTagihanFilter)
                        if (item.name === 'Pembayaran') setShowPembayaranFilter(!showPembayaranFilter)
                      }
                    }}
                    className={cn(
                      "flex items-center px-4 py-3 text-sm rounded-md transition-colors",
                      isActive ? "bg-indigo-900 text-white" : "text-indigo-100 hover:bg-indigo-700",
                    )}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                  
                  
                </div>
              )
            })}
          </nav>
        </div>
      </div>
    </>
  )
}

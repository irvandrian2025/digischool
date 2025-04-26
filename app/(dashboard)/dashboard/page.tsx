import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { executeQuery } from "@/lib/db"
import { BarChart3, CreditCard, FileText, Users } from "lucide-react"

async function getDashboardData() {
  try {
    const totalStudents = await executeQuery("SELECT COUNT(*) as count FROM siswa")
    const totalBills = await executeQuery("SELECT COUNT(*) as count FROM tagihan")
    const totalPaidBills = await executeQuery("SELECT COUNT(*) as count FROM tagihan WHERE status = $1", ["paid"])
    const totalPayments = await executeQuery("SELECT SUM(jumlah_bayar) as total FROM pembayaran")

    return {
      totalStudents: totalStudents[0]?.count || 0,
      totalBills: totalBills[0]?.count || 0,
      totalPaidBills: totalPaidBills[0]?.count || 0,
      totalPayments: totalPayments[0]?.total || 0,
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return {
      totalStudents: 0,
      totalBills: 0,
      totalPaidBills: 0,
      totalPayments: 0,
    }
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  const stats = [
    {
      title: "Total Siswa",
      value: data.totalStudents,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Total Tagihan",
      value: data.totalBills,
      icon: FileText,
      color: "bg-yellow-500",
    },
    {
      title: "Tagihan Terbayar",
      value: data.totalPaidBills,
      icon: CreditCard,
      color: "bg-green-500",
    },
    {
      title: "Total Pembayaran",
      value: `Rp ${Number(data.totalPayments || 0).toLocaleString("id-ID")}`,
      icon: BarChart3,
      color: "bg-purple-500",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Selamat datang di DigiSchool - Sistem Pembayaran SPP Digital</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`${stat.color} p-2 rounded-md`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tagihan Terbaru</CardTitle>
            <CardDescription>Daftar tagihan SPP terbaru yang belum dibayar</CardDescription>
          </CardHeader>
          <CardContent>
            {/* This would be populated with real data from the database */}
            <p className="text-sm text-muted-foreground">Belum ada data tagihan terbaru.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pembayaran Terbaru</CardTitle>
            <CardDescription>Daftar pembayaran SPP yang baru saja dilakukan</CardDescription>
          </CardHeader>
          <CardContent>
            {/* This would be populated with real data from the database */}
            <p className="text-sm text-muted-foreground">Belum ada data pembayaran terbaru.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

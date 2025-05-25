import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, CreditCard, FileText, Users } from "lucide-react"
import DashboardClient from "./dashboard-client"
import { executeQuery } from "@/lib/db"

async function getDashboardData() {
  try {
    const totalStudents = await executeQuery("SELECT COUNT(*) as count FROM siswa")
    const totalBills = await executeQuery("SELECT COUNT(*) as count FROM tagihan")
    const totalPaidBills = await executeQuery("SELECT COUNT(*) as count FROM tagihan WHERE status = $1", ["paid"])
    const totalPayments = await executeQuery("SELECT SUM(jumlah_bayar) as total FROM pembayaran")
    const latestBills = await executeQuery("SELECT t.*, s.nama as siswa_nama FROM tagihan t JOIN siswa s ON t.siswa_id = s.id WHERE t.status = 'pending' ORDER BY t.created_at DESC LIMIT 5")
    const latestPayments = await executeQuery("SELECT p.*, t.siswa_id, s.nama as siswa_nama FROM pembayaran p JOIN tagihan t ON p.tagihan_id = t.id JOIN siswa s ON t.siswa_id = s.id ORDER BY p.created_at DESC LIMIT 5")

    return {
      totalStudents: totalStudents[0]?.count || 0,
      totalBills: totalBills[0]?.count || 0,
      totalPaidBills: totalPaidBills[0]?.count || 0,
      totalPayments: totalPayments[0]?.total || 0,
      latestBills: latestBills || [],
      latestPayments: latestPayments || [],
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
  return <DashboardClient data={data} />
  
  // State untuk filter
  const [filters, setFilters] = useState({
    tahunAjaran: '',
    kelas: '',
    bulan: '',
    tahun: '',
    status: 'pending'
  })
  
  const handleSearch = async () => {
    try {
      const queryParams = []
      const queryValues = []
      
      if (filters.tahunAjaran) {
        queryParams.push('ta.nama = $' + (queryParams.length + 1))
        queryValues.push(filters.tahunAjaran)
      }
      
      if (filters.kelas) {
        queryParams.push('s.kelas_id = $' + (queryParams.length + 1))
        queryValues.push(filters.kelas)
      }
      
      if (filters.bulan) {
        queryParams.push('t.bulan = $' + (queryParams.length + 1))
        queryValues.push(filters.bulan)
      }
      
      if (filters.tahun) {
        queryParams.push('t.tahun = $' + (queryParams.length + 1))
        queryValues.push(filters.tahun)
      }
      
      if (filters.status) {
        queryParams.push('t.status = $' + (queryParams.length + 1))
        queryValues.push(filters.status)
      }
      
      const whereClause = queryParams.length > 0 ? 'WHERE ' + queryParams.join(' AND ') : ''
      
      const latestBills = await executeQuery(
        `SELECT t.*, s.nama as siswa_nama 
         FROM tagihan t 
         JOIN siswa s ON t.siswa_id = s.id 
         JOIN tahun_ajaran ta ON t.tahun_ajaran_id = ta.id 
         ${whereClause} 
         ORDER BY t.created_at DESC 
         LIMIT 5`,
        queryValues
      )
      
      // Update data dengan hasil filter
      // ...
    } catch (error) {
      console.error('Error filtering data:', error)
    }
  }

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Select 
          value={filters.tahunAjaran}
          onValueChange={(value) => setFilters({...filters, tahunAjaran: value})}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tahun Ajaran" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2023/2024">2023/2024</SelectItem>
            <SelectItem value="2024/2025">2024/2025</SelectItem>
          </SelectContent>
        </Select>
        
        <Select 
          value={filters.kelas}
          onValueChange={(value) => setFilters({...filters, kelas: value})}
        >
          <SelectTrigger>
            <SelectValue placeholder="Kelas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">Kelas 10</SelectItem>
            <SelectItem value="11">Kelas 11</SelectItem>
            <SelectItem value="12">Kelas 12</SelectItem>
          </SelectContent>
        </Select>
        
        <Select 
          value={filters.bulan}
          onValueChange={(value) => setFilters({...filters, bulan: value})}
        >
          <SelectTrigger>
            <SelectValue placeholder="Bulan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Januari">Januari</SelectItem>
            <SelectItem value="Februari">Februari</SelectItem>
            {/* Tambahkan bulan lainnya */}
          </SelectContent>
        </Select>
        
        <Select 
          value={filters.tahun}
          onValueChange={(value) => setFilters({...filters, tahun: value})}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tahun" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2023">2023</SelectItem>
            <SelectItem value="2024">2024</SelectItem>
          </SelectContent>
        </Select>
        
        <Select 
          value={filters.status}
          onValueChange={(value) => setFilters({...filters, status: value})}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
        
        <Button onClick={handleSearch} className="w-full">
          Search
        </Button>
      </div>
      
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
            {data.latestBills.length > 0 ? (
              <div className="space-y-4">
                {data.latestBills.map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{bill.siswa_nama}</p>
                      <p className="text-sm text-muted-foreground">
                        {bill.bulan} {bill.tahun} - Rp {Number(bill.nominal).toLocaleString("id-ID")}
                      </p>
                    </div>
                    <span className="text-sm text-yellow-600">Belum dibayar</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Belum ada data tagihan terbaru.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pembayaran Terbaru</CardTitle>
            <CardDescription>Daftar pembayaran SPP yang baru saja dilakukan</CardDescription>
          </CardHeader>
          <CardContent>
            {data.latestPayments.length > 0 ? (
              <div className="space-y-4">
                {data.latestPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{payment.siswa_nama}</p>
                      <p className="text-sm text-muted-foreground">
                        Rp {Number(payment.jumlah_bayar).toLocaleString("id-ID")} - {new Date(payment.tanggal_bayar).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <span className="text-sm text-green-600">Lunas</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Belum ada data pembayaran terbaru.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export { default as LaporanSppPage } from "./laporan-spp-page";

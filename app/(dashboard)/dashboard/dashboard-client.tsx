"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, CreditCard, FileText, Users, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { debounce } from "lodash"

interface DashboardData {
  totalStudents: number
  totalBills: number
  totalPaidBills: number
  totalPayments: number
  latestBills: any[]
  latestPayments: any[]
}

export default function DashboardClient({ data }: { data: DashboardData }) {
  const [filters, setFilters] = useState({
    tahunAjaran: '',
    kelas: '',
    bulan: '',
    tahun: '',
    status: 'pending'
  })
  const [kelasOptions, setKelasOptions] = useState<any[]>([]);
  const [tahunAjaranOptions, setTahunAjaranOptions] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<DashboardData>(data);
  const [isLoading, setIsLoading] = useState(false);
  const [pageBills, setPageBills] = useState(1);
  const [pagePayments, setPagePayments] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [kelasRes, tahunAjaranRes] = await Promise.all([
          fetch('/api/kelas', { cache: "no-store" }),
          fetch('/api/tahun-ajaran', { cache: "no-store" })
        ]);

        const kelasData = await kelasRes.json();
        const tahunAjaranData = await tahunAjaranRes.json();

        if (kelasRes.ok) setKelasOptions(kelasData.data || []);
        if (tahunAjaranRes.ok) setTahunAjaranOptions(tahunAjaranData.data || []);
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      }
    };
    fetchDropdownData();
  }, []);

  const debouncedSearch = debounce(async (currentFilters: typeof filters) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (currentFilters.tahunAjaran) params.append('tahun_ajaran_id', currentFilters.tahunAjaran);
      if (currentFilters.kelas) params.append('kelas_id', currentFilters.kelas);
      if (currentFilters.bulan) params.append('bulan', currentFilters.bulan);
      if (currentFilters.tahun) params.append('tahun', currentFilters.tahun);
      if (currentFilters.status) params.append('status', currentFilters.status);

      const response = await fetch(`/api/dashboard?${params.toString()}`, { cache: "no-store" });
      const result = await response.json();

      if (response.ok) {
        setFilteredData(result.data);
        setPageBills(1);
        setPagePayments(1);
      } else {
        console.error('Error filtering data:', result);
      }
    } catch (error) {
      console.error('Error filtering data:', error);
    } finally {
      setIsLoading(false);
    }
  }, 500);

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filters.tahunAjaran) params.append('tahun_ajaran_id', filters.tahunAjaran);
      if (filters.kelas) params.append('kelas_id', filters.kelas);
      if (filters.bulan) params.append('bulan', filters.bulan);
      if (filters.tahun) params.append('tahun', filters.tahun);
      if (filters.status) params.append('status', filters.status);

      const response = await fetch(`/api/dashboard?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      
      const result = await response.json();
      setFilteredData(result.data);
      setPageBills(1);
      setPagePayments(1);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleReset = () => {
    setFilters({
      tahunAjaran: '',
      kelas: '',
      bulan: '',
      tahun: '',
      status: 'pending'
    });
    setFilteredData(data);
    setPageBills(1);
    setPagePayments(1);
  }

  const stats = [
    { title: "Total Siswa", value: filteredData.totalStudents, icon: Users, color: "bg-blue-500" },
    { title: "Total Tagihan", value: filteredData.totalBills, icon: FileText, color: "bg-yellow-500" },
    { title: "Tagihan Terbayar", value: filteredData.totalPaidBills, icon: CreditCard, color: "bg-green-500" },
    { title: "Total Pembayaran", value: `Rp ${filteredData.totalPayments ? Number(filteredData.totalPayments).toLocaleString("id-ID") : "0"}`, icon: BarChart3, color: "bg-purple-500" },
  ];

  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const years = Array.from({ length: 21 }, (_, i) => `${new Date().getFullYear() - i}`);

  const paginate = (array: any[], page_number: number) => array.slice((page_number - 1) * itemsPerPage, page_number * itemsPerPage);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Selamat datang di DigiSchool - Sistem Pembayaran SPP Digital</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Select value={filters.tahunAjaran} onValueChange={(value) => setFilters({ ...filters, tahunAjaran: value })}>
          <SelectTrigger><SelectValue placeholder="Tahun Ajaran" /></SelectTrigger>
          <SelectContent>
            {tahunAjaranOptions.map((option) => (
              <SelectItem key={option.id} value={option.id.toString()}>{option.nama}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.kelas} onValueChange={(value) => setFilters({ ...filters, kelas: value })}>
          <SelectTrigger><SelectValue placeholder="Kelas" /></SelectTrigger>
          <SelectContent>
            {kelasOptions.map((option) => (
              <SelectItem key={option.id} value={option.id.toString()}>{option.nama}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.bulan} onValueChange={(value) => setFilters({ ...filters, bulan: value })}>
          <SelectTrigger><SelectValue placeholder="Bulan" /></SelectTrigger>
          <SelectContent>
            {months.map((bulan) => (
              <SelectItem key={bulan} value={bulan}>{bulan}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.tahun} onValueChange={(value) => setFilters({ ...filters, tahun: value })}>
          <SelectTrigger><SelectValue placeholder="Tahun" /></SelectTrigger>
          <SelectContent>
            {years.map((tahun) => (
              <SelectItem key={tahun} value={tahun}>{tahun}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleSearch} className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Search"}
        </Button>

        <Button onClick={handleReset} variant="outline" className="w-full">
          Reset
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`h-6 w-6 rounded-full ${stat.color} flex items-center justify-center`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tagihan Terbaru</CardTitle>
            <CardDescription>{filteredData.latestBills?.length || 0} tagihan terbaru</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredData.latestBills?.length > 0 ? (
              <div className="space-y-4">
                {paginate(filteredData.latestBills, pageBills).map((bill) => (
                  <div key={bill.id} className="border rounded-lg p-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{bill.siswa_nama}</p>
                        <p className="text-sm text-muted-foreground">{bill.bulan} {bill.tahun}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Rp {Number(bill.nominal).toLocaleString("id-ID")}</p>
                        <p className="text-sm text-muted-foreground">{bill.status}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredData.latestBills.length > itemsPerPage && (
                  <div className="flex justify-between mt-4">
                    <Button 
                      variant="outline" 
                      disabled={pageBills === 1}
                      onClick={() => setPageBills(pageBills - 1)}
                    >
                      Previous
                    </Button>
                    <Button 
                      variant="outline"
                      disabled={pageBills * itemsPerPage >= filteredData.latestBills.length}
                      onClick={() => setPageBills(pageBills + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">Tidak ada tagihan terbaru</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pembayaran Terbaru</CardTitle>
            <CardDescription>{filteredData.latestPayments?.length || 0} pembayaran terbaru</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredData.latestPayments?.length > 0 ? (
              <div className="space-y-4">
                {paginate(filteredData.latestPayments, pagePayments).map((payment) => (
                  <div key={payment.id} className="border rounded-lg p-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{payment.siswa_nama}</p>
                        <p className="text-sm text-muted-foreground">{new Date(payment.tanggal_bayar).toLocaleDateString("id-ID")}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Rp {Number(payment.jumlah_bayar).toLocaleString("id-ID")}</p>
                        <p className="text-sm text-muted-foreground">{payment.metode_pembayaran}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredData.latestPayments.length > itemsPerPage && (
                  <div className="flex justify-between mt-4">
                    <Button 
                      variant="outline" 
                      disabled={pagePayments === 1}
                      onClick={() => setPagePayments(pagePayments - 1)}
                    >
                      Previous
                    </Button>
                    <Button 
                      variant="outline"
                      disabled={pagePayments * itemsPerPage >= filteredData.latestPayments.length}
                      onClick={() => setPagePayments(pagePayments + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">Tidak ada pembayaran terbaru</p>
            )}
          </CardContent>
        </Card>
        
      </div>
    </div>
  )
}

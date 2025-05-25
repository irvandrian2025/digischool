"use client"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SiswaRow {
  id: string
  nama: string
  kelas: string
  [key: string]: any
}

interface KelasOption {
  id: string
  nama: string
}

interface TahunAjaranOption {
  id: string
  nama: string
}

interface PagingInfo {
  page: number
  perPage: number
  total: number
  totalPage: number
}

interface ApiResponse {
  success: boolean
  data: SiswaRow[]
  paging: PagingInfo
  message?: string
}

interface OptionsResponse {
  success: boolean
  data: KelasOption[] | TahunAjaranOption[]
  message?: string
}

const bulanList = [
  { key: "juli", label: "Juli" },
  { key: "agustus", label: "Agustus" },
  { key: "september", label: "September" },
  { key: "oktober", label: "Oktober" },
  { key: "november", label: "November" },
  { key: "desember", label: "Desember" },
  { key: "januari", label: "Januari" },
  { key: "februari", label: "Februari" },
  { key: "maret", label: "Maret" },
  { key: "april", label: "April" },
  { key: "mei", label: "Mei" },
  { key: "juni", label: "Juni" },
]

const LaporanSppPage = () => {
  const [kelasOptions, setKelasOptions] = useState<KelasOption[]>([])
  const [tahunAjaranOptions, setTahunAjaranOptions] = useState<TahunAjaranOption[]>([])
  const [selectedKelas, setSelectedKelas] = useState<string | undefined>()
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)
  const [loadingOptions, setLoadingOptions] = useState(false)
  const [data, setData] = useState<SiswaRow[]>([])
  const [paging, setPaging] = useState<PagingInfo>({
    page: 1,
    perPage: 10,
    total: 0,
    totalPage: 0,
  })
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  // Refs for synchronized scrolling
  const frozenBodyRef = useRef<HTMLDivElement>(null)
  const scrollableBodyRef = useRef<HTMLDivElement>(null)

  // Fetch options on component mount
  useEffect(() => {
    fetchOptions()
  }, [])

  // Synchronized scrolling: Only scrollableBodyRef should have a visible scrollbar
  useEffect(() => {
    const frozenBody = frozenBodyRef.current
    const scrollableBody = scrollableBodyRef.current

    if (!frozenBody || !scrollableBody) return

    // This handler will update frozenBody when scrollableBody scrolls
    const handleScrollableScroll = () => {
      if (frozenBody) {
        frozenBody.scrollTop = scrollableBody.scrollTop
      }
    }

    scrollableBody.addEventListener("scroll", handleScrollableScroll)

    return () => {
      scrollableBody.removeEventListener("scroll", handleScrollableScroll)
    }
  }, [data]) // Re-run effect if data changes to ensure refs are fresh

  const fetchOptions = async () => {
    try {
      setLoadingOptions(true)

      // Fetch kelas options
      const kelasResponse = await fetch("/api/kelas")
      if (kelasResponse.ok) {
        const kelasData: OptionsResponse = await kelasResponse.json()
        if (kelasData.success) {
          setKelasOptions(kelasData.data as KelasOption[])
        }
      }

      // Fetch tahun ajaran options
      const tahunResponse = await fetch("/api/tahun-ajaran")
      if (tahunResponse.ok) {
        const tahunData: OptionsResponse = await tahunResponse.json()
        if (tahunData.success) {
          setTahunAjaranOptions(tahunData.data as TahunAjaranOption[])
        }
      }
    } catch (error) {
      console.error("Error fetching options:", error)
      setError("Gagal memuat data options")
    } finally {
      setLoadingOptions(false)
    }
  }

  const fetchSppData = async (kelasId?: string, tahunAjaranId?: string, page = 1, perPage = 10) => {
    try {
      const params = new URLSearchParams()
      if (tahunAjaranId) params.append("tahun_ajaran", tahunAjaranId)
      if (kelasId) params.append("kelas_id", kelasId)
      params.append("page", page.toString())
      params.append("per_page", perPage.toString())

      const response = await fetch(`/api/laporan/spp?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ApiResponse = await response.json()

      if (!result.success) {
        throw new Error(result.message || "Gagal mengambil data")
      }

      return result
    } catch (error) {
      console.error("Error fetching SPP data:", error)
      throw error
    }
  }

  const handleCari = async (page = 1) => {
    try {
      setLoading(true)
      setError(null)
      setHasSearched(true)

      if (!selectedTahunAjaran) {
        throw new Error("Tahun ajaran wajib dipilih")
      }

      const result = await fetchSppData(selectedKelas, selectedTahunAjaran, page, 10)

      setData(result.data)
      setPaging(result.paging)
    } catch (error: any) {
      setError(error.message || "Terjadi kesalahan saat mengambil data")
      setData([])
      setPaging({ page: 1, perPage: 10, total: 0, totalPage: 0 })
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= paging.totalPage) {
      handleCari(newPage)
    }
  }

  const handleExport = async () => {
    if (!selectedTahunAjaran) {
      setError("Tahun ajaran wajib dipilih untuk export")
      return
    }

    if (paging.total === 0) {
      setError("Tidak ada data untuk di-export")
      return
    }

    try {
      setError(null)
      const params = new URLSearchParams();
      params.set('tahun_ajaran', selectedTahunAjaran);
      if (selectedKelas) params.set('kelas_id', selectedKelas);
      params.set('export', 'excel');
      
      const response = await fetch(`/api/laporan/spp/export?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Gagal mengunduh file")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `laporan-spp-${selectedTahunAjaran}${selectedKelas ? `-${selectedKelas}` : ""}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error: any) {
      setError(error.message || "Gagal mengexport data")
    }
  }

  const handleReset = () => {
    setSelectedKelas(undefined)
    setSelectedTahunAjaran(undefined)
    setData([])
    setPaging({ page: 1, perPage: 10, total: 0, totalPage: 0 })
    setError(null)
    setHasSearched(false)
  }

  const formatCurrency = (amount: number) => {
    if (amount === 0) return "-"
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleDoubleClick = (siswa: SiswaRow) => {
    if (selectedTahunAjaran) {
      window.open(`/kartu-spp/${siswa.id}?tahun_ajaran_id=${selectedTahunAjaran}`, '_blank');
    }
  }

  return (
    <div className="p-4 w-full max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h2 className="text-2xl font-bold">Laporan SPP Siswa</h2>
        <Button variant="outline" onClick={handleReset}>
          Reset Filter
        </Button>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-col min-w-0">
          <label className="text-sm font-medium mb-1">Kelas</label>
          <Select
            value={selectedKelas || "all"}
            onValueChange={(value) => setSelectedKelas(value === "all" ? undefined : value)}
            disabled={loadingOptions}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Semua Kelas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kelas</SelectItem>
              {kelasOptions.map((k) => (
                <SelectItem key={k.id} value={k.id}>
                  {k.nama}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col min-w-0">
          <label className="text-sm font-medium mb-1">
            Tahun Ajaran <span className="text-red-500">*</span>
          </label>
          <Select
            value={selectedTahunAjaran || ""}
            onValueChange={(value) => setSelectedTahunAjaran(value || undefined)}
            disabled={loadingOptions}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Pilih Tahun Ajaran" />
            </SelectTrigger>
            <SelectContent>
              {tahunAjaranOptions.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.nama}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end gap-2">
          <Button onClick={() => handleCari(1)} disabled={loading || loadingOptions || !selectedTahunAjaran}>
            {loading ? "Memuat..." : "Cari"}
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={paging.total === 0 || loading}>
            Export Excel
          </Button>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

      {loadingOptions && (
        <div className="text-center py-8">
          <p className="text-gray-600">Memuat data options...</p>
        </div>
      )}

      {/* Responsive Table Container with Frozen Columns */}
      <div className="w-full max-w-full border rounded-lg bg-white shadow-sm overflow-hidden">
        <div className="flex max-w-full">
          {/* Frozen Columns Container */}
          <div className="flex-shrink-0 sticky left-0 z-20 bg-white" style={{ width: '470px' }}>
            {/* Frozen Header */}
            <div className="sticky top-0 z-30">
              <div className="flex bg-gray-100 border-b border-gray-300 h-[88px]">
                <div className="w-10 border-r border-gray-300 flex items-center justify-center">
                  <span className="text-sm font-semibold">No</span>
                </div>
                <div className="w-[225px] border-r border-gray-300 flex items-center justify-center px-2 text-center"> {/* Adjusted width */}
                  <span className="text-sm font-semibold">Nama Siswa</span>
                </div>
                <div className="w-[73px] border-r border-gray-300 flex items-center justify-center px-2 text-center">
                  <span className="text-sm font-semibold">Kelas</span>
                </div>
                <div className="flex-1 border-r border-gray-300 flex items-center justify-center px-2 text-center">
                  <span className="text-sm font-semibold">Action</span>
                </div>
              </div>
            </div>

            {/* Frozen Body */}
            {/* IMPORTANT: Use overflow-y-hidden here to ensure no scrollbar is visible */}
            <div ref={frozenBodyRef} className="max-h-96 overflow-y-hidden overflow-x-hidden">
              {loading ? (
                Array.from({ length: 10 }).map((_, idx) => (
                  <div key={`loading-frozen-${idx}`} className="flex h-12 border-b border-gray-300 animate-pulse">
                    <div className="w-12 border-r border-gray-300 bg-gray-50"></div>
                    <div className="w-[250px] border-r border-gray-300 bg-gray-50"></div> {/* Adjusted width */}
                    <div className="w-[80px] border-r border-gray-300 bg-gray-50"></div>
                    <div className="flex-1 border-r border-gray-300 bg-gray-50"></div>
                  </div>
                ))
              ) : data.length > 0 ? (
                data.map((row, index) => (
                  <div
                    key={row.id}
                    className="flex h-12 border-b border-gray-300 hover:bg-gray-100 cursor-pointer" // Added hover:bg-gray-100
                    onDoubleClick={() => handleDoubleClick(row)}
                  >
                    <div className="w-11 border-r border-gray-300 flex items-center justify-center bg-white">
                      <span className="text-sm">{index + 1 + (paging.page - 1) * paging.perPage}</span>
                    </div>
                    <div className="w-[257px] border-r border-gray-300 flex items-center px-2 bg-white"> {/* Adjusted width */}
                      <span className="text-sm truncate" title={row.nama}>
                        {row.nama}
                      </span>
                    </div>
                    <div className="w-[80px] border-r border-gray-300 flex items-center px-2 bg-white">
                      <span className="text-sm truncate" title={row.kelas}>
                        {row.kelas}
                      </span>
                    </div>
                    <div className="flex-1 border-r border-gray-300 flex items-center justify-center px-2 bg-white gap-1">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-7 px-2 text-xs w-14" // Added w-14 for fixed width
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`/kartu-spp/${row.id}?tahun_ajaran_id=${selectedTahunAjaran}`, '_blank');
                        }}
                      >
                        Kartu
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white h-7 px-2 text-xs w-14" // Added w-14 for fixed width
                        onClick={(e) => {
                          e.stopPropagation();
                          const message = `📣 *REMINDER PEMBAYARAN SPP* 📣\n\nAssalamu'alaikum warahmatullahi wabarakatuh\n\nYth. Bapak/Ibu Orang Tua/Wali dari:\n*${row.nama}*\n\nBerikut tautan kartu SPP digital Ananda:\nuntuk tahun ajaran : ${row.tahun_ajaran_nama}\n${window.location.origin}/kartu-iuran/${row.id}?tahun_ajaran_id=${selectedTahunAjaran}\n\n*Informasi:*\n- Tautan bersifat pribadi (jangan dibagikan)\n- Cek pembayaran SPP bulanan melalui link tersebut\n- Jika tautan tidak bisa dibuka, mohon save terlebih dahulu nomor ini\n\nJika mengalami kendala, silakan hubungi nomor ini.\n\nTerima kasih atas perhatian dan kerjasamanya.\n\nWassalamu'alaikum warahmatullahi wabarakatuh\n\n_Salam,_\n*Admin Sekolah*`;
                          window.open(`https://wa.me/${row.no_hp}?text=${encodeURIComponent(message)}`, '_blank');
                        }}
                      >
                        WA
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center text-gray-500 py-12 h-full">
                  <span>Tidak ada data</span>
                </div>
              )}
            </div>
          </div>

          {/* Scrollable Columns Container */}
          <div
            className="flex-1 min-w-0 overflow-x-auto overflow-y-auto" // This is where the main vertical scrollbar will be
            style={{ maxWidth: "calc(100vw - 320px - 480px)" }} // Adjusted maxWidth based on new frozen column width
          >
            <div className="min-w-max">
              {/* Scrollable Header */}
              <div className="bg-gray-100 border-b border-gray-300 sticky top-0 z-10">
                {/* Main month headers */}
                <div className="flex h-12 border-b border-gray-300">
                  {bulanList.map((bulan) => (
                    <div
                      key={bulan.key}
                      className="w-60 border-r border-gray-300 bg-gray-100 flex items-center justify-center flex-shrink-0"
                    >
                      <span className="text-sm font-semibold">{bulan.label}</span>
                    </div>
                  ))}
                </div>

                {/* Sub headers */}
                <div className="flex h-10">
                  {bulanList.map((bulan) => (
                    <div
                      key={`${bulan.key}-sub`}
                      className="w-60 border-r border-gray-300 flex flex-shrink-0"
                    >
                      <div className="w-20 border-r border-gray-300 bg-gray-100 flex items-center justify-center">
                        <span className="text-xs font-medium">Tagihan</span>
                      </div>
                      <div className="w-20 border-r border-gray-300 bg-gray-100 flex items-center justify-center">
                        <span className="text-xs font-medium">Pembayaran</span>
                      </div>
                      <div className="w-20 bg-gray-100 flex items-center justify-center">
                        <span className="text-xs font-medium">Status</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scrollable Body */}
              <div ref={scrollableBodyRef} className="max-h-96 overflow-y-auto overflow-x-hidden">
                {loading ? (
                  <div className="flex items-center justify-center text-gray-500 py-12">
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                      <span>Memuat data...</span>
                    </div>
                  </div>
                ) : data.length > 0 ? (
                  data.map((row) => (
                    <div key={row.id} className="flex border-b border-gray-300 hover:bg-gray-100 h-12"> {/* Added hover:bg-gray-100 */}
                      {bulanList.map((bulan) => (
                        <div
                          key={`${row.id}-${bulan.key}`}
                          className="w-60 border-r border-gray-300 flex flex-shrink-0 bg-white"
                        >
                          <div className="w-20 border-r border-gray-300 flex items-center justify-center px-1">
                            <div className="text-xs truncate" title={formatCurrency(row?.[bulan.key]?.tagihan || 0)}>
                              {formatCurrency(row?.[bulan.key]?.tagihan || 0)}
                            </div>
                          </div>
                          <div className="w-20 border-r border-gray-300 flex items-center justify-center px-1">
                            <div className="text-xs truncate" title={formatCurrency(row?.[bulan.key]?.pembayaran || 0)}>
                              {formatCurrency(row?.[bulan.key]?.pembayaran || 0)}
                            </div>
                          </div>
                          <div className="w-20 flex items-center justify-center px-1">
                            <span
                              className={`text-xs font-medium ${row?.[bulan.key]?.status === "Lunas"
                                ? "text-green-600"
                                : row?.[bulan.key]?.status === "Belum"
                                  ? "text-red-600"
                                  : row?.[bulan.key]?.status === "Kurang"
                                    ? "text-orange-600"
                                    : "text-gray-500"
                                }`}
                            >
                              {row?.[bulan.key]?.status || "-"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center text-gray-500 py-12">
                    {hasSearched
                      ? "Tidak ada data yang ditemukan"
                      : "Pilih tahun ajaran dan klik Cari untuk menampilkan data"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {hasSearched && paging.totalPage > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 px-2 gap-4">
          <div className="text-sm text-gray-700">
            Menampilkan {(paging.page - 1) * paging.perPage + 1} -{" "}
            {Math.min(paging.page * paging.perPage, paging.total)} dari {paging.total} entri
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(paging.page - 1)}
              disabled={paging.page <= 1 || loading}
            >
              Sebelumnya
            </Button>

            {/* Page Numbers */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, paging.totalPage) }, (_, i) => {
                let pageNum
                if (paging.totalPage <= 5) {
                  pageNum = i + 1
                } else if (paging.page <= 3) {
                  pageNum = i + 1
                } else if (paging.page >= paging.totalPage - 2) {
                  pageNum = paging.totalPage - 4 + i
                } else {
                  pageNum = paging.page - 2 + i
                }

                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === paging.page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    disabled={loading}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(paging.page + 1)}
              disabled={paging.page >= paging.totalPage || loading}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default LaporanSppPage
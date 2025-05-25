import { executeQuery } from "@/lib/db"
import { KartuSppClient } from "./kartu-spp-client"

// This is a server component that fetches data
export default async function KartuSppPage({ params, searchParams }: { params: { id: string }, searchParams: { tahun_ajaran_id?: string } }) {
  try {
    const siswaId = params.id
    const tahunAjaranId = searchParams.tahun_ajaran_id

    // Get siswa data
    const siswaResult = await executeQuery(
      `
      SELECT s.*, k.nama as kelas_nama
      FROM siswa s
      LEFT JOIN kelas k ON s.kelas_id = k.id
      WHERE s.id = $1
    `,
      [siswaId],
    )

    if (siswaResult.length === 0) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-600 mb-6">Data siswa tidak ditemukan</p>
          </div>
        </div>
      )
    }

    const siswa = siswaResult[0]

    // Get tahun ajaran data
    const tahunAjaranResult = await executeQuery(
      `
      SELECT *
      FROM tahun_ajaran
      WHERE id = $1
    `,
      [tahunAjaranId],
    )

    const tahunAjaran = tahunAjaranResult.length > 0 ? tahunAjaranResult[0] : null

    // Get tagihan data for the specified tahun ajaran
    let tagihan = []
    if (tahunAjaran) {
      tagihan = await executeQuery(
        `
        SELECT t.*
        FROM tagihan t
        WHERE t.siswa_id = $1 AND t.tahun_ajaran_id = $2
        ORDER BY t.tahun, CASE 
          WHEN t.bulan = 'Juli' THEN 1
          WHEN t.bulan = 'Agustus' THEN 2
          WHEN t.bulan = 'September' THEN 3
          WHEN t.bulan = 'Oktober' THEN 4
          WHEN t.bulan = 'November' THEN 5
          WHEN t.bulan = 'Desember' THEN 6
          WHEN t.bulan = 'Januari' THEN 7
          WHEN t.bulan = 'Februari' THEN 8
          WHEN t.bulan = 'Maret' THEN 9
          WHEN t.bulan = 'April' THEN 10
          WHEN t.bulan = 'Mei' THEN 11
          WHEN t.bulan = 'Juni' THEN 12
        END
      `,
        [siswaId, tahunAjaran.id],
      )
    }

    // Pass the data to the client component
    return <KartuSppClient siswa={siswa} tahunAjaran={tahunAjaran} tagihan={tagihan} />
  } catch (error) {
    console.error("Error fetching kartu SPP:", error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">Failed to fetch kartu SPP</p>
        </div>
      </div>
    )
  }
}

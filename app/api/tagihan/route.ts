import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

// GET all tagihan with filters
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const tahunAjaranId = url.searchParams.get("tahun_ajaran_id")
    const kelasId = url.searchParams.get("kelas_id")
    const status = url.searchParams.get("status")
    const bulan = url.searchParams.get("bulan")
    const tahun = url.searchParams.get("tahun")

    let query = `
      SELECT t.*, s.nama as siswa_nama, s.nis as siswa_nis, k.nama as kelas_nama, ta.nama as tahun_ajaran_nama
      FROM tagihan t
      JOIN siswa s ON t.siswa_id = s.id
      JOIN kelas k ON s.kelas_id = k.id
      JOIN tahun_ajaran ta ON t.tahun_ajaran_id = ta.id
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1

    if (tahunAjaranId) {
      query += ` AND t.tahun_ajaran_id = $${paramIndex}`
      params.push(tahunAjaranId)
      paramIndex++
    }

    if (kelasId) {
      query += ` AND s.kelas_id = $${paramIndex}`
      params.push(kelasId)
      paramIndex++
    }

    if (status) {
      query += ` AND t.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    if (bulan) {
      query += ` AND t.bulan = $${paramIndex}`
      params.push(bulan)
      paramIndex++
    }

    if (tahun) {
      query += ` AND t.tahun = $${paramIndex}`
      params.push(tahun)
      paramIndex++
    }

    query += ` ORDER BY t.tahun, CASE 
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
    END, s.nama`

    const result = await executeQuery(query, params)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Error fetching tagihan:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch tagihan" }, { status: 500 })
  }
}

// POST create new tagihan (12 rows for a full year)
export async function POST(request: Request) {
  try {
    const { siswa_id, tahun_ajaran_id } = await request.json()

    if (!siswa_id || !tahun_ajaran_id) {
      return NextResponse.json({ success: false, message: "Siswa dan tahun ajaran harus diisi" }, { status: 400 })
    }

    // Get tahun ajaran details
    const tahunAjaranResult = await executeQuery("SELECT * FROM tahun_ajaran WHERE id = $1", [tahun_ajaran_id])
    if (tahunAjaranResult.length === 0) {
      return NextResponse.json({ success: false, message: "Tahun ajaran tidak ditemukan" }, { status: 404 })
    }
    const tahunAjaran = tahunAjaranResult[0]

    // Get siswa details
    const siswaResult = await executeQuery("SELECT * FROM siswa WHERE id = $1", [siswa_id])
    if (siswaResult.length === 0) {
      return NextResponse.json({ success: false, message: "Siswa tidak ditemukan" }, { status: 404 })
    }

    // Parse tahun ajaran name to get start and end years
    const tahunAjaranParts = tahunAjaran.nama.split("/")
    if (tahunAjaranParts.length !== 2) {
      return NextResponse.json(
        { success: false, message: "Format tahun ajaran tidak valid (harus dalam format YYYY/YYYY)" },
        { status: 400 },
      )
    }

    const startYear = Number.parseInt(tahunAjaranParts[0])
    const endYear = Number.parseInt(tahunAjaranParts[1])

    if (isNaN(startYear) || isNaN(endYear)) {
      return NextResponse.json(
        { success: false, message: "Format tahun ajaran tidak valid (harus dalam format YYYY/YYYY)" },
        { status: 400 },
      )
    }

    // Check if tagihan already exists for this student and academic year
    const existingTagihan = await executeQuery(
      "SELECT COUNT(*) as count FROM tagihan WHERE siswa_id = $1 AND tahun_ajaran_id = $2",
      [siswa_id, tahun_ajaran_id],
    )

    if (Number.parseInt(existingTagihan[0].count) > 0) {
      return NextResponse.json(
        { success: false, message: "Tagihan untuk siswa dan tahun ajaran ini sudah ada" },
        { status: 400 },
      )
    }

    // Define months and their corresponding years
    const months = [
      { name: "Juli", year: startYear },
      { name: "Agustus", year: startYear },
      { name: "September", year: startYear },
      { name: "Oktober", year: startYear },
      { name: "November", year: startYear },
      { name: "Desember", year: startYear },
      { name: "Januari", year: endYear },
      { name: "Februari", year: endYear },
      { name: "Maret", year: endYear },
      { name: "April", year: endYear },
      { name: "Mei", year: endYear },
      { name: "Juni", year: endYear },
    ]

    // Create 12 tagihan entries
    const createdTagihan = []
    for (const month of months) {
      // Calculate due date (15th of each month)
      const dueDate = new Date(month.year, getMonthIndex(month.name), 15)
      const formattedDueDate = dueDate.toISOString().split("T")[0]

      const result = await executeQuery(
        `
        INSERT INTO tagihan (
          siswa_id, tahun_ajaran_id, bulan, tahun, nominal, status, 
          tanggal_jatuh_tempo, keterangan
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
        `,
        [
          siswa_id,
          tahun_ajaran_id,
          month.name,
          month.year,
          tahunAjaran.nominal_spp,
          "pending",
          formattedDueDate,
          `Tagihan SPP ${month.name} ${month.year}`,
        ],
      )

      createdTagihan.push(result[0])
    }

    return NextResponse.json({
      success: true,
      message: "Tagihan berhasil dibuat untuk 12 bulan",
      data: createdTagihan,
    })
  } catch (error) {
    console.error("Error creating tagihan:", error)
    return NextResponse.json({ success: false, message: "Failed to create tagihan" }, { status: 500 })
  }
}

// Helper function to get month index (0-11) from month name
function getMonthIndex(monthName: string): number {
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ]
  return months.indexOf(monthName)
}

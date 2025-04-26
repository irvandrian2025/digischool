import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

// GET all pembayaran with filters
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const tagihanId = url.searchParams.get("tagihan_id")
    const siswaId = url.searchParams.get("siswa_id")
    const status = url.searchParams.get("status")
    const startDate = url.searchParams.get("start_date")
    const endDate = url.searchParams.get("end_date")

    let query = `
      SELECT p.*, t.bulan, t.tahun, t.nominal as tagihan_nominal, t.status as tagihan_status,
      s.nama as siswa_nama, s.nis as siswa_nis, k.nama as kelas_nama, ta.nama as tahun_ajaran_nama
      FROM pembayaran p
      JOIN tagihan t ON p.tagihan_id = t.id
      JOIN siswa s ON t.siswa_id = s.id
      JOIN kelas k ON s.kelas_id = k.id
      JOIN tahun_ajaran ta ON t.tahun_ajaran_id = ta.id
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1

    if (tagihanId) {
      query += ` AND p.tagihan_id = $${paramIndex}`
      params.push(tagihanId)
      paramIndex++
    }

    if (siswaId) {
      query += ` AND t.siswa_id = $${paramIndex}`
      params.push(siswaId)
      paramIndex++
    }

    if (status) {
      query += ` AND t.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    if (startDate) {
      query += ` AND p.tanggal_bayar >= $${paramIndex}`
      params.push(startDate)
      paramIndex++
    }

    if (endDate) {
      query += ` AND p.tanggal_bayar <= $${paramIndex}`
      params.push(endDate)
      paramIndex++
    }

    query += ` ORDER BY p.tanggal_bayar DESC`

    const result = await executeQuery(query, params)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Error fetching pembayaran:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch pembayaran" }, { status: 500 })
  }
}

// POST create new pembayaran
export async function POST(request: Request) {
  try {
    const { tagihan_id, tanggal_bayar, metode_pembayaran, jumlah_bayar, bukti_pembayaran, keterangan } =
      await request.json()

    if (!tagihan_id || !tanggal_bayar || !metode_pembayaran || !jumlah_bayar) {
      return NextResponse.json(
        { success: false, message: "Tagihan, tanggal bayar, metode pembayaran, dan jumlah bayar harus diisi" },
        { status: 400 },
      )
    }

    // Check if tagihan exists
    const tagihanCheck = await executeQuery("SELECT * FROM tagihan WHERE id = $1", [tagihan_id])
    if (tagihanCheck.length === 0) {
      return NextResponse.json({ success: false, message: "Tagihan tidak ditemukan" }, { status: 404 })
    }

    // Check if tagihan already has a payment
    const paymentCheck = await executeQuery("SELECT COUNT(*) as count FROM pembayaran WHERE tagihan_id = $1", [
      tagihan_id,
    ])
    if (Number.parseInt(paymentCheck[0].count) > 0) {
      return NextResponse.json({ success: false, message: "Tagihan ini sudah memiliki pembayaran" }, { status: 400 })
    }

    // Create payment
    const result = await executeQuery(
      `
      INSERT INTO pembayaran (tagihan_id, tanggal_bayar, metode_pembayaran, jumlah_bayar, bukti_pembayaran, keterangan)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [tagihan_id, tanggal_bayar, metode_pembayaran, jumlah_bayar, bukti_pembayaran, keterangan],
    )

    // Update tagihan status to paid
    await executeQuery("UPDATE tagihan SET status = 'paid', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [tagihan_id])

    return NextResponse.json({
      success: true,
      message: "Pembayaran berhasil dibuat",
      data: result[0],
    })
  } catch (error) {
    console.error("Error creating pembayaran:", error)
    return NextResponse.json({ success: false, message: "Failed to create pembayaran" }, { status: 500 })
  }
}
